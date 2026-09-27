import { animate } from 'animejs';

/**
 * animation.js
 * -----------------------------------------------------------------------------
 * Provides 3-D entrance and interaction animations for the app.
 *   • animateHead       – perspective flip-down for the nav bar
 *   • flipCard          – Anime.js 3-D Y-axis card flip on CVV focus/blur
 *   • animateJuices     – staggered Y-axis card-flip for the juice grid
 *   • animateAddToCart  – 3-D press-in spring pop for the add button
 *   • particleBurst     – 3-D particle shower on button click
 *   • animateFallToCart – Anime.js powered parabolic fall-into-cart animation
 *   • animateCartImpact – Anime.js cart bump, ripple, and sparkle on item arrival
 *   • animateSubtotal   – slot-machine flip + count-up for checkout summary
 *   • animateCashPayment– Anime.js 3-D banknote & gold coin explosion on cash payment
 * Respects prefers-reduced-motion across all effects.
 * -----------------------------------------------------------------------------
 */

/**
 * Flip the virtual credit card 3-D on the Y-axis using Anime.js.
 * Triggered when the user enters (focus) or leaves (blur) the CVV / Security code field.
 *
 * @param {HTMLElement} cardEl - The card DOM node with 3D transform-style.
 * @param {boolean} isFlipped - True to show back (180deg), False to show front (0deg).
 */
export function flipCard(cardEl, isFlipped) {
    if (!cardEl) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cardEl.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
        return;
    }

    animate(cardEl, {
        rotateY: isFlipped ? 180 : 0,
        duration: 650,
        ease: 'outBack(1.2)',
    });
}

export const animateCardFlip = flipCard;

/**
 * Animate the Head navbar with a 3-D perspective flip-down entrance,
 * followed by a staggered fade-in + slide-up for each nav link.
 *
 * @param {HTMLElement} headEl  - The `.head` container DOM node (from a ref).
 */
export function animateHead(headEl) {
    if (!headEl) return;

    // Honour accessibility preference � skip motion if the user asked for it.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    /* -- 1. Container: 3-D flip-down from above the viewport ---------------- */
    headEl.animate(
        [
            {
                opacity: 0,
                transform: 'perspective(900px) rotateX(-80deg) translateY(-40px)',
                transformOrigin: 'top center',
            },
            {
                opacity: 0.6,
                transform: 'perspective(900px) rotateX(10deg) translateY(6px)',
                transformOrigin: 'top center',
            },
            {
                opacity: 1,
                transform: 'perspective(900px) rotateX(0deg) translateY(0px)',
                transformOrigin: 'top center',
            },
        ],
        {
            duration: 700,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
        }
    );

    /* -- 2. Links: staggered 3-D slide-up fade-in --------------------------- */
    const links = headEl.querySelectorAll('.head__link');
    links.forEach((link, i) => {
        link.animate(
            [
                {
                    opacity: 0,
                    transform: 'translateZ(-30px) translateY(14px)',
                },
                {
                    opacity: 1,
                    transform: 'translateZ(0px) translateY(0px)',
                },
            ],
            {
                duration: 450,
                delay: 300 + i * 80,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                fill: 'both',
            }
        );
    });
}

/**
 * Animate the Juices grid with a staggered 3-D Y-axis card-flip entrance.
 * Each `.juice-card` flips into view from depth as it enters the viewport,
 * cascading with a 70 ms delay between cards.
 *
 * Uses IntersectionObserver so cards that are off-screen at load time still
 * get their entrance when the user scrolls to them.
 *
 * @param {HTMLElement} juicesEl  - The `.juices` container DOM node (from a ref).
 */
export function animateJuices(juicesEl) {
    if (!juicesEl) return;

    // Respect accessibility preference.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cards = Array.from(juicesEl.querySelectorAll('.juice-card'));
    if (!cards.length) return;

    /* Set initial hidden state so cards don't flash before animating. */
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'perspective(800px) rotateY(-60deg) translateX(-30px) scale(0.88)';
    });

    /* Trigger the animation when a card enters the viewport. */
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                const index = cards.indexOf(card);

                card.animate(
                    [
                        /* from – already set inline above */
                        {
                            opacity: 0,
                            transform: 'perspective(800px) rotateY(-60deg) translateX(-30px) scale(0.88)',
                        },
                        /* slight overshoot – card overshoots past 0° */
                        {
                            opacity: 0.9,
                            transform: 'perspective(800px) rotateY(6deg) translateX(4px) scale(1.02)',
                            offset: 0.72,
                        },
                        /* settle */
                        {
                            opacity: 1,
                            transform: 'perspective(800px) rotateY(0deg) translateX(0px) scale(1)',
                        },
                    ],
                    {
                        duration: 600,
                        delay: index * 70,          // cascade: each card 70 ms after the previous
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        fill: 'both',
                    }
                );

                observer.unobserve(card);               // animate only once
            });
        },
        { threshold: 0.12 }                             // trigger when 12 % of the card is visible
    );

    cards.forEach(card => observer.observe(card));
}

