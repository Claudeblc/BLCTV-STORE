(function() {
    'use strict';

    // ============================================
    // TV FIXES v41 - BLC TV Player
    // - Navigation ULTRA rapide (zero allocation, requestAnimationFrame)
    // - Focus bleu néon ultra visible
    // - Paramètres: chaque section focusable individuellement
    // - Samsung remote mapping complet
    // - Back button fix
    // - FIX: Retirer focus barre de chargement Live TV
    // - FIX: Play/Pause avec OK télécommande pour VOD
    // - FIX: HLS recovery amélioré (buffering/saccades)
    // - FIX: Défilement horizontal des vignettes catégories/favoris
    //   (swipe tactile + flèches télécommande + clavier)
    // - FIX v40: Carousel overflow fix for Tizen OS
    //   Force overflow-x:auto on carousel containers that have inline overflow:visible
    // - FIX v41: Live TV - Vue Mosaïque (grille) + Vue Liste (rectangles horizontaux)
    //   Toggle entre les deux modes, EPG info visible dans les deux
    // ============================================

    // --- Samsung TV Remote Key Codes ---
    var SK = {
        ENTER: 13, RETURN: 10009, EXIT: 10182,
        PLAY: 415, PAUSE: 19, STOP: 413, FF: 417, RW: 412,
        CH_UP: 427, CH_DOWN: 428,
        INFO: 457, MENU: 18, TOOLS: 10135,
        RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406,
        UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39
    };

    // --- Detect TV mode ---
    var isTV = /AndroidTV|TV|AFTT|AFTM|AFTS|BRAVIA|SmartTV|Tizen|Web0S/i.test(navigator.userAgent) ||
               (window.innerWidth >= 960 && !('ontouchstart' in window));

    // --- Inject CSS ---
    var css = document.createElement('style');
    css.id = 'tv-fixes-css';
    css.textContent = [
        '/* TV Safe Area */',
        'body.tv-mode #root { padding: 2.5vh 2.5vw; box-sizing: border-box; max-height: 100vh; overflow-y: auto; overflow-x: hidden; }',

        '/* EPG text bigger */',
        'body.tv-mode [class*="text-[10px]"] { font-size: 14px !important; line-height: 1.4 !important; }',
        'body.tv-mode [class*="text-[9px]"] { font-size: 13px !important; }',
        'body.tv-mode [class*="text-xs"] { font-size: 14px !important; }',

        '/* Disable ALL outlines */',
        'body.tv-mode *:focus { outline: none !important; }',

        '/* FIX: Retirer focus de la barre de chargement / progress / range */',
        'body.tv-mode progress:focus, body.tv-mode input[type="range"]:focus, body.tv-mode [role="progressbar"]:focus, body.tv-mode [role="slider"]:focus {',
        '  box-shadow: none !important; outline: none !important; transform: none !important; z-index: auto !important;',
        '}',
        'body.tv-mode progress, body.tv-mode input[type="range"], body.tv-mode [role="progressbar"], body.tv-mode [role="slider"] {',
        '  pointer-events: none !important;',
        '}',

        '/* Generic focus: dark border + neon blue glow */',
        'body.tv-mode button:focus, body.tv-mode a:focus, body.tv-mode [tabindex="0"]:focus, body.tv-mode [role="button"]:focus {',
        '  outline: none !important;',
        '  box-shadow: 0 0 0 4px rgba(0,0,0,0.85), 0 0 0 7px rgba(0,140,255,1), 0 0 15px rgba(0,140,255,0.7), 0 0 30px rgba(0,140,255,0.4), 0 0 50px rgba(0,140,255,0.2) !important;',
        '  border-radius: 8px !important; position: relative; z-index: 100 !important;',
        '  transition: box-shadow 0.1s ease-out, transform 0.1s ease-out !important;',
        '  transform: scale(1.03) !important;',
        '}',

        '/* Watch button: EXTRA strong focus */',
        'body.tv-mode .tv-watch-btn:focus {',
        '  box-shadow: 0 0 0 5px rgba(0,0,0,0.9), 0 0 0 9px rgba(0,160,255,1), 0 0 0 11px rgba(0,160,255,0.6), 0 0 25px rgba(0,160,255,0.8), 0 0 50px rgba(0,160,255,0.5), 0 0 80px rgba(0,160,255,0.3) !important;',
        '  border-radius: 10px !important; transform: scale(1.08) !important; z-index: 200 !important;',
        '  animation: tv-neon-pulse 1.5s ease-in-out infinite !important;',
        '}',
        '@keyframes tv-neon-pulse {',
        '  0%,100% { box-shadow: 0 0 0 5px rgba(0,0,0,0.9), 0 0 0 9px rgba(0,160,255,1), 0 0 0 11px rgba(0,160,255,0.6), 0 0 25px rgba(0,160,255,0.8), 0 0 50px rgba(0,160,255,0.5), 0 0 80px rgba(0,160,255,0.3); }',
        '  50% { box-shadow: 0 0 0 5px rgba(0,0,0,0.9), 0 0 0 9px rgba(0,180,255,1), 0 0 0 12px rgba(0,180,255,0.7), 0 0 35px rgba(0,180,255,0.9), 0 0 60px rgba(0,180,255,0.6), 0 0 100px rgba(0,180,255,0.4); }',
        '}',

        '/* Cards focus */',
        'body.tv-mode .tv-card:focus {',
        '  box-shadow: 0 0 0 3px rgba(0,0,0,0.85), 0 0 0 6px rgba(0,140,255,0.9), 0 0 20px rgba(0,140,255,0.5), 0 0 40px rgba(0,140,255,0.2) !important;',
        '  transform: scale(1.05) !important; z-index: 50 !important;',
        '}',

        '/* Nav items focus */',
        'body.tv-mode nav a:focus, body.tv-mode nav button:focus {',
        '  background: rgba(0,140,255,0.2) !important;',
        '  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.8), inset 0 0 0 4px rgba(0,140,255,0.9), 0 0 15px rgba(0,140,255,0.4) !important;',
        '  border-radius: 8px !important;',
        '}',

        '/* Settings: each section focusable */',
        'body.tv-mode [class*="settings"] [class*="card"], body.tv-mode [class*="settings"] [class*="section"],',
        'body.tv-mode [class*="Settings"] > div > div { cursor: pointer; }',
        'body.tv-mode .tv-settings-item:focus {',
        '  box-shadow: 0 0 0 3px rgba(0,0,0,0.85), 0 0 0 6px rgba(0,140,255,0.9), 0 0 15px rgba(0,140,255,0.5) !important;',
        '  border-radius: 8px !important; transform: scale(1.01) !important; z-index: 50 !important;',
        '}',

        '/* Overflow fix */',
        '[class*="truncate"] { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }',

        '/* DISABLE smooth scroll on TV (causes lag) */',
        'body.tv-mode * { scroll-behavior: auto !important; }',

        '/* Disable hover transitions on TV */',
        'body.tv-mode *:hover { transition-duration: 0s !important; }',

        '/* Disable ALL CSS animations on non-focused elements for performance */',
        'body.tv-mode *:not(:focus) { animation-duration: 0s !important; animation-delay: 0s !important; }',
        'body.tv-mode *:focus { animation-duration: 1.5s !important; }',

        '/* Disable backdrop blur (GPU heavy on TV) */',
        'body.tv-mode [class*="backdrop-blur"] { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: rgba(0,0,0,0.85) !important; }',

        '/* Reduce box-shadow complexity on non-focused elements */',
        'body.tv-mode *:not(:focus) { box-shadow: none !important; }',
        'body.tv-mode .tv-card:not(:focus), body.tv-mode button:not(:focus), body.tv-mode a:not(:focus) { box-shadow: none !important; }',

        '/* Force GPU compositing for focusable elements */',
        'body.tv-mode button, body.tv-mode a, body.tv-mode [tabindex="0"] { will-change: transform; transform: translateZ(0); }',

        '/* Shaking favorites stay visible */',
        '[class*="animate-[tvShake"], [style*="tvShake"] { z-index: 30 !important; }',

        '',
        '/* ============================================ */',
        '/* FIX v40: CAROUSEL OVERFLOW FIX FOR TIZEN OS */',
        '/* Force correct overflow on carousel containers */',
        '/* The React code sets inline style overflow:"visible" which breaks scroll */',
        '/* ============================================ */',
        '',
        '/* Force overflow-x:auto on all flex carousel rows with overflow-x-auto class */',
        '.overflow-x-auto { overflow-x: auto !important; overflow-y: hidden !important; }',
        '',
        '/* Fix the parent container that also has overflow:visible inline */',
        '[data-loc*="Home.tsx:856"], [data-loc*="Home.tsx:775"] { overflow: hidden !important; }',
        '.content-section { overflow: hidden !important; }',
        '',
        '/* Ensure flex items in carousels don\'t shrink and stay in a row */',
        '.overflow-x-auto > .flex-shrink-0 { flex-shrink: 0 !important; }',
        '.overflow-x-auto > div { flex-shrink: 0 !important; }',
        '',
        '/* Hide scrollbar on Tizen */',
        '.no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }',
        '.no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }',
        '',
        '/* Ensure the main content area clips overflow */',
        'main { overflow-x: hidden !important; overflow-y: auto !important; }',
        '',
        '/* Fix carousel row containers - force proper clipping */',
        '.group\\/scroll { overflow: hidden !important; }',
        '[class*="group/scroll"] { overflow: hidden !important; }',
        '',
        '/* Ensure data-tv-row containers scroll properly */',
        '[data-tv-row] { overflow-x: auto !important; overflow-y: hidden !important; -webkit-overflow-scrolling: touch !important; }',
        '',
        '/* Fix: prevent content from overflowing the viewport */',
        'body.tv-mode .min-h-screen { max-width: 100vw !important; overflow-x: hidden !important; }'

    ].join('\n');
    document.head.appendChild(css);

    if (isTV) document.body.classList.add('tv-mode');

    // ============================================
    // FIX v40: FORCE CORRECT OVERFLOW ON CAROUSEL CONTAINERS
    // The React compiled code sets inline style overflow:"visible" 
    // which overrides the CSS class overflow-x-auto.
    // We need to fix this via JavaScript after React renders.
    // ============================================
    function fixCarouselOverflow() {
        // Fix all elements that have overflow-x-auto class but inline overflow:visible
        var carousels = document.querySelectorAll('.overflow-x-auto, [data-tv-row]');
        for (var i = 0; i < carousels.length; i++) {
            var el = carousels[i];
            // Force correct overflow via inline style (overrides React's inline style)
            if (el.style.overflow === 'visible' || el.style.overflow === '') {
                el.style.overflow = '';
                el.style.overflowX = 'auto';
                el.style.overflowY = 'hidden';
            }
            // Also fix via setProperty for higher specificity
            el.style.setProperty('overflow-x', 'auto', 'important');
            el.style.setProperty('overflow-y', 'hidden', 'important');
        }

        // Fix parent containers that have overflow:visible
        var parents = document.querySelectorAll('[data-loc*="Home.tsx:856"], [data-loc*="Home.tsx:775"]');
        for (var j = 0; j < parents.length; j++) {
            parents[j].style.setProperty('overflow', 'hidden', 'important');
        }

        // Fix the group/scroll wrapper containers
        var scrollGroups = document.querySelectorAll('[class*="group/scroll"]');
        for (var k = 0; k < scrollGroups.length; k++) {
            scrollGroups[k].style.setProperty('overflow', 'hidden', 'important');
        }

        // Fix main element
        var mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.style.setProperty('overflow-x', 'hidden', 'important');
        }

        // Fix content-section elements
        var sections = document.querySelectorAll('.content-section');
        for (var s = 0; s < sections.length; s++) {
            sections[s].style.setProperty('overflow', 'hidden', 'important');
        }
    }

    // Run fix immediately and on every DOM change
    var _carouselFixTimer = null;
    var carouselFixObserver = new MutationObserver(function() {
        if (_carouselFixTimer) return;
        _carouselFixTimer = setTimeout(function() {
            _carouselFixTimer = null;
            fixCarouselOverflow();
        }, 100);
    });

    // Start observing after DOM is ready
    if (document.body) {
        carouselFixObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            carouselFixObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        });
    }

    // Run fix at multiple intervals to catch late-loading content
    setTimeout(fixCarouselOverflow, 100);
    setTimeout(fixCarouselOverflow, 500);
    setTimeout(fixCarouselOverflow, 1000);
    setTimeout(fixCarouselOverflow, 2000);
    setTimeout(fixCarouselOverflow, 5000);
    setInterval(fixCarouselOverflow, 3000); // Keep fixing every 3s in case React re-renders

    // ============================================
    // ULTRA-FAST SPATIAL NAVIGATION
    // Pre-computed grid, zero GC pressure
    // ============================================

    var _focusEls = [];
    var _focusRects = [];
    var _cacheTs = 0;
    var _CACHE_MS = 300;

    // Helper: find the closest scrollable horizontal container for an element
    function findScrollableParent(el) {
        var node = el.parentElement;
        while (node && node !== document.body) {
            var style = window.getComputedStyle(node);
            var overflowX = style.overflowX;
            if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth + 10) {
                return node;
            }
            // Also check for Tailwind overflow-x-auto class
            if (node.classList && (node.classList.contains('overflow-x-auto') || node.classList.contains('overflow-x-scroll'))) {
                if (node.scrollWidth > node.clientWidth + 10) return node;
            }
            // Also check data-tv-row attribute
            if (node.hasAttribute && node.hasAttribute('data-tv-row')) {
                if (node.scrollWidth > node.clientWidth + 10) return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    // Helper: check if element is inside a horizontal scroll container
    function isInHorizontalScroller(el) {
        return !!findScrollableParent(el);
    }

    function rebuildCache(forceIncludeOffscreenH) {
        var now = Date.now();
        if (!forceIncludeOffscreenH && now - _cacheTs < _CACHE_MS && _focusEls.length > 0) return;
        _cacheTs = now;

        var sel = 'button:not([disabled]),a[href]:not([disabled]),[tabindex="0"]:not([disabled]),input:not([disabled]):not([type="range"]),select:not([disabled]),[role="button"]:not([disabled])';
        // FIX: Exclude progress bars, range inputs, sliders from focusable elements
        var raw = document.querySelectorAll(sel);
        var els = [], rects = [];

        for (var i = 0; i < raw.length; i++) {
            var el = raw[i];
            // FIX: Skip progress bars, range inputs, sliders, seekbars
            if (el.tagName === 'PROGRESS' || el.tagName === 'METER') continue;
            if (el.tagName === 'INPUT' && el.type === 'range') continue;
            if (el.getAttribute('role') === 'progressbar' || el.getAttribute('role') === 'slider') continue;
            if (el.classList && (el.classList.contains('seekbar') || el.classList.contains('progress-bar') || el.classList.contains('loading-bar'))) continue;
            if (el.offsetWidth === 0 && el.offsetHeight === 0) continue;
            var r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            // Only visible elements within viewport (with margin)
            if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
            // For horizontal: allow elements far off-screen horizontally IF they are inside a scrollable container
            if (r.right < -200 || r.left > window.innerWidth + 200) {
                if (!forceIncludeOffscreenH || !isInHorizontalScroller(el)) continue;
            }
            els.push(el);
            rects.push(r);
        }
        _focusEls = els;
        _focusRects = rects;
    }

    function navigate(dir) {
        // For left/right, check if current element is in a horizontal scroller
        var cur = document.activeElement;
        var inHScroller = cur && (dir === 2 || dir === 3) && isInHorizontalScroller(cur);

        // If navigating left/right inside a horizontal scroller, rebuild cache including off-screen siblings
        if (inHScroller) {
            var scroller = findScrollableParent(cur);
            // Pre-scroll the container to reveal more items in the direction
            if (scroller) {
                var scrollAmount = scroller.clientWidth * 0.6;
                if (dir === 3) { // right
                    scroller.scrollLeft += scrollAmount;
                } else { // left
                    scroller.scrollLeft -= scrollAmount;
                }
            }
            // Wait a frame for layout to update, then rebuild with extended range
            _cacheTs = 0; // force rebuild
            rebuildCache(true);
        } else {
            rebuildCache();
        }

        cur = document.activeElement;
        var ci = _focusEls.indexOf(cur);
        var cr;

        if (ci >= 0) {
            cr = _focusEls[ci] === cur ? cur.getBoundingClientRect() : _focusRects[ci];
        } else if (cur && cur !== document.body) {
            cr = cur.getBoundingClientRect();
        } else {
            // Nothing focused: focus first visible element
            if (_focusEls.length > 0) _focusEls[0].focus();
            return true;
        }

        var cx = (cr.left + cr.right) * 0.5;
        var cy = (cr.top + cr.bottom) * 0.5;
        var best = -1, bestScore = 1e9;

        // For horizontal navigation inside a scroller, find siblings in the same row
        if (inHScroller) {
            var scroller = findScrollableParent(cur);
            // Get all focusable children of this scroller
            var siblings = scroller ? scroller.querySelectorAll('a[href], button, [tabindex="0"]') : [];
            for (var s = 0; s < siblings.length; s++) {
                var sib = siblings[s];
                if (sib === cur) continue;
                if (sib.offsetWidth === 0 && sib.offsetHeight === 0) continue;
                var sr = sib.getBoundingClientRect();
                if (sr.width === 0 || sr.height === 0) continue;
                var sdx = (sr.left + sr.right) * 0.5 - cx;
                var sdy = (sr.top + sr.bottom) * 0.5 - cy;
                var sValid = false;
                var sPDist;
                if (dir === 2) { sValid = sdx < -5; sPDist = -sdx; }   // left
                else if (dir === 3) { sValid = sdx > 5; sPDist = sdx; } // right
                if (sValid) {
                    // Prefer items on the same vertical level (same row)
                    var sScore = sPDist + Math.abs(sdy) * 5;
                    if (sScore < bestScore) { bestScore = sScore; best = -2; /* marker */ }
                }
            }
            // If found a sibling, navigate to it
            if (best === -2) {
                bestScore = 1e9;
                var bestSib = null;
                for (var s2 = 0; s2 < siblings.length; s2++) {
                    var sib2 = siblings[s2];
                    if (sib2 === cur) continue;
                    if (sib2.offsetWidth === 0 && sib2.offsetHeight === 0) continue;
                    var sr2 = sib2.getBoundingClientRect();
                    if (sr2.width === 0 || sr2.height === 0) continue;
                    var sdx2 = (sr2.left + sr2.right) * 0.5 - cx;
                    var sdy2 = (sr2.top + sr2.bottom) * 0.5 - cy;
                    var sValid2 = false;
                    var sPDist2;
                    if (dir === 2) { sValid2 = sdx2 < -5; sPDist2 = -sdx2; }
                    else if (dir === 3) { sValid2 = sdx2 > 5; sPDist2 = sdx2; }
                    if (sValid2) {
                        var sScore2 = sPDist2 + Math.abs(sdy2) * 5;
                        if (sScore2 < bestScore) { bestScore = sScore2; bestSib = sib2; }
                    }
                }
                if (bestSib) {
                    bestSib.focus({ preventScroll: true });
                    // Scroll the container to center the focused element
                    scrollContainerToElement(scroller, bestSib);
                    // Also scroll vertically if needed
                    bestSib.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                    return true;
                }
            }
        }

        // Standard spatial navigation (for all directions, or when not in scroller)
        best = -1;
        bestScore = 1e9;
        for (var i = 0; i < _focusEls.length; i++) {
            if (i === ci || _focusEls[i] === cur) continue;
            var r = _focusRects[i];
            var ex = (r.left + r.right) * 0.5;
            var ey = (r.top + r.bottom) * 0.5;
            var dx = ex - cx;
            var dy = ey - cy;

            var valid = false;
            var pDist, sDist;

            if (dir === 0) { valid = dy < -5; pDist = -dy; sDist = Math.abs(dx); }       // up
            else if (dir === 1) { valid = dy > 5; pDist = dy; sDist = Math.abs(dx); }     // down
            else if (dir === 2) { valid = dx < -5; pDist = -dx; sDist = Math.abs(dy); }   // left
            else { valid = dx > 5; pDist = dx; sDist = Math.abs(dy); }                     // right

            if (valid) {
                var score = pDist + sDist * 2.5;
                if (score < bestScore) { bestScore = score; best = i; }
            }
        }

        if (best >= 0) {
            var target = _focusEls[best];
            target.focus({ preventScroll: true });
            // If target is inside a horizontal scroller, scroll the container
            var targetScroller = findScrollableParent(target);
            if (targetScroller) {
                scrollContainerToElement(targetScroller, target);
            }
            // Instant scroll (no smooth - too slow on TV)
            target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            return true;
        }
        return false;
    }

    // Scroll a horizontal container so the target element is centered/visible
    function scrollContainerToElement(container, element) {
        if (!container || !element) return;
        var containerRect = container.getBoundingClientRect();
        var elementRect = element.getBoundingClientRect();
        var elementCenter = (elementRect.left + elementRect.right) / 2;
        var containerCenter = (containerRect.left + containerRect.right) / 2;
        var offset = elementCenter - containerCenter;
        container.scrollLeft += offset;
    }

    // --- Tag elements ---
    function tagElements() {
        // Watch buttons
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
            var t = btns[i].textContent.trim();
            if (t.indexOf('Regarder') === 0 || t === 'Lecture' || t === 'Play') {
                btns[i].classList.add('tv-watch-btn');
            }
        }
        // Cards
        var cards = document.querySelectorAll('[class*="cursor-pointer"], [class*="overflow-hidden"][class*="rounded"]');
        for (var j = 0; j < cards.length; j++) {
            if (!cards[j].getAttribute('tabindex') && cards[j].offsetWidth > 50) {
                cards[j].setAttribute('tabindex', '0');
                cards[j].classList.add('tv-card');
            }
        }
        // Settings sections: make each individually focusable
        tagSettingsSections();
        // Invalidate cache
        _cacheTs = 0;
        // Also fix carousel overflow after tagging
        fixCarouselOverflow();
    }

    // --- Settings: make each section focusable individually ---
    function tagSettingsSections() {
        var path = window.location.pathname;
        if (path.indexOf('/settings') === -1 && path.indexOf('/parametres') === -1) return;

        // Find all setting card/section containers
        var containers = document.querySelectorAll(
            '[class*="rounded"][class*="bg-"], [class*="card"], [class*="border"][class*="p-"]'
        );
        for (var i = 0; i < containers.length; i++) {
            var c = containers[i];
            // Only tag containers that have a heading or label inside
            var hasHeading = c.querySelector('h2, h3, h4, label, [class*="font-semibold"], [class*="font-bold"]');
            if (hasHeading && !c.classList.contains('tv-settings-item') && c.offsetHeight > 40) {
                c.setAttribute('tabindex', '0');
                c.classList.add('tv-settings-item');
                // Make inner selects/inputs focusable too
                var inputs = c.querySelectorAll('select, input, button');
                for (var k = 0; k < inputs.length; k++) {
                    if (!inputs[k].getAttribute('tabindex')) {
                        inputs[k].setAttribute('tabindex', '0');
                    }
                }
            }
        }
    }

    // --- Auto-focus "Regarder" on detail pages ---
    function autoFocusWatch() {
        if (!isTV) return;
        var btn = document.querySelector('.tv-watch-btn');
        if (btn) { btn.focus(); return true; }
        return false;
    }

    // --- MutationObserver (debounced) ---
    var _obTimer = null;
    var obs = new MutationObserver(function() {
        if (_obTimer) return; // Already scheduled
        _obTimer = setTimeout(function() {
            _obTimer = null;
            tagElements();
            var p = window.location.pathname;
            if (p.indexOf('/movie/') !== -1 || p.indexOf('/series/') !== -1 || p.indexOf('/episode/') !== -1) {
                setTimeout(autoFocusWatch, 150);
            }
        }, 200);
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // --- History / back management ---
    var navStack = [];
    var lastPath = window.location.pathname;

    function pushSafe() {
        window.history.pushState({ tvApp: true }, '', window.location.href);
    }
    pushSafe(); pushSafe();

    setInterval(function() {
        var cp = window.location.pathname;
        if (cp !== lastPath) {
            navStack.push(lastPath);
            lastPath = cp;
            pushSafe();
            setTimeout(tagElements, 200);
        }
    }, 300);

    function handleBack(e) {
        if (e) e.preventDefault();
        // 1. Exit fullscreen
        var fs = document.fullscreenElement || document.webkitFullscreenElement;
        if (fs) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return true; }
        // 2. Close dialog/modal
        var dlg = document.querySelector('[role="dialog"], [data-state="open"], [class*="DialogOverlay"]');
        if (dlg) {
            var cb = dlg.querySelector('button[class*="close"], button[aria-label="Close"], button[aria-label="Fermer"]');
            if (cb) { cb.click(); return true; }
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
            return true;
        }
        // 3. Go back
        var p = window.location.pathname;
        if (p !== '/' && p !== '/home') {
            if (navStack.length > 0) window.location.href = navStack.pop();
            else window.location.href = '/';
            return true;
        }
        // 4. Home: don't exit
        pushSafe();
        return true;
    }

    window.addEventListener('popstate', function(e) { handleBack(e); pushSafe(); });

    // ============================================
    // MAIN KEYDOWN HANDLER
    // Uses capture phase, minimal processing
    // ============================================
    var _lastKeyTime = 0;
    var _KEY_THROTTLE = 80; // ms between key repeats (fast but no double-fire)

    document.addEventListener('keydown', function(e) {
        var kc = e.keyCode || e.which;
        var key = e.key;
        var now = Date.now();

        // === BYPASS: When player is active, let the player handle its own keys ===
        var playerActive = !!window.__PLAYER_ACTIVE__;
        var onPlayerRoute = window.location.pathname.startsWith('/player/');
        if (playerActive && onPlayerRoute) {
            // Determine if this is a VOD route (movie/series) vs live
            var isVodRoute = window.location.pathname.includes('/player/movie/') || window.location.pathname.includes('/player/series/') || window.location.pathname.includes('/player/vod/');
            var isLiveRoute = window.location.pathname.includes('/player/live/');

            // FIX: OK/Enter toggles Play/Pause for VOD on all apps
            if (key === 'Enter' || kc === SK.ENTER || kc === 13) {
                var vid = document.querySelector('video');
                if (vid) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (vid.paused) { vid.play(); } else { vid.pause(); }
                    // Also dispatch event so React player UI can update
                    window.dispatchEvent(new CustomEvent('tv:media-playpause'));
                    return;
                }
            }

            // Only handle Samsung-specific keycodes that the player doesn't know about
            // Map Samsung remote keycodes to standard keys so the player can understand them
            if (kc === SK.RETURN) {
                // Let the player handle back/escape
                var backEvt = new KeyboardEvent('keydown', { key: 'GoBack', code: 'GoBack', keyCode: 27, bubbles: true, cancelable: true });
                window.dispatchEvent(backEvt);
                return;
            }
            if (kc === SK.UP && key !== 'ArrowUp') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })); return; }
            if (kc === SK.DOWN && key !== 'ArrowDown') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); return; }
            if (kc === SK.LEFT && key !== 'ArrowLeft') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); return; }
            if (kc === SK.RIGHT && key !== 'ArrowRight') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); return; }
            if (kc === SK.ENTER && key !== 'Enter') {
                // Samsung Enter → toggle play/pause in player
                var vid2 = document.querySelector('video');
                if (vid2) {
                    e.preventDefault();
                    if (vid2.paused) { vid2.play(); } else { vid2.pause(); }
                    window.dispatchEvent(new CustomEvent('tv:media-playpause'));
                    return;
                }
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return;
            }
            if (kc === SK.PLAY) { var v = document.querySelector('video'); if (v && v.paused) v.play(); return; }
            if (kc === SK.PAUSE) { var v2 = document.querySelector('video'); if (v2 && !v2.paused) v2.pause(); return; }
            if (kc === SK.STOP) { var v3 = document.querySelector('video'); if (v3) { v3.pause(); v3.currentTime = 0; } return; }
            if (kc === SK.FF) { var v4 = document.querySelector('video'); if (v4) v4.currentTime = Math.min(v4.duration, v4.currentTime + 30); return; }
            if (kc === SK.RW) { var v5 = document.querySelector('video'); if (v5) v5.currentTime = Math.max(0, v5.currentTime - 15); return; }
            if (kc === SK.CH_UP) { e.preventDefault(); document.dispatchEvent(new CustomEvent('tv-channel-change', { detail: { direction: 'up' } })); return; }
            if (kc === SK.CH_DOWN) { e.preventDefault(); document.dispatchEvent(new CustomEvent('tv-channel-change', { detail: { direction: 'down' } })); return; }
            // For all other keys (ArrowUp/Down/Left/Right, Escape, etc.), let the player handle them natively
            return;
        }

        // === Samsung RETURN (not in player) ===
        if (kc === SK.RETURN) { e.preventDefault(); e.stopPropagation(); handleBack(e); return; }
        // === Samsung EXIT ===
        if (kc === SK.EXIT) { e.preventDefault(); e.stopPropagation(); window.location.href = '/'; return; }
        // === Backspace / Escape ===
        if (key === 'Backspace' || key === 'Escape' || key === 'GoBack' || kc === 8 || kc === 27) {
            e.preventDefault(); e.stopPropagation(); handleBack(e); return;
        }

        // === D-pad navigation (menus only, not player) ===
        var dir = -1;
        if (key === 'ArrowUp' || kc === SK.UP) dir = 0;
        else if (key === 'ArrowDown' || kc === SK.DOWN) dir = 1;
        else if (key === 'ArrowLeft' || kc === SK.LEFT) dir = 2;
        else if (key === 'ArrowRight' || kc === SK.RIGHT) dir = 3;

        if (dir >= 0 && isTV) {
            var focused = document.activeElement;
            if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || focused.tagName === 'SELECT')) return;

            // Throttle rapid key presses
            if (now - _lastKeyTime < _KEY_THROTTLE) { e.preventDefault(); return; }
            _lastKeyTime = now;

            e.preventDefault();
            e.stopPropagation();
            navigate(dir);
            return;
        }

        // === Enter / OK ===
        if (key === 'Enter' || kc === SK.ENTER || kc === 13) {
            var ae = document.activeElement;
            if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;

            if (!ae || ae === document.body || ae === document.documentElement) {
                e.preventDefault(); e.stopPropagation();
                rebuildCache();
                if (_focusEls.length > 0) _focusEls[0].focus();
                return;
            }

            // Click the focused element
            e.preventDefault();
            ae.click();

            // If it's a settings item, try to open/expand it
            if (ae.classList.contains('tv-settings-item')) {
                var inner = ae.querySelector('select, input[type="checkbox"], button');
                if (inner) {
                    if (inner.tagName === 'SELECT') {
                        // Open the select dropdown
                        inner.focus();
                        inner.click();
                    } else if (inner.type === 'checkbox') {
                        inner.click();
                    } else {
                        inner.click();
                    }
                }
            }
            return;
        }

        // === Media keys ===
        var video = document.querySelector('video');
        if (kc === SK.PLAY || kc === SK.PAUSE) {
            if (video) { e.preventDefault(); if (video.paused) video.play(); else video.pause(); }
            return;
        }
        if (kc === SK.STOP) {
            if (video) { e.preventDefault(); video.pause(); video.currentTime = 0; handleBack(null); }
            return;
        }
        if (kc === SK.FF) { if (video) { e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 30); } return; }
        if (kc === SK.RW) { if (video) { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 15); } return; }

        // === Channel Up/Down ===
        if (kc === SK.CH_UP) { e.preventDefault(); document.dispatchEvent(new CustomEvent('tv-channel-change', { detail: { direction: 'up' } })); return; }
        if (kc === SK.CH_DOWN) { e.preventDefault(); document.dispatchEvent(new CustomEvent('tv-channel-change', { detail: { direction: 'down' } })); return; }

        // === INFO ===
        if (kc === SK.INFO) {
            e.preventDefault();
            var ib = document.querySelector('[aria-label="Info"], [aria-label="Plus d\'infos"], button[class*="info"]');
            if (ib) ib.click();
            return;
        }

        // === RED = favorites ===
        if (kc === SK.RED) {
            e.preventDefault();
            var fb = document.querySelector('[aria-label="Favoris"], button[class*="heart"], button[class*="fav"]');
            if (fb) fb.click();
        }

    }, true);

    // --- Register Samsung TV keys ---
    if (window.tizen) {
        try {
            var keys = ['MediaPlay','MediaPause','MediaStop','MediaFastForward','MediaRewind',
                        'ChannelUp','ChannelDown','Info','ColorF0Red','ColorF1Green',
                        'ColorF2Yellow','ColorF3Blue','Exit','Menu','Tools','Return',
                        '0','1','2','3','4','5','6','7','8','9'];
            for (var k = 0; k < keys.length; k++) {
                try { tizen.tvinputdevice.registerKey(keys[k]); } catch(ex) {}
            }
        } catch(err) {}
    }

    // --- Initial setup ---
    setTimeout(function() {
        tagElements();
        if (isTV) {
            var first = document.querySelector('nav a, nav button, .tv-card, button');
            if (first) first.focus();
        }
    }, 400);

    // ============================================
    // FAVORITES: 2 ROUND BUTTONS ALWAYS VISIBLE
    // - Buttons appear under EVERY fav card automatically
    // - Heart button (red) = remove from favorites
    // - Move button (blue) = enter shake/drag mode
    // - NO context menu at all
    // ============================================
    (function() {
        var shakeMode = false;

        // --- CSS ---
        var favStyle = document.createElement('style');
        favStyle.textContent = [
            '/* Shake animation */',
            '@keyframes fav-shake {',
            '  0%, 100% { transform: rotate(0deg); }',
            '  20% { transform: rotate(-2deg); }',
            '  40% { transform: rotate(2deg); }',
            '  60% { transform: rotate(-1.5deg); }',
            '  80% { transform: rotate(1.5deg); }',
            '}',
            '.fav-shaking { animation: fav-shake 0.4s ease-in-out infinite !important; }',
            '.fav-shaking > a { animation: none !important; }',
            '.fav-shaking { z-index: 30 !important; position: relative !important; }',
            '',
            '/* Two round buttons container - ALWAYS visible under each fav card */',
            '.fav-btns-row {',
            '  display: flex !important;',
            '  justify-content: center !important;',
            '  align-items: center !important;',
            '  gap: 16px !important;',
            '  padding: 8px 0 4px 0 !important;',
            '  width: 100% !important;',
            '}',
            '',
            '/* Round button - big and clear */',
            '.fav-rbtn {',
            '  width: 42px !important;',
            '  height: 42px !important;',
            '  min-width: 42px !important;',
            '  min-height: 42px !important;',
            '  border-radius: 50% !important;',
            '  border: 2px solid rgba(255,255,255,0.7) !important;',
            '  display: flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  cursor: pointer !important;',
            '  padding: 0 !important;',
            '  margin: 0 !important;',
            '  box-shadow: 0 3px 10px rgba(0,0,0,0.5) !important;',
            '  transition: transform 0.15s ease !important;',
            '  -webkit-tap-highlight-color: transparent !important;',
            '}',
            '.fav-rbtn:active { transform: scale(0.9) !important; }',
            '.fav-rbtn-remove { background: rgba(220,38,38,0.85) !important; }',
            '.fav-rbtn-move { background: rgba(37,99,235,0.85) !important; }',
            '',
            '/* Drag ghost */',
            '.fav-drag-ghost {',
            '  position: fixed !important;',
            '  pointer-events: none !important;',
            '  z-index: 10000 !important;',
            '  opacity: 0.85 !important;',
            '  transform: scale(1.1) rotate(-3deg) !important;',
            '  box-shadow: 0 10px 40px rgba(0,0,0,0.6) !important;',
            '  border-radius: 12px !important;',
            '  transition: none !important;',
            '}',
            '.fav-drop-target { outline: 3px dashed rgba(59,130,246,0.7) !important; outline-offset: 4px !important; }'
        ].join('\n');
        document.head.appendChild(favStyle);

        function isFavPage() {
            return window.location.pathname.indexOf('/favorites') !== -1 || window.location.pathname.indexOf('/favoris') !== -1;
        }

        function getFavCards() {
            if (!isFavPage()) return [];
            var cards = document.querySelectorAll('[class*="cursor-pointer"][class*="overflow-hidden"]');
            var result = [];
            for (var i = 0; i < cards.length; i++) {
                var c = cards[i];
                if (c.offsetWidth > 50 && c.offsetHeight > 50 && !c.classList.contains('fav-btns-added')) {
                    result.push(c);
                }
            }
            return result;
        }

        function addFavButtons() {
            if (!isFavPage()) return;
            var cards = getFavCards();
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.classList.add('fav-btns-added');

                var wrapper = card.parentElement;
                if (!wrapper) continue;

                // Check if buttons already exist
                if (wrapper.querySelector('.fav-btns-row')) continue;

                var row = document.createElement('div');
                row.className = 'fav-btns-row';

                // Remove button (red heart)
                var removeBtn = document.createElement('button');
                removeBtn.className = 'fav-rbtn fav-rbtn-remove';
                removeBtn.setAttribute('tabindex', '0');
                removeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
                removeBtn.title = 'Retirer des favoris';

                // Move button (blue arrows)
                var moveBtn = document.createElement('button');
                moveBtn.className = 'fav-rbtn fav-rbtn-move';
                moveBtn.setAttribute('tabindex', '0');
                moveBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>';
                moveBtn.title = 'Déplacer';

                (function(cardEl, rmBtn) {
                    rmBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Find and click the heart/fav button inside the card
                        var heartBtn = cardEl.querySelector('button[class*="heart"], button[aria-label*="fav"], button[aria-label*="Fav"], [class*="Heart"]');
                        if (heartBtn) {
                            heartBtn.click();
                        } else {
                            // Try to find SVG heart icon button
                            var svgs = cardEl.querySelectorAll('button svg');
                            for (var s = 0; s < svgs.length; s++) {
                                var path = svgs[s].querySelector('path');
                                if (path && path.getAttribute('d') && path.getAttribute('d').indexOf('20.84') !== -1) {
                                    svgs[s].parentElement.click();
                                    break;
                                }
                            }
                        }
                    });
                })(card, removeBtn);

                (function(mvBtn) {
                    mvBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleShakeMode();
                    });
                })(moveBtn);

                row.appendChild(removeBtn);
                row.appendChild(moveBtn);
                wrapper.appendChild(row);
            }
        }

        function toggleShakeMode() {
            shakeMode = !shakeMode;
            var cards = document.querySelectorAll('.fav-btns-added');
            for (var i = 0; i < cards.length; i++) {
                if (shakeMode) {
                    cards[i].classList.add('fav-shaking');
                } else {
                    cards[i].classList.remove('fav-shaking');
                }
            }
        }

        function exitShakeMode() {
            shakeMode = false;
            var cards = document.querySelectorAll('.fav-shaking');
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.remove('fav-shaking');
            }
        }

        // --- Observe for new cards ---
        var favObTimer = null;
        function startObserving() {
            var favObs = new MutationObserver(function() {
                if (favObTimer) return;
                favObTimer = setTimeout(function() {
                    favObTimer = null;
                    if (isFavPage()) addFavButtons();
                }, 300);
            });
            if (document.body) {
                favObs.observe(document.body, { childList: true, subtree: true });
            }
        }

        if (document.body) {
            startObserving();
        } else {
            setTimeout(startObserving, 1000);
        }

        // --- Kill context menu via MutationObserver ---
        var cmObs = new MutationObserver(function(muts) {
            for (var i = 0; i < muts.length; i++) {
                var added = muts[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var n = added[j];
                    if (n.nodeType !== 1) continue;
                    var loc = (n.getAttribute && n.getAttribute('data-loc')) || '';
                    if (loc.indexOf('TVContextMenu') !== -1) {
                        n.style.cssText = 'display:none!important;opacity:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;';
                        try { n.remove(); } catch(e) {}
                    }
                    if (n.querySelector) {
                        var cm = n.querySelector('[data-loc*="TVContextMenu"]');
                        if (cm) {
                            cm.style.cssText = 'display:none!important;opacity:0!important;pointer-events:none!important;position:absolute!important;left:-9999px!important;';
                            try { cm.parentNode.remove(); } catch(e) {}
                        }
                    }
                }
            }
        });
        cmObs.observe(document.body, { childList: true, subtree: true });

        // --- Exit shake on navigation ---
        var lastPath = location.pathname;
        setInterval(function() {
            if (location.pathname !== lastPath) {
                lastPath = location.pathname;
                if (shakeMode) exitShakeMode();
            }
        }, 500);

    })();

    // ============================================
    // LIVE TV: CLEAN UP CARDS + MARQUEE EPG TEXT
    // - Remove duplicate channel name
    // - Enlarge EPG program text
    // - Add scrolling marquee if text overflows
    // ============================================
    (function() {
        // CSS for marquee scrolling text
        var liveStyle = document.createElement('style');
        liveStyle.textContent = [
            '/* Marquee animation for overflowing EPG text */',
            '@keyframes epg-marquee {',
            '  0% { transform: translateX(0); }',
            '  10% { transform: translateX(0); }',
            '  90% { transform: translateX(var(--marquee-dist, -50%)); }',
            '  100% { transform: translateX(var(--marquee-dist, -50%)); }',
            '}',
            '',
            '.epg-marquee-container {',
            '  overflow: hidden !important;',
            '  white-space: nowrap !important;',
            '  position: relative !important;',
            '  width: 100% !important;',
            '}',
            '',
            '.epg-marquee-text {',
            '  display: inline-block !important;',
            '  white-space: nowrap !important;',
            '  animation: epg-marquee 6s linear infinite !important;',
            '  padding-right: 30px !important;',
            '}',
            '',
            '/* Hide duplicate channel name in card bottom */',
            '[data-loc*="LiveTV.tsx:345"] {',
            '  display: none !important;',
            '}',
            '',
            '/* Enlarge EPG program title */',
            '[data-loc*="LiveTV.tsx:349"] {',
            '  font-size: 13px !important;',
            '  font-weight: 600 !important;',
            '  color: white !important;',
            '  margin-top: 0 !important;',
            '  max-width: 100% !important;',
            '  overflow: hidden !important;',
            '}',
            '',
            '/* Make the card bottom section use full space */',
            '[data-loc*="LiveTV.tsx:344"] {',
            '  padding: 6px 8px !important;',
            '}',
            '',
            '/* LIVE dot: change from white to RED */',
            '[data-loc*="LiveTV.tsx:309"] {',
            '  background: #ef4444 !important;',
            '  box-shadow: 0 0 6px 2px rgba(239, 68, 68, 0.6) !important;',
            '}'
        ].join('\n');
        document.head.appendChild(liveStyle);

        // --- Apply marquee to overflowing EPG text ---
        function applyMarquee() {
            var epgTexts = document.querySelectorAll('[data-loc*="LiveTV.tsx:349"]');
            for (var i = 0; i < epgTexts.length; i++) {
                var el = epgTexts[i];
                // Skip if already processed
                if (el.getAttribute('data-marquee-done')) continue;
                el.setAttribute('data-marquee-done', '1');

                // Check if text overflows
                var textContent = el.textContent || '';
                if (!textContent) continue;

                // Remove truncate class to measure real width
                el.classList.remove('truncate');
                el.style.overflow = 'hidden';
                el.style.textOverflow = 'clip';

                // Use requestAnimationFrame to measure after render
                (function(elem, txt) {
                    requestAnimationFrame(function() {
                        if (elem.scrollWidth > elem.clientWidth + 2) {
                            // Text overflows - apply marquee
                            var dist = -(elem.scrollWidth - elem.clientWidth + 20);
                            var container = document.createElement('div');
                            container.className = 'epg-marquee-container';
                            var inner = document.createElement('span');
                            inner.className = 'epg-marquee-text';
                            inner.textContent = txt;
                            inner.style.setProperty('--marquee-dist', dist + 'px');
                            // Calculate animation duration based on text length
                            var duration = Math.max(4, txt.length * 0.2);
                            inner.style.animationDuration = duration + 's';
                            container.appendChild(inner);
                            elem.textContent = '';
                            elem.appendChild(container);
                            elem.style.overflow = 'hidden';
                        }
                    });
                })(el, textContent);
            }
        }

        // Run on page load and on mutations
        var liveObTimer = null;
        var liveObs = new MutationObserver(function() {
            if (liveObTimer) return;
            liveObTimer = setTimeout(function() {
                liveObTimer = null;
                applyMarquee();
            }, 500);
        });
        liveObs.observe(document.body, { childList: true, subtree: true });

        // Initial run
        setTimeout(applyMarquee, 1000);
        setTimeout(applyMarquee, 3000);
    })();

    // ============================================
    // HORIZONTAL SWIPE SUPPORT FOR TOUCH DEVICES
    // Enables swipe left/right on category rows and favorites
    // ============================================
    (function() {
        var touchStartX = 0;
        var touchStartY = 0;
        var touchStartTime = 0;
        var touchTarget = null;
        var MIN_SWIPE_DIST = 40;
        var MAX_SWIPE_TIME = 500;

        document.addEventListener('touchstart', function(e) {
            if (e.touches.length !== 1) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            touchTarget = e.target;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            if (!touchTarget) return;
            var touch = e.changedTouches[0];
            if (!touch) return;
            var dx = touch.clientX - touchStartX;
            var dy = touch.clientY - touchStartY;
            var dt = Date.now() - touchStartTime;

            // Only process horizontal swipes (not vertical scrolling)
            if (dt > MAX_SWIPE_TIME) return;
            if (Math.abs(dx) < MIN_SWIPE_DIST) return;
            if (Math.abs(dy) > Math.abs(dx) * 0.7) return; // Too vertical

            // Find if the touch target is inside a horizontal scrollable container
            var scroller = findScrollableParent(touchTarget);
            if (scroller) {
                // The browser already handles native scroll via touch
                // But we also want to support focusing the next/prev item for TV-like navigation
                var focused = document.activeElement;
                if (focused && scroller.contains(focused)) {
                    if (dx < 0) {
                        navigate(3); // swipe left = content moves left = go right
                    } else {
                        navigate(2); // swipe right = content moves right = go left
                    }
                }
            }
            touchTarget = null;
        }, { passive: true });
    })();

    // ============================================
    // LIVE TV: MOSAIC + LIST VIEW TOGGLE
    // v41: Add grid mosaic (fix for Tizen) and list view
    // with large horizontal rectangles, thumbnail left, EPG info right
    // ============================================
    (function() {
        var VIEW_KEY = 'tv-livetv-view';
        var currentView = localStorage.getItem(VIEW_KEY) || 'grid'; // 'grid' or 'list'

        // --- CSS for both views ---
        var liveViewStyle = document.createElement('style');
        liveViewStyle.id = 'tv-livetv-views-css';
        liveViewStyle.textContent = [
            '/* ============ VIEW TOGGLE BUTTON ============ */',
            '.tv-view-toggle-container {',
            '  display: flex !important;',
            '  gap: 4px !important;',
            '  background: rgba(255,255,255,0.06) !important;',
            '  border-radius: 10px !important;',
            '  padding: 3px !important;',
            '  border: 1px solid rgba(255,255,255,0.08) !important;',
            '}',
            '.tv-view-btn {',
            '  display: flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  width: 38px !important;',
            '  height: 34px !important;',
            '  border-radius: 8px !important;',
            '  border: none !important;',
            '  cursor: pointer !important;',
            '  transition: all 0.2s ease !important;',
            '  background: transparent !important;',
            '  color: rgba(255,255,255,0.4) !important;',
            '}',
            '.tv-view-btn.active {',
            '  background: rgba(0,140,255,0.25) !important;',
            '  color: rgba(0,180,255,1) !important;',
            '  box-shadow: 0 0 8px rgba(0,140,255,0.3) !important;',
            '}',
            '.tv-view-btn:hover:not(.active) {',
            '  background: rgba(255,255,255,0.08) !important;',
            '  color: rgba(255,255,255,0.7) !important;',
            '}',
            '.tv-view-btn svg { width: 18px !important; height: 18px !important; }',
            '',
            '/* ============ GRID VIEW (MOSAIC) - Force grid on Tizen ============ */',
            '.tv-live-grid [data-loc*="LiveTV.tsx:282"] {',
            '  display: grid !important;',
            '  grid-template-columns: repeat(2, 1fr) !important;',
            '  gap: 12px !important;',
            '}',
            '@media (min-width: 640px) {',
            '  .tv-live-grid [data-loc*="LiveTV.tsx:282"] {',
            '    grid-template-columns: repeat(3, 1fr) !important;',
            '  }',
            '}',
            '@media (min-width: 768px) {',
            '  .tv-live-grid [data-loc*="LiveTV.tsx:282"] {',
            '    grid-template-columns: repeat(4, 1fr) !important;',
            '    gap: 16px !important;',
            '  }',
            '}',
            '@media (min-width: 1024px) {',
            '  .tv-live-grid [data-loc*="LiveTV.tsx:282"] {',
            '    grid-template-columns: repeat(5, 1fr) !important;',
            '  }',
            '}',
            '@media (min-width: 1280px) {',
            '  .tv-live-grid [data-loc*="LiveTV.tsx:282"] {',
            '    grid-template-columns: repeat(6, 1fr) !important;',
            '  }',
            '}',
            '',
            '/* Grid cards: compact square-ish cards */',
            '.tv-live-grid [data-loc*="LiveTV.tsx:289"] {',
            '  border-radius: 12px !important;',
            '  overflow: hidden !important;',
            '  background: rgba(255,255,255,0.04) !important;',
            '  border: 1px solid rgba(255,255,255,0.06) !important;',
            '  transition: transform 0.15s ease, box-shadow 0.15s ease !important;',
            '}',
            '.tv-live-grid [data-loc*="LiveTV.tsx:289"]:hover {',
            '  transform: scale(1.03) !important;',
            '  box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;',
            '}',
            '',
            '/* ============ LIST VIEW ============ */',
            '/* Container: full width, remove padding */',
            '.tv-live-list [data-loc*="LiveTV.tsx:160"] {',
            '  padding-left: 0 !important;',
            '  padding-right: 0 !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:282"] {',
            '  display: flex !important;',
            '  flex-direction: column !important;',
            '  gap: 6px !important;',
            '  width: 100% !important;',
            '  max-width: 100% !important;',
            '  padding: 0 !important;',
            '}',
            '',
            '/* List cards: full-width horizontal rectangles */',
            '.tv-live-list [data-loc*="LiveTV.tsx:289"] {',
            '  display: flex !important;',
            '  flex-direction: row !important;',
            '  align-items: stretch !important;',
            '  width: 100% !important;',
            '  max-width: 100% !important;',
            '  border-radius: 0 !important;',
            '  overflow: hidden !important;',
            '  background: rgba(255,255,255,0.03) !important;',
            '  border: none !important;',
            '  border-bottom: 1px solid rgba(255,255,255,0.06) !important;',
            '  min-height: 100px !important;',
            '  transition: background 0.15s ease !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:289"]:hover {',
            '  background: rgba(255,255,255,0.07) !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:289"]:nth-child(even) {',
            '  background: rgba(255,255,255,0.015) !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:289"]:nth-child(even):hover {',
            '  background: rgba(255,255,255,0.06) !important;',
            '}',
            '',
            '/* Keep header/toolbar with padding */',
            '.tv-live-list [data-loc*="LiveTV.tsx:162"],',
            '.tv-live-list [data-loc*="LiveTV.tsx:173"] {',
            '  padding-left: 16px !important;',
            '  padding-right: 16px !important;',
            '}',
            '@media (min-width: 768px) {',
            '  .tv-live-list [data-loc*="LiveTV.tsx:162"],',
            '  .tv-live-list [data-loc*="LiveTV.tsx:173"] {',
            '    padding-left: 32px !important;',
            '    padding-right: 32px !important;',
            '  }',
            '}',
            '',
            '',
            '/* List: thumbnail area (left side) */',
            '.tv-live-list [data-loc*="LiveTV.tsx:306"] {',
            '  width: 160px !important;',
            '  min-width: 160px !important;',
            '  max-width: 160px !important;',
            '  aspect-ratio: auto !important;',
            '  height: auto !important;',
            '  display: flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  padding: 14px !important;',
            '  background: rgba(255,255,255,0.02) !important;',
            '}',
            '@media (min-width: 1280px) {',
            '  .tv-live-list [data-loc*="LiveTV.tsx:306"] {',
            '    width: 200px !important;',
            '    min-width: 200px !important;',
            '    max-width: 200px !important;',
            '    padding: 16px !important;',
            '  }',
            '}',
            '',
            '',
            '/* List: info area (right side) - expand to fill */',
            '.tv-live-list [data-loc*="LiveTV.tsx:344"] {',
            '  flex: 1 !important;',
            '  display: flex !important;',
            '  flex-direction: column !important;',
            '  justify-content: center !important;',
            '  padding: 14px 20px !important;',
            '  min-width: 0 !important;',
            '}',
            '@media (min-width: 1280px) {',
            '  .tv-live-list [data-loc*="LiveTV.tsx:344"] {',
            '    padding: 16px 28px !important;',
            '  }',
            '}',
            '',
            '',
            '/* List: channel name - bigger */',
            '.tv-live-list [data-loc*="LiveTV.tsx:345"] {',
            '  font-size: 16px !important;',
            '  font-weight: 600 !important;',
            '  color: white !important;',
            '  white-space: nowrap !important;',
            '  overflow: hidden !important;',
            '  text-overflow: ellipsis !important;',
            '  margin-bottom: 4px !important;',
            '}',
            '',
            '/* List: EPG program title - bigger */',
            '.tv-live-list [data-loc*="LiveTV.tsx:349"] {',
            '  font-size: 14px !important;',
            '  color: rgba(255,255,255,0.7) !important;',
            '  white-space: nowrap !important;',
            '  overflow: hidden !important;',
            '  text-overflow: ellipsis !important;',
            '}',
            '',
            '/* List: EPG time bar - wider */',
            '.tv-live-list [data-loc*="LiveTV.tsx:356"] {',
            '  margin-top: 8px !important;',
            '  max-width: 400px !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:357"] {',
            '  font-size: 12px !important;',
            '  color: rgba(255,255,255,0.5) !important;',
            '}',
            '.tv-live-list [data-loc*="LiveTV.tsx:361"] {',
            '  height: 4px !important;',
            '  margin-top: 4px !important;',
            '}',
            '',
            '',
            '/* List: Catchup badge */',
            '.tv-live-list [data-loc*="LiveTV.tsx:375"] {',
            '  margin-top: 4px !important;',
            '}',
            '',
            '/* List: LIVE badge positioning */',
            '.tv-live-list [data-loc*="LiveTV.tsx:308"] {',
            '  position: absolute !important;',
            '  top: 6px !important;',
            '  left: 6px !important;',
            '}',
            '',
            '/* List: Favorite heart positioning */',
            '.tv-live-list [data-loc*="LiveTV.tsx:313"] {',
            '  position: absolute !important;',
            '  top: 6px !important;',
            '  right: 6px !important;',
            '}',
            '',
            '/* List: Logo in thumbnail - bigger */',
            '.tv-live-list [data-loc*="LiveTV.tsx:321"] img,',
            '.tv-live-list [data-loc*="LiveTV.tsx:321"] svg {',
            '  max-width: 100px !important;',
            '  max-height: 70px !important;',
            '}',
            '@media (min-width: 1280px) {',
            '  .tv-live-list [data-loc*="LiveTV.tsx:321"] img,',
            '  .tv-live-list [data-loc*="LiveTV.tsx:321"] svg {',
            '    max-width: 120px !important;',
            '    max-height: 80px !important;',
            '  }',
            '}'
        ].join('\n');
        document.head.appendChild(liveViewStyle);

        // --- SVG Icons ---
        var gridIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
        var listIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="5" rx="1"/><rect x="3" y="19" width="18" height="2" rx="1"/></svg>';

        function isLiveTVPage() {
            var p = window.location.pathname;
            return p === '/live' || p === '/livetv' || p.indexOf('/live-tv') !== -1 || p.indexOf('/livetv') !== -1;
        }

        function applyView(view) {
            currentView = view;
            localStorage.setItem(VIEW_KEY, view);

            // Find the Live TV page container
            var pageContainer = document.querySelector('[data-loc*="LiveTV.tsx:160"]');
            if (!pageContainer) return;

            // Remove old classes
            pageContainer.classList.remove('tv-live-grid', 'tv-live-list');
            // Add new class
            pageContainer.classList.add(view === 'list' ? 'tv-live-list' : 'tv-live-grid');

            // Update toggle buttons
            var gridBtn = document.querySelector('.tv-view-btn-grid');
            var listBtn = document.querySelector('.tv-view-btn-list');
            if (gridBtn) {
                gridBtn.classList.toggle('active', view === 'grid');
            }
            if (listBtn) {
                listBtn.classList.toggle('active', view === 'list');
            }
        }

        function injectToggle() {
            if (!isLiveTVPage()) return;

            // Check if toggle already exists
            if (document.querySelector('.tv-view-toggle-container')) {
                // Just re-apply the current view
                applyView(currentView);
                return;
            }

            // Find the toolbar area (search + category filter row)
            var toolbar = document.querySelector('[data-loc*="LiveTV.tsx:173"]');
            if (!toolbar) return;

            // Create toggle container
            var toggleContainer = document.createElement('div');
            toggleContainer.className = 'tv-view-toggle-container';

            // Grid button
            var gridBtn = document.createElement('button');
            gridBtn.className = 'tv-view-btn tv-view-btn-grid' + (currentView === 'grid' ? ' active' : '');
            gridBtn.innerHTML = gridIcon;
            gridBtn.title = 'Vue Mosaïque';
            gridBtn.setAttribute('tabindex', '0');
            gridBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                applyView('grid');
            });

            // List button
            var listBtn = document.createElement('button');
            listBtn.className = 'tv-view-btn tv-view-btn-list' + (currentView === 'list' ? ' active' : '');
            listBtn.innerHTML = listIcon;
            listBtn.title = 'Vue Liste';
            listBtn.setAttribute('tabindex', '0');
            listBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                applyView('list');
            });

            toggleContainer.appendChild(gridBtn);
            toggleContainer.appendChild(listBtn);

            // Insert at the end of the toolbar
            toolbar.appendChild(toggleContainer);

            // Apply current view
            applyView(currentView);
        }

        // Observe for Live TV page
        var liveViewObTimer = null;
        var liveViewObs = new MutationObserver(function() {
            if (liveViewObTimer) return;
            liveViewObTimer = setTimeout(function() {
                liveViewObTimer = null;
                if (isLiveTVPage()) {
                    injectToggle();
                }
            }, 300);
        });
        liveViewObs.observe(document.body, { childList: true, subtree: true });

        // Also check on route changes
        var lastLivePath = window.location.pathname;
        setInterval(function() {
            var cp = window.location.pathname;
            if (cp !== lastLivePath) {
                lastLivePath = cp;
                if (isLiveTVPage()) {
                    setTimeout(injectToggle, 500);
                    setTimeout(injectToggle, 1500);
                }
            }
        }, 500);

        // Initial injection
        setTimeout(function() {
            if (isLiveTVPage()) injectToggle();
        }, 1000);
        setTimeout(function() {
            if (isLiveTVPage()) injectToggle();
        }, 3000);

    })();

    // ============================================
    // LIVE TV LIST VIEW: EPG DESCRIPTION INJECTION
    // v41b: Read EPG data from React fiber and inject description
    // into list view cards for richer program info display
    // ============================================
    (function() {

        // CSS for injected EPG description elements
        var epgDescStyle = document.createElement('style');
        epgDescStyle.id = 'tv-epg-desc-css';
        epgDescStyle.textContent = [
            '.tv-epg-desc-injected {',
            '  font-size: 12px !important;',
            '  color: rgba(255,255,255,0.45) !important;',
            '  line-height: 1.4 !important;',
            '  margin-top: 4px !important;',
            '  overflow: hidden !important;',
            '  display: -webkit-box !important;',
            '  -webkit-line-clamp: 2 !important;',
            '  -webkit-box-orient: vertical !important;',
            '  max-height: 34px !important;',
            '}',
            '@media (min-width: 1280px) {',
            '  .tv-epg-desc-injected {',
            '    font-size: 13px !important;',
            '    -webkit-line-clamp: 3 !important;',
            '    max-height: 54px !important;',
            '  }',
            '}',
            '',
            '/* Next program info */',
            '.tv-epg-next-program {',
            '  font-size: 11px !important;',
            '  color: rgba(255,255,255,0.3) !important;',
            '  margin-top: 6px !important;',
            '  padding-top: 6px !important;',
            '  border-top: 1px solid rgba(255,255,255,0.05) !important;',
            '  display: flex !important;',
            '  align-items: center !important;',
            '  gap: 6px !important;',
            '}',
            '.tv-epg-next-label {',
            '  font-weight: 600 !important;',
            '  color: rgba(0,160,255,0.6) !important;',
            '  text-transform: uppercase !important;',
            '  font-size: 9px !important;',
            '  letter-spacing: 0.5px !important;',
            '  padding: 1px 5px !important;',
            '  border-radius: 3px !important;',
            '  background: rgba(0,160,255,0.1) !important;',
            '}',
            '.tv-epg-next-title {',
            '  white-space: nowrap !important;',
            '  overflow: hidden !important;',
            '  text-overflow: ellipsis !important;',
            '  flex: 1 !important;',
            '}',
            '.tv-epg-next-time {',
            '  white-space: nowrap !important;',
            '  color: rgba(255,255,255,0.25) !important;',
            '}'
        ].join('\n');
        document.head.appendChild(epgDescStyle);

        // Helper: get React fiber from DOM element
        function getFiber(el) {
            if (!el) return null;
            var keys = Object.keys(el);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf('__reactFiber') === 0 || keys[i].indexOf('__reactInternalInstance') === 0) {
                    return el[keys[i]];
                }
            }
            return null;
        }

        // Helper: walk up fiber tree to find component with EPG data
        function findEpgData(fiber, streamId) {
            var current = fiber;
            var maxDepth = 30;
            while (current && maxDepth-- > 0) {
                // Check memoizedState for hooks
                if (current.memoizedState) {
                    var state = current.memoizedState;
                    var hookDepth = 20;
                    while (state && hookDepth-- > 0) {
                        if (state.queue && state.queue.lastRenderedState) {
                            var val = state.queue.lastRenderedState;
                            // Check if it's the EPG map (object with stream_id keys containing arrays)
                            if (val && typeof val === 'object' && !Array.isArray(val)) {
                                var testKey = streamId || Object.keys(val)[0];
                                if (testKey && val[testKey] && Array.isArray(val[testKey])) {
                                    var item = val[testKey][0];
                                    if (item && (item.title !== undefined || item.start_timestamp !== undefined)) {
                                        return val;
                                    }
                                }
                            }
                        }
                        state = state.next;
                    }
                }
                current = current.return;
            }
            return null;
        }

        // Helper: format timestamp to HH:MM
        function formatTime(ts) {
            if (!ts || ts === '0') return '';
            var d = new Date(parseInt(ts) * 1000);
            var h = d.getHours();
            var m = d.getMinutes();
            return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        }

        // Helper: get current EPG entry from array
        function getCurrentEpg(epgArray) {
            if (!epgArray || !epgArray.length) return null;
            var now = Date.now() / 1000;
            for (var i = 0; i < epgArray.length; i++) {
                var start = parseInt(epgArray[i].start_timestamp || '0');
                var stop = parseInt(epgArray[i].stop_timestamp || '0');
                if (start <= now && stop >= now) return { current: epgArray[i], next: epgArray[i + 1] || null };
            }
            return { current: epgArray[0], next: epgArray[1] || null };
        }

        // Main: inject EPG descriptions into list view cards
        function injectEpgDescriptions() {
            var pageContainer = document.querySelector('[data-loc*="LiveTV.tsx:160"]');
            if (!pageContainer || !pageContainer.classList.contains('tv-live-list')) return;

            var grid = document.querySelector('[data-loc*="LiveTV.tsx:282"]');
            if (!grid) return;

            // Try to find EPG data from React fiber
            var epgMap = null;
            var gridFiber = getFiber(grid);
            if (gridFiber) {
                epgMap = findEpgData(gridFiber);
            }

            // Get all cards
            var cards = grid.querySelectorAll('[data-loc*="LiveTV.tsx:289"]');
            cards.forEach(function(card) {
                var infoArea = card.querySelector('[data-loc*="LiveTV.tsx:344"]');
                if (!infoArea) return;

                // Skip if already injected
                if (infoArea.querySelector('.tv-epg-desc-injected') || infoArea.querySelector('.tv-epg-next-program')) return;

                // Try to get stream_id from the card's React fiber props
                var streamId = null;
                var cardFiber = getFiber(card);
                if (cardFiber) {
                    // Walk up to find the props with stream_id
                    var f = cardFiber;
                    var depth = 10;
                    while (f && depth-- > 0) {
                        if (f.memoizedProps && f.memoizedProps.children) {
                            break;
                        }
                        f = f.return;
                    }
                }

                // If we have the EPG map, try to match by channel name
                if (epgMap) {
                    var channelNameEl = infoArea.querySelector('[data-loc*="LiveTV.tsx:345"]');
                    var titleEl = infoArea.querySelector('[data-loc*="LiveTV.tsx:349"]');
                    var channelName = channelNameEl ? channelNameEl.textContent : '';
                    var currentTitle = titleEl ? titleEl.textContent : '';

                    // Find matching EPG entry by title
                    var epgKeys = Object.keys(epgMap);
                    for (var k = 0; k < epgKeys.length; k++) {
                        var entries = epgMap[epgKeys[k]];
                        var epgInfo = getCurrentEpg(entries);
                        if (epgInfo && epgInfo.current) {
                            var epgTitle = epgInfo.current.title || '';
                            if (currentTitle && epgTitle === currentTitle) {
                                // Found match! Inject description
                                if (epgInfo.current.description && epgInfo.current.description.trim()) {
                                    var descEl = document.createElement('p');
                                    descEl.className = 'tv-epg-desc-injected';
                                    descEl.textContent = epgInfo.current.description;
                                    // Insert after title element
                                    if (titleEl && titleEl.nextSibling) {
                                        titleEl.parentNode.insertBefore(descEl, titleEl.nextSibling);
                                    } else if (titleEl) {
                                        titleEl.parentNode.appendChild(descEl);
                                    }
                                }

                                // Inject next program info
                                if (epgInfo.next) {
                                    var nextEl = document.createElement('div');
                                    nextEl.className = 'tv-epg-next-program';
                                    var nextLabel = document.createElement('span');
                                    nextLabel.className = 'tv-epg-next-label';
                                    nextLabel.textContent = 'Suivant';
                                    var nextTitle = document.createElement('span');
                                    nextTitle.className = 'tv-epg-next-title';
                                    nextTitle.textContent = epgInfo.next.title || '';
                                    var nextTime = document.createElement('span');
                                    nextTime.className = 'tv-epg-next-time';
                                    nextTime.textContent = formatTime(epgInfo.next.start_timestamp) + ' - ' + formatTime(epgInfo.next.stop_timestamp);
                                    nextEl.appendChild(nextLabel);
                                    nextEl.appendChild(nextTitle);
                                    nextEl.appendChild(nextTime);
                                    infoArea.appendChild(nextEl);
                                }
                                break;
                            }
                        }
                    }
                }
            });
        }

        // Run periodically to catch React re-renders
        var epgInjectTimer = null;
        var epgInjectObs = new MutationObserver(function() {
            if (epgInjectTimer) return;
            epgInjectTimer = setTimeout(function() {
                epgInjectTimer = null;
                injectEpgDescriptions();
            }, 500);
        });
        epgInjectObs.observe(document.body, { childList: true, subtree: true });

        // Also run on interval for EPG data that loads asynchronously
        setInterval(function() {
            var pageContainer = document.querySelector('[data-loc*="LiveTV.tsx:160"]');
            if (pageContainer && pageContainer.classList.contains('tv-live-list')) {
                injectEpgDescriptions();
            }
        }, 5000);

        // Initial runs
        setTimeout(injectEpgDescriptions, 2000);
        setTimeout(injectEpgDescriptions, 5000);
        setTimeout(injectEpgDescriptions, 10000);

    })();

    // ============================================
    // BLOCKING PAGE IMAGE REPLACEMENT
    // v42: Replace trial expired & activation MAC images
    // with new custom images served from the same server
    // Also ensure the blocking page disappears after activation
    // ============================================
    (function() {
        var OLD_TRIAL_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/HvzUiyxy9vNSYECkQUnM5a/zap-trial-expired_7614a4d4.png';
        var OLD_MAC_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663338588002/HvzUiyxy9vNSYECkQUnM5a/zap-activation-mac_27770ace.png';
        var NEW_TRIAL_IMG = '/zap-trial-expired-new.png';
        var NEW_MAC_IMG = '/zap-activation-mac-new.png';

        // Replace images in the DOM
        function replaceBlockingImages() {
            var imgs = document.querySelectorAll('img');
            for (var i = 0; i < imgs.length; i++) {
                var src = imgs[i].src || '';
                if (src.indexOf('zap-trial-expired') !== -1 && src.indexOf('-new') === -1) {
                    imgs[i].src = NEW_TRIAL_IMG;
                    console.log('[TV-FIXES] Replaced trial expired image');
                }
                if (src.indexOf('zap-activation-mac') !== -1 && src.indexOf('-new') === -1) {
                    imgs[i].src = NEW_MAC_IMG;
                    console.log('[TV-FIXES] Replaced activation MAC image');
                }
            }
        }

        // Watch for new images being added to the DOM
        var imgObserver = new MutationObserver(function(mutations) {
            for (var m = 0; m < mutations.length; m++) {
                var added = mutations[m].addedNodes;
                for (var n = 0; n < added.length; n++) {
                    var node = added[n];
                    if (node.tagName === 'IMG') {
                        var s = node.src || '';
                        if (s.indexOf('zap-trial-expired') !== -1 && s.indexOf('-new') === -1) {
                            node.src = NEW_TRIAL_IMG;
                        }
                        if (s.indexOf('zap-activation-mac') !== -1 && s.indexOf('-new') === -1) {
                            node.src = NEW_MAC_IMG;
                        }
                    }
                    // Also check children
                    if (node.querySelectorAll) {
                        var childImgs = node.querySelectorAll('img');
                        for (var ci = 0; ci < childImgs.length; ci++) {
                            var cs = childImgs[ci].src || '';
                            if (cs.indexOf('zap-trial-expired') !== -1 && cs.indexOf('-new') === -1) {
                                childImgs[ci].src = NEW_TRIAL_IMG;
                            }
                            if (cs.indexOf('zap-activation-mac') !== -1 && cs.indexOf('-new') === -1) {
                                childImgs[ci].src = NEW_MAC_IMG;
                            }
                        }
                    }
                }
            }
        });
        imgObserver.observe(document.documentElement, { childList: true, subtree: true });

        // Also intercept setAttribute to catch React setting src
        var origSetAttr = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (name === 'src' && typeof value === 'string') {
                if (value.indexOf('zap-trial-expired') !== -1 && value.indexOf('-new') === -1) {
                    value = NEW_TRIAL_IMG;
                }
                if (value.indexOf('zap-activation-mac') !== -1 && value.indexOf('-new') === -1) {
                    value = NEW_MAC_IMG;
                }
            }
            return origSetAttr.call(this, name, value);
        };

        // Run immediately and periodically
        replaceBlockingImages();
        setInterval(replaceBlockingImages, 1000);

        // After activation: remove blocking page completely
        // Listen for the recheck button click and check if status changed
        function checkAndRemoveBlockingPage() {
            // Check if there's a blocking overlay (fixed inset-0 z-[99999])
            var overlays = document.querySelectorAll('[data-loc*="TrialGuard.tsx:511"], [data-loc*="TrialGuard.tsx:545"]');
            if (overlays.length === 0) return;

            // Check localStorage for activation status
            var activated = localStorage.getItem('zap-activated');
            if (activated === 'true') {
                overlays.forEach(function(el) {
                    el.style.display = 'none';
                    el.remove();
                });
                console.log('[TV-FIXES] Blocking page removed after activation');
            }
        }

        // Periodically check
        setInterval(checkAndRemoveBlockingPage, 2000);

        console.log('[TV-FIXES v42] Blocking page image replacement active');
    })();

    // ============================================
    // HIDE WATCH PARTY & TELECOMMANDE for ZAP IPTV
    // v42b: Force hide these menu items on Tizen/ZAP
    // ============================================
    (function() {
        // CSS: Hide Watch Party and Télécommande links in sidebar/nav
        var hideCSS = document.createElement('style');
        hideCSS.id = 'hide-wp-remote';
        hideCSS.textContent = [
            '/* Hide Watch Party link */',
            'a[href="/watch-party"], a[href*="watch-party"] { display: none !important; }',
            '/* Hide Télécommande/Remote link */',
            'a[href="/remote"], a[href*="/remote"] { display: none !important; }',
            '/* Also hide by text content via parent */',
            'nav a[href="/watch-party"], nav a[href="/remote"] { display: none !important; }',
            '/* Hide from mobile bottom nav too */',
            '[data-loc*="Sidebar"] a[href="/watch-party"], [data-loc*="Sidebar"] a[href="/remote"] { display: none !important; }',
            '[data-loc*="BottomNav"] a[href="/watch-party"], [data-loc*="BottomNav"] a[href="/remote"] { display: none !important; }',
            '[data-loc*="MobileNav"] a[href="/watch-party"], [data-loc*="MobileNav"] a[href="/remote"] { display: none !important; }',
        ].join('\n');
        document.head.appendChild(hideCSS);

        // JS: Also remove the elements from DOM for extra safety
        function hideWatchPartyAndRemote() {
            var links = document.querySelectorAll('a[href="/watch-party"], a[href="/remote"], a[href*="watch-party"], a[href*="/remote"]');
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                // Skip if it's a disableRemotePlayback or similar attribute
                if (link.href && (link.href.indexOf('/remote') !== -1 || link.href.indexOf('watch-party') !== -1)) {
                    // Check it's actually a nav link (has text content)
                    var text = link.textContent || '';
                    if (text.indexOf('Watch Party') !== -1 || text.indexOf('Télécommande') !== -1 || text.indexOf('Remote') !== -1) {
                        link.style.display = 'none';
                        link.setAttribute('aria-hidden', 'true');
                    }
                    // Also hide parent li if in a list
                    var parent = link.closest('li');
                    if (parent && (text.indexOf('Watch Party') !== -1 || text.indexOf('Télécommande') !== -1)) {
                        parent.style.display = 'none';
                    }
                }
            }

            // Also search by text content in nav items
            var allNavItems = document.querySelectorAll('nav a, aside a, [role="navigation"] a');
            for (var j = 0; j < allNavItems.length; j++) {
                var navText = allNavItems[j].textContent || '';
                if (navText.trim() === 'Watch Party' || navText.trim() === 'Télécommande') {
                    allNavItems[j].style.display = 'none';
                    var parentLi = allNavItems[j].closest('li');
                    if (parentLi) parentLi.style.display = 'none';
                }
            }
        }

        // Run on load and watch for DOM changes
        hideWatchPartyAndRemote();
        setInterval(hideWatchPartyAndRemote, 2000);
        var wpObserver = new MutationObserver(function() { hideWatchPartyAndRemote(); });
        wpObserver.observe(document.documentElement, { childList: true, subtree: true });

        console.log('[TV-FIXES v42b] Watch Party & Télécommande hidden');
    })();

    console.log('[TV-FIXES v42b] Loaded: Watch Party & Remote hidden, Blocking page images replaced, Live TV mosaic+list views with EPG descriptions, carousel overflow fix, ultra-fast nav, neon focus, enhanced favorites, Samsung remote, VOD play/pause OK, horizontal scroll fix');

    // ============================================
    // HLS RECOVERY v2: Fix buffering + BLACK SCREEN on Live TV
    // - Detects stall, waiting, black screen
    // - Progressive recovery: seek → recoverMediaError → reload source → reload page
    // - Heartbeat monitor for black screen detection
    // ============================================
    (function() {
        var STALL_TIMEOUT = 4000;       // 4s before first recovery attempt
        var BLACK_SCREEN_CHECK = 3000;  // Check for black screen every 3s
        var stallTimer = null;
        var blackScreenTimer = null;
        var recoveryAttempts = 0;
        var MAX_RECOVERY = 6;
        var lastPlaybackTime = 0;
        var frozenCount = 0;
        var MAX_FROZEN = 3;  // 3 consecutive frozen checks = force recovery

        function getVideoElement() {
            return document.querySelector('video');
        }

        function isLivePage() {
            return window.location.pathname.includes('/player/live/');
        }

        function isBlackScreen(video) {
            if (!video) return false;
            if (video.readyState === 0) return true;
            if (video.readyState === 1 && !video.paused) return true;
            if (video.networkState === 3) return true;
            if (video.error) return true;
            return false;
        }

        function forceRecovery(video) {
            if (!video || !isLivePage()) return;
            recoveryAttempts++;
            console.log('[TV-FIXES] HLS Recovery attempt ' + recoveryAttempts + '/' + MAX_RECOVERY);

            if (recoveryAttempts <= 1) {
                try {
                    console.log('[TV-FIXES] Strategy 1: Jump to live edge');
                    if (video.seekable && video.seekable.length > 0) {
                        video.currentTime = video.seekable.end(video.seekable.length - 1) - 0.3;
                    } else if (video.duration && isFinite(video.duration)) {
                        video.currentTime = video.duration - 0.3;
                    }
                    video.play().catch(function() {});
                } catch(e) { console.warn('[TV-FIXES] Recovery seek failed:', e); }
            }
            else if (recoveryAttempts <= 2) {
                try {
                    console.log('[TV-FIXES] Strategy 2: Trigger HLS recoverMediaError');
                    window.dispatchEvent(new CustomEvent('tv:force-hls-recover'));
                    if (video._hlsInstance) {
                        video._hlsInstance.recoverMediaError();
                    }
                    setTimeout(function() {
                        video.play().catch(function() {});
                    }, 500);
                } catch(e) { console.warn('[TV-FIXES] recoverMediaError failed:', e); }
            }
            else if (recoveryAttempts <= 4) {
                try {
                    console.log('[TV-FIXES] Strategy 3: Full source reload');
                    var src = video.src;
                    var currentSrc = video.currentSrc;
                    var sourceToUse = src || currentSrc;
                    if (sourceToUse) {
                        video.pause();
                        video.removeAttribute('src');
                        video.load();
                        setTimeout(function() {
                            video.src = sourceToUse;
                            video.load();
                            video.play().catch(function() {});
                        }, 300);
                    } else {
                        console.log('[TV-FIXES] No source found, reloading page');
                        window.location.reload();
                    }
                } catch(e) {
                    console.warn('[TV-FIXES] Recovery reload failed:', e);
                    window.location.reload();
                }
            }
            else {
                console.log('[TV-FIXES] Max recovery attempts, reloading page');
                window.location.reload();
            }
        }

        function startStallMonitor(video) {
            if (!video || !isLivePage()) return;

            video.addEventListener('playing', function() {
                recoveryAttempts = 0;
                frozenCount = 0;
                lastPlaybackTime = video.currentTime;
                if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; }
            });

            video.addEventListener('timeupdate', function() {
                lastPlaybackTime = video.currentTime;
                frozenCount = 0;
                recoveryAttempts = 0;
                if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; }
            });

            video.addEventListener('waiting', function() {
                if (!isLivePage()) return;
                console.log('[TV-FIXES] Video waiting/buffering detected');
                if (stallTimer) clearTimeout(stallTimer);
                stallTimer = setTimeout(function() {
                    stallTimer = null;
                    if (!video.paused && (video.readyState < 3 || isBlackScreen(video))) {
                        forceRecovery(video);
                    }
                }, STALL_TIMEOUT);
            });

            video.addEventListener('stalled', function() {
                if (!isLivePage()) return;
                console.log('[TV-FIXES] Video stalled detected');
                if (stallTimer) clearTimeout(stallTimer);
                stallTimer = setTimeout(function() {
                    stallTimer = null;
                    forceRecovery(video);
                }, STALL_TIMEOUT);
            });

            video.addEventListener('error', function() {
                if (!isLivePage()) return;
                console.log('[TV-FIXES] Video error detected, attempting recovery');
                setTimeout(function() { forceRecovery(video); }, 1500);
            });

            if (blackScreenTimer) clearInterval(blackScreenTimer);
            blackScreenTimer = setInterval(function() {
                if (!isLivePage() || !document.body.contains(video)) {
                    clearInterval(blackScreenTimer);
                    blackScreenTimer = null;
                    return;
                }

                if (video.paused) {
                    frozenCount = 0;
                    return;
                }

                var currentTime = video.currentTime;
                if (Math.abs(currentTime - lastPlaybackTime) < 0.1) {
                    frozenCount++;
                    console.log('[TV-FIXES] Frozen frame detected (' + frozenCount + '/' + MAX_FROZEN + '), currentTime=' + currentTime.toFixed(2));

                    if (frozenCount >= MAX_FROZEN) {
                        console.log('[TV-FIXES] BLACK SCREEN / FROZEN detected! Forcing recovery...');
                        frozenCount = 0;
                        forceRecovery(video);
                    }
                } else {
                    frozenCount = 0;
                    lastPlaybackTime = currentTime;
                }
            }, BLACK_SCREEN_CHECK);
        }

        var videoObserver = new MutationObserver(function() {
            var video = getVideoElement();
            if (video && !video.__tvFixesMonitored) {
                video.__tvFixesMonitored = true;
                lastPlaybackTime = 0;
                frozenCount = 0;
                recoveryAttempts = 0;
                startStallMonitor(video);
            }
        });
        videoObserver.observe(document.body, { childList: true, subtree: true });

        setTimeout(function() {
            var video = getVideoElement();
            if (video && !video.__tvFixesMonitored) {
                video.__tvFixesMonitored = true;
                startStallMonitor(video);
            }
        }, 2000);

        var lastPath = window.location.pathname;
        setInterval(function() {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                recoveryAttempts = 0;
                frozenCount = 0;
                if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; }
            }
        }, 1000);
    })();

})();
