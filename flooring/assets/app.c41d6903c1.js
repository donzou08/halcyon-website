/*
 * The base script.
 *
 * Eight jobs: the header's hairline, the WhatsApp composer, the section
 * reveals where the browser has no scroll-driven animation, the product
 * story's state, the pricing toggle, the sticky bar, the one video loop, and
 * the decision to fetch the cinema bundle. Everything it does is an
 * enhancement. With scripting off every WhatsApp link still opens a chat with
 * the first sentence written, every product story reads as a vertical strip of
 * real screens with its captions, the pricing cards stand in their yearly
 * state, and the page reads top to bottom.
 *
 * No dependencies and no build step. The whole file is smaller than the
 * smallest library that would otherwise do any one of these.
 */
;(function () {
  'use strict'

  var doc = document
  var root = doc.documentElement
  var cfg = window.__HALCYON__ || {}
  var mq = window.matchMedia
  var reduced = mq && mq('(prefers-reduced-motion: reduce)').matches
  var slice = function (list) {
    return [].slice.call(list)
  }

  /* ---------------------------------------------------------------- *
   * The cinema bundle.
   *
   * GSAP, ScrollTrigger and Lenis, in one file, fetched only on a desktop
   * pointer and only when reduced motion has not been asked for. A phone never
   * sees it, which is the whole reason the site can afford it at all.
   *
   * `cine` was stamped on the document by the inline boot script, before the
   * first paint, so the hero's own parts are held for the bundle's timeline
   * rather than playing the CSS entrance and then being taken over halfway
   * through. If the bundle does not arrive, this puts every one of them back.
   * ---------------------------------------------------------------- */

  function cinemaFailed() {
    root.classList.remove('cine')
    var held = slice(doc.querySelectorAll('.hero-title, .cine-hold'))
    for (var i = 0; i < held.length; i++) held[i].style.opacity = '1'
  }

  if (root.classList.contains('cine') && cfg.cinema) {
    var failsafe = setTimeout(cinemaFailed, 2500)
    var s = doc.createElement('script')
    s.src = cfg.cinema
    s.defer = true
    s.onload = function () {
      clearTimeout(failsafe)
      if (!root.classList.contains('cinema')) cinemaFailed()
    }
    s.onerror = function () {
      clearTimeout(failsafe)
      cinemaFailed()
    }
    doc.head.appendChild(s)
  } else if (root.classList.contains('cine')) {
    cinemaFailed()
  }

  /* ---------------------------------------------------------------- *
   * The header's hairline. It appears once the page has moved, and the
   * header itself never resizes, collapses or transforms.
   * ---------------------------------------------------------------- */

  var top = doc.querySelector('[data-top]')
  if (top) {
    var paintTop = function () {
      if (window.scrollY > 4) top.setAttribute('data-scrolled', '')
      else top.removeAttribute('data-scrolled')
    }
    paintTop()
    window.addEventListener('scroll', paintTop, { passive: true })
  }

  /* ---------------------------------------------------------------- *
   * Analytics. Loaded on idle, and only if an ID is configured.
   * ---------------------------------------------------------------- */

  var idle =
    window.requestIdleCallback ||
    function (fn) {
      return setTimeout(fn, 1500)
    }

  function loadScript(src) {
    var el = doc.createElement('script')
    el.async = true
    el.src = src
    doc.head.appendChild(el)
  }

  idle(function () {
    if (cfg.ga4) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function () {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', cfg.ga4)
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4))
    }
    if (cfg.metaPixel) {
      var n = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      })
      if (!window._fbq) window._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      loadScript('https://connect.facebook.net/en_US/fbevents.js')
      window.fbq('init', cfg.metaPixel)
      window.fbq('track', 'PageView')
    }
  })

  function track(what) {
    if (window.gtag) {
      window.gtag('event', 'whatsapp_click', { page: cfg.page || '', trade: what })
    }
    if (window.fbq) window.fbq('track', 'Contact')
  }

  /* ---------------------------------------------------------------- *
   * The composer.
   *
   * One question with an answer already chosen, and a message that is visible
   * and editable before it goes. Changing the trade rewrites the message,
   * unless the visitor has typed in it, at which point it is theirs and we
   * stop touching it.
   *
   * Only this card's own button follows the box. Every other WhatsApp link on
   * the page keeps the opener the server wrote into it, which names the page
   * it was tapped from, and that is more use to whoever answers.
   * ---------------------------------------------------------------- */

  var composer = doc.querySelector('[data-composer]')
  var msgBox = doc.querySelector('[data-msg]')
  var sendLink = doc.querySelector('[data-wa-send]')
  var waLinks = slice(doc.querySelectorAll('[data-wa]'))
  var trade = composer ? composer.querySelector('.chip[aria-checked="true"]') : null
  var dirty = false

  function composed() {
    var word = trade ? trade.getAttribute('data-word') : ''
    return word
      ? 'Hello Halcyon. We are a ' + word + ' contractor. I would like to see Halcyon Quote.'
      : 'Hello Halcyon. I would like to see Halcyon Quote.'
  }

  function refresh() {
    if (!msgBox) return
    if (!dirty) msgBox.value = composed()
    if (sendLink) {
      sendLink.href = 'https://wa.me/' + cfg.wa + '?text=' + encodeURIComponent(msgBox.value)
    }
  }

  function pick(chip, focus) {
    if (!chip || chip === trade) return
    var all = slice(composer.querySelectorAll('.chip'))
    for (var i = 0; i < all.length; i++) {
      var on = all[i] === chip
      all[i].setAttribute('aria-checked', on ? 'true' : 'false')
      all[i].setAttribute('tabindex', on ? '0' : '-1')
    }
    trade = chip
    if (focus) chip.focus()
    refresh()
  }

  if (composer && msgBox) {
    composer.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.chip') : null
      if (chip) pick(chip, false)
    })

    /* Arrow keys move between the chips, which is what a radio group does. */
    composer.addEventListener('keydown', function (e) {
      var chip = e.target.closest ? e.target.closest('.chip') : null
      if (!chip) return
      var all = slice(composer.querySelectorAll('.chip'))
      var i = all.indexOf(chip)
      var to = null
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (i + 1) % all.length
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (i - 1 + all.length) % all.length
      else if (e.key === 'Home') to = 0
      else if (e.key === 'End') to = all.length - 1
      else return
      e.preventDefault()
      pick(all[to], true)
    })

    msgBox.addEventListener('input', function () {
      dirty = true
      refresh()
    })

    refresh()
  }

  for (var w = 0; w < waLinks.length; w++) {
    waLinks[w].addEventListener('click', function () {
      track(trade ? trade.getAttribute('data-trade') : '')
    })
  }

  /* ---------------------------------------------------------------- *
   * The product story.
   *
   * One `at` per story, and four things write to it: the scroll, the step
   * titles, the two arrows and the keyboard. It lives here rather than in the
   * cinema bundle so that clicking a step behaves identically on a machine
   * that never fetches GSAP, and so that there is exactly one answer to the
   * question of which state is showing.
   *
   * The geometry is the stylesheet's. This reads which marker is crossing the
   * middle of the viewport, paints, and when somebody drives it by hand it
   * scrolls the window to the middle of that state's own zone so the scroll
   * and the controls can never disagree afterwards.
   * ---------------------------------------------------------------- */

  function pad(n) {
    return String(n).padStart ? String(n).padStart(2, '0') : (n < 10 ? '0' : '') + n
  }

  /** Scroll the window, through Lenis where the bundle is running. */
  function glide(y) {
    if (reduced) {
      window.scrollTo(0, y)
      return
    }
    if (window.__HQ_LENIS) window.__HQ_LENIS.scrollTo(y, { duration: 0.45 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  function arrowState(btn, off) {
    if (!btn) return
    if (off) btn.setAttribute('aria-disabled', 'true')
    else btn.removeAttribute('aria-disabled')
  }

  slice(doc.querySelectorAll('[data-seq]')).forEach(function (section) {
    var hints = slice(section.querySelectorAll('[data-seq-hint]'))
    var spent = false
    function spend() {
      if (spent) return
      spent = true
      for (var i = 0; i < hints.length; i++) hints[i].setAttribute('data-off', '')
    }

    /* ---------------- the stuck stage ---------------- */

    var track = section.querySelector('[data-seq-track]')
    if (track) {
      var screens = slice(track.querySelectorAll('.seq-screens > *'))
      var tabs = slice(track.querySelectorAll('[data-seq-tab]'))
      var caps = slice(track.querySelectorAll('[data-seq-cap]'))
      var fill = track.querySelector('[data-seq-fill]')
      var count = track.querySelector('[data-seq-count]')
      var prev = track.querySelector('[data-seq-prev]')
      var next = track.querySelector('[data-seq-next]')
      var marks = slice(track.querySelectorAll('[data-seq-mark]'))
      var n = screens.length
      var at = -1

      var measure = function () {
        if (!fill || !tabs.length) return
        var base = tabs[0].offsetHeight || 44
        fill.style.setProperty('--seq-fill-h', base + 'px')
        return base
      }

      var paint = function (i) {
        if (i === at || i < 0 || i > n - 1) return
        at = i
        for (var k = 0; k < n; k++) {
          var on = k === i
          if (screens[k]) {
            if (on) {
              screens[k].setAttribute('data-on', '')
              screens[k].removeAttribute('aria-hidden')
              screens[k].inert = false
            } else {
              screens[k].removeAttribute('data-on')
              screens[k].setAttribute('aria-hidden', 'true')
              screens[k].inert = true
            }
          }
          if (tabs[k]) {
            tabs[k].setAttribute('aria-selected', on ? 'true' : 'false')
            tabs[k].setAttribute('tabindex', on ? '0' : '-1')
            tabs[k].setAttribute('data-state', k < i ? 'done' : on ? 'on' : 'next')
          }
          if (caps[k]) caps[k].hidden = !on
        }
        if (count) count.textContent = pad(i + 1) + ' / ' + pad(n)
        arrowState(prev, i === 0)
        arrowState(next, i === n - 1)
        if (fill && tabs[i]) {
          var base = Number(String(fill.style.getPropertyValue('--seq-fill-h')).replace('px', ''))
          if (!base) base = measure() || 44
          fill.style.setProperty('--seq-fill-y', tabs[i].offsetTop + 'px')
          fill.style.setProperty('--seq-fill-s', (tabs[i].offsetHeight / base).toFixed(4))
        }
      }

      /*
       * Where a state's own zone is centred, in document coordinates.
       *
       * The markers tile the track from its top, one zone each, and the
       * observer below reads whichever one is crossing the middle line of the
       * viewport. So the position at which state i is unambiguously the
       * current one is the middle of its zone, less half a screen. Driving a
       * step by hand goes exactly there, which is why a click never fights the
       * scroll afterwards.
       */
      var offsetOf = function (i) {
        var zone = parseFloat(getComputedStyle(track).getPropertyValue('--seq-zone')) || 850
        var top = track.getBoundingClientRect().top + window.scrollY
        return Math.max(0, Math.round(top + (i + 0.5) * zone - window.innerHeight / 2))
      }

      var drive = function (i, focus) {
        if (i < 0 || i > n - 1) return
        spend()
        paint(i)
        glide(offsetOf(i))
        if (focus && tabs[i]) tabs[i].focus({ preventScroll: true })
      }

      for (var ti = 0; ti < tabs.length; ti++) {
        ;(function (i) {
          tabs[i].addEventListener('click', function () {
            drive(i, false)
          })
        })(ti)
      }

      if (prev) {
        prev.addEventListener('click', function () {
          if (prev.getAttribute('aria-disabled') === 'true') return
          drive(at - 1, false)
        })
      }
      if (next) {
        next.addEventListener('click', function () {
          if (next.getAttribute('aria-disabled') === 'true') return
          drive(at + 1, false)
        })
      }

      /* Roving tabindex, automatic activation. Tab leaves the rail entirely
         and lands on the previous arrow, which is the next thing in the DOM. */
      var rail = track.querySelector('[role="tablist"]')
      if (rail) {
        rail.addEventListener('keydown', function (e) {
          var to = null
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = at + 1
          else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = at - 1
          else if (e.key === 'Home') to = 0
          else if (e.key === 'End') to = n - 1
          else if (e.key === 'Enter' || e.key === ' ') to = at
          else return
          if (to < 0 || to > n - 1) {
            e.preventDefault()
            return
          }
          e.preventDefault()
          drive(to, true)
        })
      }

      if (marks.length && 'IntersectionObserver' in window) {
        /* The root is collapsed to a line across the middle of the viewport,
           and the markers tile the track without a gap, so exactly one of them
           is crossing that line at any moment and no amount of scroll speed
           can skip a state. */
        var io = new IntersectionObserver(
          function (entries) {
            for (var i = 0; i < entries.length; i++) {
              if (!entries[i].isIntersecting) continue
              paint(Number(entries[i].target.getAttribute('data-seq-mark')))
            }
          },
          { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
        )
        for (var m = 0; m < marks.length; m++) io.observe(marks[m])

        /* The hint goes on 40px of scroll inside the pinned range, which is
           the reader answering it. */
        var startedAt = null
        window.addEventListener(
          'scroll',
          function () {
            if (spent) return
            var box = track.getBoundingClientRect()
            if (box.top > 0 || box.bottom < window.innerHeight) {
              startedAt = null
              return
            }
            if (startedAt === null) startedAt = window.scrollY
            else if (Math.abs(window.scrollY - startedAt) > 40) spend()
          },
          { passive: true },
        )
      }

      measure()
      paint(0)
      window.addEventListener('resize', function () {
        measure()
        var was = at
        at = -1
        paint(was < 0 ? 0 : was)
      })
    }

    /* ---------------- the snap strip ---------------- */

    var strip = section.querySelector('[data-seq-strip]')
    if (strip) {
      var slides = slice(strip.children)
      var dots = slice(section.querySelectorAll('[data-strip-dot]'))
      var sprev = section.querySelector('[data-strip-prev]')
      var snext = section.querySelector('[data-strip-next]')
      var sn = slides.length
      var sat = 0

      var stripLive = function () {
        return getComputedStyle(strip).display === 'flex'
      }

      var mark = function (i) {
        if (i === sat || i < 0 || i > sn - 1) return
        sat = i
        for (var k = 0; k < sn; k++) {
          if (!dots[k]) continue
          dots[k].setAttribute('aria-selected', k === i ? 'true' : 'false')
          dots[k].setAttribute('tabindex', k === i ? '0' : '-1')
        }
        arrowState(sprev, i === 0)
        arrowState(snext, i === sn - 1)
      }

      /*
       * The strip is scrolled directly, never through scrollIntoView.
       *
       * A slide is taller than a phone viewport, so `block: "nearest"` was not
       * the no-op it looks like: pressing a dot scrolled the PAGE vertically to
       * fit the slide, and the dot row the thumb was resting on left the screen
       * with it. Pressing a control must never move that control. Setting
       * scrollLeft on the strip itself cannot touch the page's own scroll.
       */
      var centre = function (i, smooth) {
        var sRect = strip.getBoundingClientRect()
        var iRect = slides[i].getBoundingClientRect()
        var left =
          strip.scrollLeft + (iRect.left - sRect.left) - (sRect.width - iRect.width) / 2
        try {
          strip.scrollTo({ left: left, behavior: smooth ? 'smooth' : 'auto' })
        } catch (e) {
          strip.scrollLeft = left
        }
      }

      var goTo = function (i, focus) {
        if (i < 0 || i > sn - 1) return
        spend()
        mark(i)
        centre(i, !reduced)
        if (focus && dots[i]) dots[i].focus({ preventScroll: true })
      }

      for (var di = 0; di < dots.length; di++) {
        ;(function (i) {
          dots[i].addEventListener('click', function () {
            goTo(i, false)
          })
        })(di)
      }
      if (sprev) {
        sprev.addEventListener('click', function () {
          if (sprev.getAttribute('aria-disabled') === 'true') return
          goTo(sat - 1, false)
        })
      }
      if (snext) {
        snext.addEventListener('click', function () {
          if (snext.getAttribute('aria-disabled') === 'true') return
          goTo(sat + 1, false)
        })
      }
      var dotRail = section.querySelector('.seq-dots')
      if (dotRail) {
        dotRail.addEventListener('keydown', function (e) {
          var to = null
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = sat + 1
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = sat - 1
          else if (e.key === 'Home') to = 0
          else if (e.key === 'End') to = sn - 1
          else return
          e.preventDefault()
          goTo(to, true)
        })
      }

      if ('IntersectionObserver' in window) {
        var sio = new IntersectionObserver(
          function (entries) {
            if (!stripLive()) return
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) mark(slides.indexOf(entries[i].target))
            }
          },
          { root: strip, threshold: 0.62 },
        )
        for (var s3 = 0; s3 < slides.length; s3++) sio.observe(slides[s3])
      }
      strip.addEventListener('scroll', spend, { passive: true })
      mark(0)
      arrowState(sprev, true)
      arrowState(snext, sn < 2)
    }
  })

  /* ---------------------------------------------------------------- *
   * An answer, opened by its own link.
   *
   * Every question carries an id. A link that names one opens it and scrolls
   * to it, which is what "How the percentage is worked out" promised and did
   * not do: it landed a reader at the top of twelve closed questions and left
   * them to find the fourth. The scroll-margin the stylesheet puts on anything
   * with an id is what clears the sticky header.
   * ---------------------------------------------------------------- */

  function openHash() {
    var id = (location.hash || '').replace(/^#/, '')
    if (!id) return
    var el = null
    try {
      el = doc.getElementById(decodeURIComponent(id))
    } catch (e) {
      el = doc.getElementById(id)
    }
    if (!el || el.tagName !== 'DETAILS') return
    el.open = true
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  /* On load after the layout has settled, and again whenever the fragment
     changes, because a same-page link fires no navigation. */
  if (doc.readyState === 'complete') setTimeout(openHash, 60)
  else window.addEventListener('load', function () {
    setTimeout(openHash, 60)
  })
  window.addEventListener('hashchange', openHash)

  /* ---------------------------------------------------------------- *
   * The pricing toggle.
   *
   * Both states are already in the page, so this only decides which one is
   * shown. Nothing is computed, so a number here cannot drift from the number
   * in the copy, and with scripting off the yearly state stands.
   * ---------------------------------------------------------------- */

  var billing = doc.querySelector('[data-billing]')
  if (billing) {
    var thumb = billing.querySelector('[data-toggle-thumb]')
    var tabs = slice(billing.querySelectorAll('[data-billing-set]'))

    var setBilling = function (state) {
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i].getAttribute('data-billing-set') === state
        tabs[i].setAttribute('aria-pressed', on ? 'true' : 'false')
        if (on && thumb) {
          thumb.style.transform = 'translateX(' + (tabs[i].offsetLeft - 3) + 'px)'
        }
      }
      var shown = slice(doc.querySelectorAll('.plan-price > *'))
      for (var j = 0; j < shown.length; j++) {
        var live = shown[j].className.indexOf('plan-' + state) !== -1
        if (live) {
          shown[j].removeAttribute('data-off')
          shown[j].removeAttribute('aria-hidden')
          shown[j].inert = false
        } else {
          shown[j].setAttribute('data-off', '')
          shown[j].setAttribute('aria-hidden', 'true')
          shown[j].inert = true
        }
      }
      /* The note is one line, not a cross-fade, so `hidden` can do its own job
         there and take the sentence out of the tree the way it should. */
      var notes = slice(doc.querySelectorAll('.plan-note > span'))
      for (var k = 0; k < notes.length; k++) {
        notes[k].hidden = notes[k].className.indexOf('plan-' + state) === -1
      }
    }

    for (var b = 0; b < tabs.length; b++) {
      tabs[b].addEventListener('click', function (e) {
        setBilling(e.currentTarget.getAttribute('data-billing-set'))
      })
    }
    setBilling('yearly')
    window.addEventListener('resize', function () {
      var on = billing.querySelector('[aria-pressed="true"]')
      if (on) setBilling(on.getAttribute('data-billing-set'))
    })
  }

  /* ---------------------------------------------------------------- *
   * Section reveals, where the browser has no scroll-driven animation.
   * ---------------------------------------------------------------- */

  var reveals = slice(doc.querySelectorAll('.reveal'))
  if (root.classList.contains('no-sda') && reveals.length) {
    if ('IntersectionObserver' in window && !reduced) {
      var revealIO = new IntersectionObserver(
        function (entries, obs) {
          for (var i = 0; i < entries.length; i++) {
            if (!entries[i].isIntersecting) continue
            entries[i].target.setAttribute('data-seen', '')
            obs.unobserve(entries[i].target)
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
      )
      for (var r = 0; r < reveals.length; r++) revealIO.observe(reveals[r])
    } else {
      for (var r2 = 0; r2 < reveals.length; r2++) reveals[r2].setAttribute('data-seen', '')
    }
  }

  /* ---------------------------------------------------------------- *
   * The staggered rise, for the rows of feature cards.
   *
   * Not the same job as `.reveal`. That one runs on a scroll timeline where a
   * delay is a fraction of a range, and three cards side by side cross that
   * range together, so they arrive together and the row lands as one slab.
   * This gives each card its own start, 90ms behind the one before it, from
   * one observer for the whole page. The delay is in the stylesheet, keyed off
   * the index the build wrote on the card, so nothing is timed from here.
   *
   * It runs whether or not the browser has scroll-driven animation, because it
   * is not a fallback for anything. Under reduced motion, or with no observer,
   * every card is put on its final frame at once.
   * ---------------------------------------------------------------- */

  var risers = slice(doc.querySelectorAll('.rise'))
  if (risers.length) {
    if ('IntersectionObserver' in window && !reduced) {
      var riseIO = new IntersectionObserver(
        function (entries, obs) {
          for (var i = 0; i < entries.length; i++) {
            if (!entries[i].isIntersecting) continue
            entries[i].target.setAttribute('data-seen', '')
            obs.unobserve(entries[i].target)
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      )
      for (var ri = 0; ri < risers.length; ri++) riseIO.observe(risers[ri])
    } else {
      for (var ri2 = 0; ri2 < risers.length; ri2++) risers[ri2].setAttribute('data-seen', '')
    }
  }

  /* ---------------------------------------------------------------- *
   * The one loop on the site.
   * ---------------------------------------------------------------- */

  var loop = doc.querySelector('[data-loop]')
  if (loop && !reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries, obs) {
        if (!entries[0].isIntersecting) return
        obs.disconnect()
        loop.src = loop.getAttribute('data-src')
        var p = loop.play()
        if (p && p.catch) p.catch(function () {})
      },
      { rootMargin: '200px 0px', threshold: 0 },
    ).observe(loop)
  }

  /* ---------------------------------------------------------------- *
   * The sticky bar. It arrives once the hero's own buttons have gone.
   * ---------------------------------------------------------------- */

  var bar = doc.querySelector('[data-stickybar]')
  /*
   * It carries the page's one action, and only where the page is not already
   * carrying it.
   *
   * Two identical navy buttons on one screen is two primaries and no primary,
   * and with a dark accent that rule stopped being tidiness and became the
   * thing salience rests on. So the bar watches every WhatsApp button on the
   * page except its own, rather than the hero's alone: the pricing page has no
   * hero and three card buttons, and the bar used to sit under them from the
   * first pixel.
   */
  var anchors = slice(doc.querySelectorAll('.btn-wa')).filter(function (el) {
    return bar ? !bar.contains(el) : false
  })
  if (bar && anchors.length && 'IntersectionObserver' in window) {
    var seen = anchors.map(function () {
      return false
    })
    var barIO = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          seen[anchors.indexOf(entries[i].target)] = entries[i].isIntersecting
        }
        var any = false
        for (var k = 0; k < seen.length; k++) if (seen[k]) any = true
        if (any) bar.removeAttribute('data-on')
        else bar.setAttribute('data-on', '')
      },
      { threshold: 0 },
    )
    for (var an = 0; an < anchors.length; an++) barIO.observe(anchors[an])
  }
})()