/**
 * Animate the "Add to cart" button with a 3-D press-in → spring-pop burst.
 *
 * Three sequential phases driven by the Web Animations API:
 *   1. Press-in   – button punches into the screen (scale + Z-depth sink)
 *   2. Spring-pop – snaps back past resting size with a springy overshoot
 *   3. Ripple-fade – a pseudo-ripple ring scales out and fades (on the card)
 *
 * @param {HTMLElement} buttonEl - The `.juice-card__button` DOM node that was clicked.
 */
export function animateAddToCart(buttonEl) {
    if (!buttonEl) return;

    // Respect accessibility preference.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    /* ── Phase 1 & 2: button 3-D press-in → spring-pop ───────────────────── */
    buttonEl.animate(
        [
            /* resting state */
            {
                transform: 'perspective(400px) scale(1) translateZ(0px)',
                boxShadow: '0 4px 14px rgba(231, 111, 81, 0.35)',
            },
            /* press-in: sink back into the screen */
            {
                transform: 'perspective(400px) scale(0.88) translateZ(-18px)',
                boxShadow: '0 1px 4px rgba(231, 111, 81, 0.15)',
                offset: 0.22,
            },
            /* spring-pop: overshoot past normal */
            {
                transform: 'perspective(400px) scale(1.14) translateZ(12px)',
                boxShadow: '0 10px 28px rgba(231, 111, 81, 0.55)',
                offset: 0.58,
            },
            /* secondary bounce */
            {
                transform: 'perspective(400px) scale(0.97) translateZ(-4px)',
                boxShadow: '0 5px 16px rgba(231, 111, 81, 0.30)',
                offset: 0.78,
            },
            /* settle */
            {
                transform: 'perspective(400px) scale(1) translateZ(0px)',
                boxShadow: '0 4px 14px rgba(231, 111, 81, 0.35)',
            },
        ],
        {
            duration: 520,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'none',
        }
    );

    /* ── Phase 3: ripple ring expanding from the card ─────────────────────── */
    const card = buttonEl.closest('.juice-card');
    if (!card) return;

    // Ensure the card can clip the ripple
    const prevOverflow = card.style.overflow;
    card.style.overflow = 'hidden';

    const ripple = document.createElement('span');
    Object.assign(ripple.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: 'inherit',
        border: '3px solid rgba(231, 111, 81, 0.7)',
        pointerEvents: 'none',
        zIndex: '10',
    });

    // Card needs positioning context
    if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
    }
    card.appendChild(ripple);

    const rippleAnim = ripple.animate(
        [
            { transform: 'scale(0.7)', opacity: 0.9 },
            { transform: 'scale(1.35)', opacity: 0 },
        ],
        {
            duration: 480,
            delay: 80,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
        }
    );

    rippleAnim.onfinish = () => {
        ripple.remove();
        card.style.overflow = prevOverflow;
    };
}

/**
 * Particle burst — explodes a shower of coloured DOM particles outward from
 * the centre of the clicked "Add to cart" button.
 *
 * Each particle follows a unique 3-D arc:
 *   • random angle  → spread 360° around the button
 *   • random radius → 60–130 px travel distance
 *   • Z-depth arc   → rises toward the viewer then falls back
 *   • random spin   → each particle rotates as it flies
 *   • staggered delay (0–80 ms) → particles don't all leave at the same tick
 *
 * Particles are injected into document.body (so they're never clipped by card
 * overflow) and are positioned using the button's bounding rect. They remove
 * themselves once their animation finishes.
 *
 * @param {HTMLElement} buttonEl  - The `.juice-card__button` that was clicked.
 */
export function particleBurst(buttonEl) {
    if (!buttonEl) return;

    // Respect accessibility preference.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ── Config ────────────────────────────────────────────────────────────── */
    const COUNT = 12;
    const COLORS = [
        '#e76f51', // brand orange
        '#f4a261', // warm amber
        '#e9c46a', // golden yellow
        '#2a9d8f', // teal accent
        '#ffffff',  // white pop
        '#ff8fab', // pink sparkle
    ];
    const MIN_R = 60;   // minimum travel radius (px)
    const MAX_R = 130;  // maximum travel radius (px)
    const DURATION = 650;  // ms for each particle

    /* ── Origin: centre of the button in viewport coordinates ─────────────── */
    const rect = buttonEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2 + window.scrollX;
    const originY = rect.top + rect.height / 2 + window.scrollY;

    for (let i = 0; i < COUNT; i++) {
        /* Random trajectory per particle */
        const angle = (i / COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
        const radius = MIN_R + Math.random() * (MAX_R - MIN_R);
        const destX = Math.cos(angle) * radius;
        const destY = Math.sin(angle) * radius;
        const destZ = 20 + Math.random() * 60;          // arc up toward viewer
        const spin = (Math.random() - 0.5) * 720;      // –360° to +360° rotation
        const size = 6 + Math.random() * 8;            // 6–14 px
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const delay = Math.random() * 80;               // stagger 0–80 ms
        const shape = Math.random() > 0.5 ? '50%' : '3px'; // circle or rounded square

        /* Create the particle */
        const p = document.createElement('span');
        Object.assign(p.style, {
            position: 'absolute',
            top: `${originY}px`,
            left: `${originX}px`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: shape,
            background: color,
            pointerEvents: 'none',
            zIndex: '9999',
            willChange: 'transform, opacity',
            transform: 'translate(-50%, -50%)',
        });
        document.body.appendChild(p);

        /* Animate the particle on a 3-D arc */
        const anim = p.animate(
            [
                /* start – at button centre, full opacity */
                {
                    transform: 'translate(-50%, -50%) perspective(500px) translateX(0px) translateY(0px) translateZ(0px) rotate(0deg) scale(1)',
                    opacity: 1,
                },
                /* mid – peak of the arc: full distance on XY, highest Z, still opaque */
                {
                    transform: `translate(-50%, -50%) perspective(500px) translateX(${destX * 0.6}px) translateY(${destY * 0.6}px) translateZ(${destZ}px) rotate(${spin * 0.5}deg) scale(1.2)`,
                    opacity: 0.9,
                    offset: 0.45,
                },
                /* end – fully travelled, Z falls back, fades out and shrinks */
                {
                    transform: `translate(-50%, -50%) perspective(500px) translateX(${destX}px) translateY(${destY}px) translateZ(-10px) rotate(${spin}deg) scale(0)`,
                    opacity: 0,
                },
            ],
            {
                duration: DURATION,
                delay: delay,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'both',
            }
        );

        /* Self-clean once done */
        anim.onfinish = () => p.remove();
    }
}

/**
 * Animate the subtotal amount with a 3-D slot-machine flip + smooth count-up.
 *
 * Two simultaneous effects driven purely by the Web Animations API and rAF:
 *
 *   1. Flip  – the amount element rotates on the X-axis (like a slot-machine
 *              drum), giving a strong 3-D "tick" sensation on every change.
 *   2. Count – the displayed number smoothly counts from its previous value to
 *              `targetValue` over the same duration using requestAnimationFrame.
 *              The previous value is stored as a data attribute so repeated
 *              calls always start from the right number.
 *
 * @param {HTMLElement} amountEl    - The element whose text shows the subtotal.
 * @param {number}      targetValue - The new subtotal value to count toward.
 */
export function animateSubtotal(amountEl, targetValue) {
    if (!amountEl) return;

    // Respect accessibility preference – just snap to the new value.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        amountEl.dataset.displayedValue = String(targetValue);
        return;
    }

    const DURATION = 520; // ms – flip + count share the same window

    /* ── 1. 3-D flip: slot-machine drum roll on the X-axis ─────────────────── */
    amountEl.animate(
        [
            /* old value visible, tilted backward */
            {
                transform: 'perspective(400px) rotateX(0deg)',
                opacity: 1,
            },
            /* pivot through 90° – number hidden at the edge */
            {
                transform: 'perspective(400px) rotateX(-90deg)',
                opacity: 0,
                offset: 0.3,
            },
            /* snap to new angle – new number comes in from below */
            {
                transform: 'perspective(400px) rotateX(22deg)',
                opacity: 0.6,
                offset: 0.55,
            },
            /* overshoot settle */
            {
                transform: 'perspective(400px) rotateX(-5deg)',
                opacity: 1,
                offset: 0.78,
            },
            /* rest */
            {
                transform: 'perspective(400px) rotateX(0deg)',
                opacity: 1,
            },
        ],
        {
            duration: DURATION,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'none',
        }
    );

    /* ── 2. Count-up: rAF-driven number interpolation ───────────────────────── */
    // Read from where we left off (stored as data attribute), fallback to 0.
    const startValue = parseFloat(amountEl.dataset.displayedValue ?? '0') || 0;
    amountEl.dataset.displayedValue = String(targetValue);

    // Grab the <small>Rs</small> child so we can restore it after each update.
    const smallEl = amountEl.querySelector('small');

    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);

        // Ease-out cubic for the number so it decelerates into the target.
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (targetValue - startValue) * eased;

        // Rebuild text: number first, then the <small> tag.
        amountEl.textContent = current.toFixed(0);
        if (smallEl) amountEl.appendChild(smallEl);

        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

/**
 * Animate an item falling into the cart using Anime.js.
 *
 * When "Add to cart" is clicked:
 *   1. Clones the juice item card/thumbnail at its clicked position.
 *   2. Animates it along a parabolic loft-and-fall trajectory into the cart badge.
 *   3. Scales down and rotates dynamically as it plunges into the cart.
 *   4. Triggers an Anime.js cart impact reaction (bounce + glowing ripple + mini sparks).
 *   5. Safely cleans up the DOM proxy element.
 *
 * @param {HTMLElement} buttonEl - The clicked "Add to cart" button or element within the juice card.
 */
export function animateFallToCart(buttonEl) {
    if (!buttonEl) return;

    // Respect accessibility preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cartEl = document.querySelector('.search__cart');
    if (!cartEl) return;

    const card = buttonEl.closest('.juice-card') || buttonEl;
    const imgEl = card.querySelector('.juice-card__image');

    // Calculate source and destination bounding rects
    const sourceRect = imgEl ? imgEl.getBoundingClientRect() : buttonEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    // Size of the flying mini card
    const startW = Math.min(Math.max(sourceRect.width, 64), 110);
    const startH = Math.min(Math.max(sourceRect.height, 64), 90);

    const startX = sourceRect.left + sourceRect.width / 2 - startW / 2;
    const startY = sourceRect.top + sourceRect.height / 2 - startH / 2;

    const targetCenterX = cartRect.left + cartRect.width / 2;
    const targetCenterY = cartRect.top + cartRect.height / 2;

    const targetX = targetCenterX - startW / 2;
    const targetY = targetCenterY - startH / 2;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    // Create the flying proxy element
    const flyer = document.createElement('div');
    flyer.className = 'juice-flyer-clone';
    Object.assign(flyer.style, {
        position: 'fixed',
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${startW}px`,
        height: `${startH}px`,
        borderRadius: '18px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: '99999',
        boxShadow: '0 16px 36px rgba(231, 111, 81, 0.45), 0 4px 12px rgba(75, 46, 32, 0.25)',
        border: '2px solid rgba(255, 255, 255, 0.95)',
        background: '#fff4eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, opacity',
    });

    if (imgEl && imgEl.src) {
        const cloneImg = document.createElement('img');
        cloneImg.src = imgEl.src;
        cloneImg.alt = 'flying juice';
        Object.assign(cloneImg.style, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
        });
        flyer.appendChild(cloneImg);
    } else {
        flyer.innerHTML = '<span style="font-size: 28px;">🧃</span>';
    }

    // Glow halo behind flyer
    const glow = document.createElement('div');
    Object.assign(glow.style, {
        position: 'absolute',
        inset: '-8px',
        borderRadius: '24px',
        background: 'radial-gradient(circle, rgba(231, 111, 81, 0.45) 0%, rgba(244, 162, 97, 0) 70%)',
        zIndex: '-1',
        pointerEvents: 'none',
    });
    flyer.appendChild(glow);

    document.body.appendChild(flyer);

    // Parabolic Arc & Spin into Cart using Anime.js
    animate(flyer, {
        translateX: [0, deltaX],
        translateY: [
            0,
            Math.min(-50, deltaY * 0.15 - 55),
            deltaY
        ],
        scale: [1, 1.18, 0.85, 0.2],
        rotate: [0, 20, -12, 280],
        opacity: [1, 1, 0.95, 0.05],
        duration: 800,
        ease: 'inOutCubic',
        onComplete: () => {
            flyer.remove();
            // Trigger cart reaction with Anime.js
            animateCartImpact(cartEl);
        }
    });
}

/**
 * Anime.js cart impact animation when juice lands in cart
 * @param {HTMLElement} cartEl - The cart container element
 */
export function animateCartImpact(cartEl) {
    if (!cartEl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 1. Cart bounce & jiggle using Anime.js
    animate(cartEl, {
        scale: [1, 1.3, 0.9, 1.12, 0.98, 1],
        rotate: [0, -7, 7, -3, 1, 0],
        duration: 600,
        ease: 'outElastic(1, 0.6)',
    });

    // 2. Ripple pulse ring on cart
    const ripple = document.createElement('div');
    const rect = cartEl.getBoundingClientRect();
    Object.assign(ripple.style, {
        position: 'fixed',
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top + rect.height / 2}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: '999px',
        border: '3px solid rgba(231, 111, 81, 0.85)',
        boxShadow: '0 0 20px rgba(231, 111, 81, 0.55)',
        transform: 'translate(-50%, -50%) scale(0.6)',
        pointerEvents: 'none',
        zIndex: '99998',
    });
    document.body.appendChild(ripple);

    animate(ripple, {
        scale: [0.6, 1.55],
        opacity: [0.9, 0],
        duration: 480,
        ease: 'outCubic',
        onComplete: () => ripple.remove(),
    });

    // 3. Mini star/sparkle splash around cart
    const colors = ['#e76f51', '#f4a261', '#e9c46a', '#ffffff', '#2a9d8f'];
    for (let i = 0; i < 6; i++) {
        const spark = document.createElement('span');
        const size = 5 + Math.random() * 5;
        const angle = (i / 6) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
        const dist = 32 + Math.random() * 28;
        const sX = Math.cos(angle) * dist;
        const sY = Math.sin(angle) * dist;

        Object.assign(spark.style, {
            position: 'fixed',
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top + rect.height / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: colors[i % colors.length],
            boxShadow: `0 0 8px ${colors[i % colors.length]}`,
            pointerEvents: 'none',
            zIndex: '99999',
            transform: 'translate(-50%, -50%)',
        });
        document.body.appendChild(spark);

        animate(spark, {
            translateX: [0, sX],
            translateY: [0, sY],
            scale: [1, 1.3, 0],
            opacity: [1, 0.85, 0],
            duration: 420 + Math.random() * 120,
            ease: 'outCubic',
            onComplete: () => spark.remove(),
        });
    }
}

/**
 * Anime.js 3-D Cash Payment Animation.
 * Spawns dynamic, 3-D tumbling cash banknotes and sparkling gold coins bursting
 * outward from the payment trigger element with realistic physics, 3-D perspective rotations,
 * and a glowing success ripple.
 *
 * @param {HTMLElement|string} trigger - Button or container triggering the cash payment, or selector.
 * @param {Object} [options] - Custom animation options.
 * @param {number} [options.billCount=7] - Number of cash notes to spawn.
 * @param {number} [options.coinCount=8] - Number of gold coins / sparkles to spawn.
 * @param {string} [options.currency='₹'] - Currency symbol on the banknote.
 * @param {Function} [options.onComplete] - Callback triggered when animation completes.
 */
export function animateCashPayment(trigger, options = {}) {
    const triggerEl = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    const {
        billCount = 7,
        coinCount = 8,
        currency = '₹',
        onComplete = null,
    } = options;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (onComplete) onComplete();
        return;
    }

    // Determine launch center
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;

    if (triggerEl && triggerEl.getBoundingClientRect) {
        const rect = triggerEl.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;

        // Animate button bounce press-in with Anime.js
        animate(triggerEl, {
            scale: [1, 0.92, 1.05, 0.98, 1],
            duration: 450,
            ease: 'outBack(1.5)',
        });
    }

    // 1. Success Pulse Halo
    const halo = document.createElement('div');
    Object.assign(halo.style, {
        position: 'fixed',
        left: `${originX}px`,
        top: `${originY}px`,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46, 125, 50, 0.6) 0%, rgba(129, 199, 132, 0.3) 50%, transparent 75%)',
        boxShadow: '0 0 35px rgba(76, 175, 80, 0.7)',
        transform: 'translate(-50%, -50%) scale(0.3)',
        pointerEvents: 'none',
        zIndex: '99998',
    });
    document.body.appendChild(halo);

    animate(halo, {
        scale: [0.3, 3.2],
        opacity: [0.95, 0],
        duration: 750,
        ease: 'outCubic',
        onComplete: () => halo.remove(),
    });

    // 2. 3-D Banknotes Flying Out
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        perspective: '1000px',
        pointerEvents: 'none',
        zIndex: '99999',
    });
    document.body.appendChild(container);

    let completedItems = 0;
    const totalItems = billCount + coinCount;

    const checkAllComplete = () => {
        completedItems++;
        if (completedItems >= totalItems) {
            container.remove();
            if (onComplete) onComplete();
        }
    };

    // Banknote color gradients & styles
    const noteThemes = [
        { bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #43a047 100%)', text: '#e8f5e9', val: '500' },
        { bg: 'linear-gradient(135deg, #004d40 0%, #00695c 60%, #00897b 100%)', text: '#e0f2f1', val: '200' },
        { bg: 'linear-gradient(135deg, #bf360c 0%, #d84315 60%, #e64a19 100%)', text: '#fbe9e7', val: '100' },
        { bg: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 60%, #8e24aa 100%)', text: '#f3e5f5', val: '2000' },
    ];

    for (let i = 0; i < billCount; i++) {
        const theme = noteThemes[i % noteThemes.length];
        const bill = document.createElement('div');
        bill.className = 'cash-bill-anime';

        Object.assign(bill.style, {
            position: 'absolute',
            left: `${originX}px`,
            top: `${originY}px`,
            width: '84px',
            height: '46px',
            borderRadius: '6px',
            background: theme.bg,
            border: '1.5px solid rgba(255, 255, 255, 0.65)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35), inset 0 0 8px rgba(255, 255, 255, 0.25)',
            color: theme.text,
            fontFamily: 'monospace',
            fontWeight: '700',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '4px 6px',
            transformOrigin: 'center center',
            transform: 'translate(-50%, -50%) scale(0.2)',
            opacity: '1',
            willChange: 'transform, opacity',
            boxSizing: 'border-box',
        });

        // Banknote Inner Detail
        bill.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; opacity: 0.9;">
                <span>${currency}</span>
                <span style="letter-spacing: 0.5px;">${theme.val}</span>
            </div>
            <div style="text-align: center; font-size: 13px; line-height: 1; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">
                ${currency} ${theme.val}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 7px; opacity: 0.75;">
                <span>CASH</span>
                <span>SECURE</span>
            </div>
        `;

        container.appendChild(bill);

        // Calculate 3D physics spread
        const angle = (i / billCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const radius = 90 + Math.random() * 110;
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius - (40 + Math.random() * 50);

        const rotX = (Math.random() - 0.5) * 480;
        const rotY = (Math.random() - 0.5) * 540;
        const rotZ = (Math.random() - 0.5) * 360;

        const delay = i * 45;

        animate(bill, {
            translateX: [0, targetX * 0.7, targetX],
            translateY: [0, targetY * 1.2 - 30, targetY + 60],
            translateZ: [0, 80, -40],
            rotateX: [0, rotX],
            rotateY: [0, rotY],
            rotateZ: [0, rotZ],
            scale: [0.2, 1.15, 0.95, 0.7],
            opacity: [0, 1, 1, 0],
            duration: 950 + Math.random() * 200,
            delay: delay,
            ease: 'outCubic',
            onComplete: () => {
                bill.remove();
                checkAllComplete();
            },
        });
    }

    // 3. Gold Coins & Sparkle Bursts
    for (let j = 0; j < coinCount; j++) {
        const coin = document.createElement('div');
        coin.className = 'cash-coin-anime';

        Object.assign(coin.style, {
            position: 'absolute',
            left: `${originX}px`,
            top: `${originY}px`,
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 50%, #ff8f00 100%)',
            border: '1.5px solid #fff9c4',
            boxShadow: '0 4px 10px rgba(255, 179, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5d4037',
            fontSize: '11px',
            fontWeight: '900',
            transform: 'translate(-50%, -50%) scale(0.1)',
            opacity: '1',
            boxSizing: 'border-box',
        });

        coin.innerText = currency;
        container.appendChild(coin);

        const cAngle = (j / coinCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
        const cDist = 70 + Math.random() * 120;
        const cX = Math.cos(cAngle) * cDist;
        const cY = Math.sin(cAngle) * cDist - (30 + Math.random() * 40);

        animate(coin, {
            translateX: [0, cX],
            translateY: [0, cY - 20, cY + 40],
            rotateY: [0, (Math.random() > 0.5 ? 720 : -720)],
            scale: [0.1, 1.25, 0.9, 0],
            opacity: [1, 1, 0.9, 0],
            duration: 800 + Math.random() * 250,
            delay: j * 35,
            ease: 'outBack(1.4)',
            onComplete: () => {
                coin.remove();
                checkAllComplete();
            },
        });
    }
}

export const animateCashPaying = animateCashPayment;

/**
 * Anime.js 3-D Payment Successful Celebration Animation.
 * Displays a glassmorphic celebration card with an animated 3-D spring-loaded
 * emerald checkmark, pulsating shockwave rings, and 3-D cascading confetti.
 *
 * @param {Object} [options] - Custom animation options.
 * @param {string|number} [options.amount] - Payment amount to display.
 * @param {string} [options.title='Payment Successful!'] - Main celebration heading.
 * @param {string} [options.subtitle='Your fresh juice order has been placed successfully.'] - Subtitle message.
 * @param {Function} [options.onComplete] - Callback fired after animation concludes.
 */
export function animatePaymentSuccess(options = {}) {
    const {
        amount,
        title = 'Payment Successful!',
        subtitle = 'Your fresh juice order is confirmed & brewing.',
        onComplete = null,
    } = options;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (onComplete) onComplete();
        return;
    }

    // 1. Overlay container
    const overlay = document.createElement('div');
    overlay.className = 'payment-success-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        background: 'rgba(30, 15, 8, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '100000',
        opacity: '0',
        perspective: '1200px',
        padding: '20px',
        boxSizing: 'border-box',
    });

    // 2. Success Modal Card
    const card = document.createElement('div');
    card.className = 'payment-success-card';
    Object.assign(card.style, {
        position: 'relative',
        width: 'min(100%, 420px)',
        background: 'linear-gradient(145deg, #ffffff 0%, #fffbf8 100%)',
        border: '2px solid rgba(231, 111, 81, 0.3)',
        borderRadius: '32px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 0 40px rgba(76, 175, 80, 0.2)',
        transformOrigin: 'center center',
        transform: 'scale(0.6) rotateX(25deg)',
        willChange: 'transform, opacity',
        overflow: 'hidden',
    });

    // Background ambient shimmer
    const ambient = document.createElement('div');
    Object.assign(ambient.style, {
        position: 'absolute',
        top: '-60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '240px',
        height: '240px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(76, 175, 80, 0.25) 0%, rgba(238, 149, 97, 0.15) 50%, transparent 70%)',
        pointerEvents: 'none',
    });
    card.appendChild(ambient);

    // 3. Checkmark Icon Container
    const badgeWrap = document.createElement('div');
    Object.assign(badgeWrap.style, {
        position: 'relative',
        width: '90px',
        height: '90px',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    // Ripple shockwave
    const shockwave = document.createElement('div');
    Object.assign(shockwave.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: '50%',
        border: '3px solid #4caf50',
        opacity: '0.8',
        transform: 'scale(0.8)',
    });
    badgeWrap.appendChild(shockwave);

    const badge = document.createElement('div');
    Object.assign(badge.style, {
        position: 'relative',
        width: '84px',
        height: '84px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 60%, #1b5e20 100%)',
        border: '3px solid #ffffff',
        boxShadow: '0 12px 28px rgba(46, 125, 50, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '42px',
        fontWeight: '900',
        zIndex: '2',
    });
    badge.innerHTML = `
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
    badgeWrap.appendChild(badge);
    card.appendChild(badgeWrap);

    // 4. Content Elements
    const titleEl = document.createElement('h3');
    titleEl.innerText = title;
    Object.assign(titleEl.style, {
        margin: '0 0 8px',
        color: '#2e1b13',
        fontSize: '1.55rem',
        fontWeight: '800',
        letterSpacing: '-0.03em',
    });
    card.appendChild(titleEl);

    if (amount !== undefined && amount !== null && amount !== '') {
        const amountPill = document.createElement('div');
        Object.assign(amountPill.style, {
            display: 'inline-block',
            margin: '4px auto 14px',
            padding: '6px 16px',
            background: 'linear-gradient(135deg, #fff0e8 0%, #ffe6d9 100%)',
            border: '1px solid #f6cfbd',
            borderRadius: '999px',
            color: '#bd4c35',
            fontSize: '0.92rem',
            fontWeight: '800',
            letterSpacing: '0.02em',
        });
        amountPill.innerText = `Paid: ${amount} Rs`;
        card.appendChild(amountPill);
    }

    const subEl = document.createElement('p');
    subEl.innerText = subtitle;
    Object.assign(subEl.style, {
        margin: '0 0 24px',
        color: '#816657',
        fontSize: '0.88rem',
        lineHeight: '1.5',
    });
    card.appendChild(subEl);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerText = 'Awesome!';
    Object.assign(closeBtn.style, {
        width: '100%',
        minHeight: '48px',
        background: 'linear-gradient(145deg, #e76f51 0%, #d65a3f 50%, #bd4c35 100%)',
        border: '0',
        borderRadius: '999px',
        color: '#ffffff',
        fontSize: '0.9rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(214, 90, 63, 0.35)',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
    });
    card.appendChild(closeBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // 5. 3-D Confetti Streamers
    const confettiColors = ['#4caf50', '#ffd700', '#e76f51', '#26a69a', '#ab47bc', '#42a5f5', '#ff7043'];
    for (let i = 0; i < 36; i++) {
        const conf = document.createElement('div');
        const isRibbon = Math.random() > 0.5;
        const width = isRibbon ? 10 + Math.random() * 8 : 7 + Math.random() * 5;
        const height = isRibbon ? 5 + Math.random() * 4 : 7 + Math.random() * 5;

        Object.assign(conf.style, {
            position: 'absolute',
            left: `${window.innerWidth / 2}px`,
            top: `${window.innerHeight / 2}px`,
            width: `${width}px`,
            height: `${height}px`,
            background: confettiColors[i % confettiColors.length],
            borderRadius: isRibbon ? '2px' : '50%',
            pointerEvents: 'none',
            zIndex: '100001',
            transform: 'translate(-50%, -50%)',
        });
        overlay.appendChild(conf);

        const angle = Math.random() * 2 * Math.PI;
        const dist = 140 + Math.random() * 260;
        const cX = Math.cos(angle) * dist;
        const cY = Math.sin(angle) * dist - (50 + Math.random() * 80);

        animate(conf, {
            translateX: [0, cX],
            translateY: [0, cY, cY + 120 + Math.random() * 100],
            rotateX: [0, Math.random() * 720],
            rotateY: [0, Math.random() * 720],
            rotateZ: [0, Math.random() * 360],
            scale: [0.2, 1.2, 0.8],
            opacity: [1, 1, 0],
            duration: 1200 + Math.random() * 600,
            delay: 150 + Math.random() * 150,
            ease: 'outCubic',
            onComplete: () => conf.remove(),
        });
    }

    // 6. Anime.js entrance animations
    animate(overlay, {
        opacity: [0, 1],
        duration: 350,
        ease: 'outQuad',
    });

    animate(card, {
        scale: [0.6, 1],
        rotateX: [25, 0],
        opacity: [0, 1],
        duration: 700,
        ease: 'outElastic(1, 0.6)',
    });

    animate(badge, {
        scale: [0, 1.2, 1],
        rotate: [-45, 0],
        duration: 650,
        delay: 200,
        ease: 'outBack(2)',
    });

    animate(shockwave, {
        scale: [0.8, 2.2],
        opacity: [0.8, 0],
        duration: 850,
        delay: 300,
        ease: 'outCubic',
    });

    // Dismiss Handler
    let isDismissed = false;
    const dismiss = () => {
        if (isDismissed) return;
        isDismissed = true;

        animate(card, {
            scale: [1, 0.85],
            opacity: [1, 0],
            duration: 300,
            ease: 'inQuad',
        });

        animate(overlay, {
            opacity: [1, 0],
            duration: 350,
            delay: 100,
            ease: 'outQuad',
            onComplete: () => {
                overlay.remove();
                if (onComplete) onComplete();
            },
        });
    };

    closeBtn.onclick = dismiss;
    overlay.onclick = (e) => {
        if (e.target === overlay) dismiss();
    };

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
        dismiss();
    }, 3500);
}

export const animatePaymentSuccessful = animatePaymentSuccess;



