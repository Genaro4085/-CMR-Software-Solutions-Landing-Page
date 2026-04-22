/* CMR Software Solutions — comportamiento del sitio (scroll, carruseles, formulario) */

(function () {
    var toggle = document.querySelector(".js-nav-toggle");
    var nav = document.querySelector(".site-nav");
    var menu = document.getElementById("nav-primary");
    if (!toggle || !nav || !menu) return;

    function setMenuOpen(open, opts) {
        opts = opts || {};
        nav.classList.toggle("menu-open", open);
        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute(
            "aria-label",
            open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
        );
        document.body.classList.toggle("nav-menu-open", open);
        if (open) {
            var first = menu.querySelector("a, button");
            if (first && typeof first.focus === "function") {
                window.setTimeout(function () {
                    try {
                        first.focus({ preventScroll: true });
                    } catch (err) {
                        first.focus();
                    }
                }, 0);
            }
        } else if (opts.focusToggle !== false) {
            try {
                toggle.focus({ preventScroll: true });
            } catch (err2) {
                toggle.focus();
            }
        }
    }

    toggle.addEventListener("click", function () {
        setMenuOpen(!nav.classList.contains("menu-open"));
    });

    menu.addEventListener("click", function (e) {
        if (e.target.closest("a") || e.target.closest(".btn-nav")) {
            setMenuOpen(false, { focusToggle: false });
        }
    });

    window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 961px)").matches) {
            setMenuOpen(false, { focusToggle: false });
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        if (!nav.classList.contains("menu-open")) return;
        setMenuOpen(false);
    });
})();

(function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    var waChatUrl =
        "https://wa.me/5493364578599?text=" +
        encodeURIComponent("Hola CMR, me gustaría recibir información sobre sus servicios.");

    document.addEventListener("click", function (e) {
        if (e.target.closest(".js-goto-asesoramiento")) {
            window.location.href = "asesoramiento.html";
            return;
        }
        if (e.target.closest(".btn-whatsapp")) {
            e.preventDefault();
            var winWa = window.open(waChatUrl, "_blank");
            if (winWa) {
                winWa.opener = null;
            }
            return;
        }
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        var href = a.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        if (reduceMotion) return;

        e.preventDefault();
        var start = window.scrollY;
        var end = target.getBoundingClientRect().top + start;
        var distance = Math.abs(end - start);
        if (distance < 3) {
            history.pushState(null, "", href);
            return;
        }
        var duration = Math.min(2600, Math.max(480, distance * 0.7));
        var t0 = null;

        function step(ts) {
            if (t0 === null) t0 = ts;
            var elapsed = ts - t0;
            var p = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + (end - start) * easeInOutCubic(p));
            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                history.pushState(null, "", href);
            }
        }
        requestAnimationFrame(step);
    });
})();

(function () {
    function debounce(fn, ms) {
        var t;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function () {
                fn.apply(ctx, args);
            }, ms);
        };
    }

    function initProyectoRing(root) {
        var viewport = root.querySelector(".proyecto-ring-viewport");
        var track = root.querySelector(".proyecto-ring-track");
        if (!viewport || !track) return;

        var slides = track.querySelectorAll(".proyecto-ring-face");
        var n = slides.length;
        if (n < 1) return;

        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var index = 0;
        var prevBtn = root.querySelector(".carousel-3d-prev");
        var nextBtn = root.querySelector(".carousel-3d-next");
        var dots = root.querySelector(".carousel-3d-dots");
        var progressEl = root.querySelector(".proyecto-ring-progress");
        var step = 360 / n;

        function tzPx() {
            var first = slides[0];
            var faceW = first && first.offsetWidth ? first.offsetWidth : 186;
            var half = Math.max(faceW * 0.5, 68);
            var s = Math.sin(Math.PI / n);
            if (!s || s < 0.001) return Math.max(64, Math.round(half * 1.12));
            /* Radio un poco mayor que el polígono tangente → breve espacio angular entre tarjetas */
            var tangentR = half / s;
            return Math.max(54, Math.round(tangentR * 1.034));
        }

        function centerFacePivots() {
            var el = slides[0];
            if (!el || !el.offsetWidth) return;
            var mw = -el.offsetWidth / 2;
            var mh = -el.offsetHeight / 2;
            for (var i = 0; i < n; i++) {
                slides[i].style.left = "50%";
                slides[i].style.top = "50%";
                slides[i].style.marginLeft = mw + "px";
                slides[i].style.marginTop = mh + "px";
            }
        }

        function layoutFaces() {
            centerFacePivots();
            var tz = tzPx();
            for (var i = 0; i < n; i++) {
                slides[i].style.transform =
                    "rotateY(" + (i * step).toFixed(4) + "deg) translateZ(" + tz + "px)";
            }
        }

        function syncTrackTransform(instant) {
            var deg = -index * step;
            var skipAnim = instant || reduceMotion;
            if (skipAnim) {
                track.style.transition = "none";
            } else {
                track.style.removeProperty("transition");
            }
            track.style.transform = "rotateY(" + deg.toFixed(4) + "deg)";
            if (skipAnim) {
                track.offsetHeight;
                if (!reduceMotion) {
                    track.style.removeProperty("transition");
                }
            }
        }

        function syncDots() {
            if (!dots) return;
            var spans = dots.querySelectorAll("span");
            for (var j = 0; j < spans.length; j++) {
                spans[j].classList.toggle("is-active", j === index);
            }
        }

        function syncProgress() {
            if (progressEl) {
                progressEl.textContent = index + 1 + " / " + n;
            }
        }

        function syncProyectoActivoIfUnified() {
            var s = slides[index];
            if (!s) return;
            var p = s.getAttribute("data-proyecto");
            if (p == null) return;
            if (root.dataset.activeProyectoUi !== p) {
                root.dataset.activeProyectoUi = p;
                document.dispatchEvent(
                    new CustomEvent("cmr-proyecto-activo", { detail: { index: parseInt(p, 10) } })
                );
            }
        }

        function setIndex(i, instant) {
            index = ((i % n) + n) % n;
            syncTrackTransform(!!instant);
            syncDots();
            syncProgress();
            syncProyectoActivoIfUnified();
        }

        function renderDots() {
            if (!dots) return;
            dots.innerHTML = "";
            for (var i = 0; i < n; i++) {
                var sp = document.createElement("span");
                if (i === 0) sp.className = "is-active";
                sp.title = "Ir a la captura " + (i + 1);
                (function (j) {
                    sp.addEventListener("click", function () {
                        setIndex(j, false);
                    });
                })(i);
                dots.appendChild(sp);
            }
        }

        function relayout() {
            layoutFaces();
            syncTrackTransform(true);
        }

        var debouncedRelayout = debounce(relayout, 90);

        renderDots();
        layoutFaces();
        syncTrackTransform(true);
        syncDots();
        syncProgress();
        syncProyectoActivoIfUnified();

        window.addEventListener("resize", debouncedRelayout);
        if (typeof ResizeObserver !== "undefined") {
            var ro = new ResizeObserver(function () {
                debouncedRelayout();
            });
            ro.observe(viewport);
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                setIndex(index - 1, false);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                setIndex(index + 1, false);
            });
        }

        viewport.addEventListener(
            "wheel",
            function (e) {
                var dx = e.deltaX;
                var dy = e.deltaY;
                if (Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > 6) {
                    e.preventDefault();
                    setIndex(index + (dy > 0 ? 1 : -1), false);
                } else if (Math.abs(dx) > 6) {
                    e.preventDefault();
                    setIndex(index + (dx > 0 ? 1 : -1), false);
                }
            },
            { passive: false }
        );

        var ptrDownX = null;
        var ptrId = null;

        function suppressNextLightboxClick() {
            root.dataset.ringSuppressLightbox = "1";
            clearTimeout(root._ringSuppressLbT);
            root._ringSuppressLbT = setTimeout(function () {
                delete root.dataset.ringSuppressLightbox;
            }, 450);
        }

        viewport.addEventListener(
            "pointerdown",
            function (e) {
                if (e.pointerType === "mouse" && e.button !== 0) return;
                ptrDownX = e.clientX;
                ptrId = e.pointerId;
                /* No usar setPointerCapture: en varios navegadores el “click” pasa a dispararse
                   sobre el viewport y deja de encontrarse .proyecto-ring-face → no abre el lightbox. */
            },
            { passive: true }
        );
        viewport.addEventListener(
            "pointerup",
            function (e) {
                if (ptrId !== e.pointerId || ptrDownX == null) return;
                var dx = e.clientX - ptrDownX;
                ptrDownX = null;
                ptrId = null;
                if (Math.abs(dx) < 40) return;
                suppressNextLightboxClick();
                setIndex(index + (dx < 0 ? 1 : -1), false);
            },
            { passive: true }
        );
        viewport.addEventListener(
            "pointercancel",
            function (e) {
                if (ptrId === e.pointerId) {
                    ptrDownX = null;
                    ptrId = null;
                }
            },
            { passive: true }
        );

        root.scrollToCoverflowSlide = function (idx, instantJump) {
            if (idx < 0) idx = 0;
            if (idx >= n) idx = n - 1;
            setIndex(idx, !!instantJump);
        };
        root.getNearestCoverflowIndex = function () {
            return index;
        };

        root.dataset.coverflowReady = "1";

        requestAnimationFrame(function () {
            requestAnimationFrame(relayout);
        });

        (function () {
            var imgs = track.querySelectorAll("img");
            var total = imgs.length;
            if (!total) return;
            var done = 0;
            function afterImages() {
                relayout();
            }
            imgs.forEach(function (im) {
                function onDone() {
                    done += 1;
                    if (done >= total) afterImages();
                }
                if (im.complete) onDone();
                else im.addEventListener("load", onDone, { once: true });
            });
        })();
    }

    function initCoverflows() {
        document.querySelectorAll("#proyectos .proyecto-carousel").forEach(function (root) {
            if (root.dataset.coverflowReady) return;
            if (root.classList.contains("js-proyecto-carousel-continuo")) {
                initProyectoRing(root);
                return;
            }
            var scroller = root.querySelector(".proyecto-coverflow-scroller");
            var strip = root.querySelector(".proyecto-coverflow-strip");
            if (!scroller || !strip) return;

            var slides = strip.querySelectorAll(".proyecto-coverflow-slide");
            var n = slides.length;
            if (n < 1) return;

            var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            var prevBtn = root.querySelector(".carousel-3d-prev");
            var nextBtn = root.querySelector(".carousel-3d-next");
            var dots = root.querySelector(".carousel-3d-dots");

            function slideCenter(slide) {
                return slide.offsetLeft + slide.offsetWidth / 2;
            }

            function syncDots() {
                if (!dots) return;
                var mid = scroller.scrollLeft + scroller.clientWidth / 2;
                var best = 0;
                var bestD = Infinity;
                for (var i = 0; i < n; i++) {
                    var d = Math.abs(slideCenter(slides[i]) - mid);
                    if (d < bestD) {
                        bestD = d;
                        best = i;
                    }
                }
                var spans = dots.querySelectorAll("span");
                for (var j = 0; j < spans.length; j++) {
                    spans[j].classList.toggle("is-active", j === best);
                }
            }

            function syncProyectoActivoIfUnified() {
                if (!root.classList.contains("js-proyecto-carousel-continuo")) return;
                var ni = nearestIndex();
                var s = slides[ni];
                if (!s) return;
                var p = s.getAttribute("data-proyecto");
                if (p == null) return;
                if (root.dataset.activeProyectoUi !== p) {
                    root.dataset.activeProyectoUi = p;
                    document.dispatchEvent(
                        new CustomEvent("cmr-proyecto-activo", { detail: { index: parseInt(p, 10) } })
                    );
                }
            }

            function updateTransforms() {
                var mid = scroller.scrollLeft + scroller.clientWidth / 2;
                if (reduceMotion) {
                    for (var r = 0; r < n; r++) {
                        slides[r].style.transform = "";
                    }
                    syncDots();
                    syncProyectoActivoIfUnified();
                    return;
                }
                var norm = scroller.clientWidth * 0.52;
                if (norm < 120) norm = 120;
                var maxRy = 36;
                var minScale = 0.74;
                var maxTy = 12;
                var isCilindro = root.classList.contains("js-proyecto-carousel-continuo");
                for (var i = 0; i < n; i++) {
                    var slide = slides[i];
                    var c = slideCenter(slide);
                    var dist = (c - mid) / norm;
                    if (dist > 1.35) dist = 1.35;
                    if (dist < -1.35) dist = -1.35;
                    var absd = Math.abs(dist);
                    var ry = dist * maxRy;
                    var scale = 1 - Math.min(1, absd) * (1 - minScale);
                    var ty = -absd * maxTy;
                    if (isCilindro) {
                        /* Cilindro: las laterales se alejan en Z y giran, como si rodearan un tambor */
                        var tz = -Math.pow(absd, 1.22) * 52;
                        if (tz < -56) tz = -56;
                        var rx = -absd * 8;
                        slide.style.transform =
                            "translateZ(" +
                            tz.toFixed(1) +
                            "px) rotateX(" +
                            rx.toFixed(2) +
                            "deg) rotateY(" +
                            ry.toFixed(2) +
                            "deg) scale(" +
                            scale.toFixed(3) +
                            ") translateY(" +
                            ty.toFixed(1) +
                            "px)";
                    } else {
                        slide.style.transform =
                            "perspective(900px) rotateY(" +
                            ry.toFixed(2) +
                            "deg) scale(" +
                            scale.toFixed(3) +
                            ") translateY(" +
                            ty.toFixed(1) +
                            "px)";
                    }
                }
                syncDots();
                syncProyectoActivoIfUnified();
            }

            function renderDots() {
                if (!dots) return;
                dots.innerHTML = "";
                for (var i = 0; i < n; i++) {
                    var s = document.createElement("span");
                    if (i === 0) s.className = "is-active";
                    dots.appendChild(s);
                }
            }

            function nearestIndex() {
                var mid = scroller.scrollLeft + scroller.clientWidth / 2;
                var best = 0;
                var bestD = Infinity;
                for (var i = 0; i < n; i++) {
                    var d = Math.abs(slideCenter(slides[i]) - mid);
                    if (d < bestD) {
                        bestD = d;
                        best = i;
                    }
                }
                return best;
            }

            function scrollToIndex(idx, instant) {
                if (idx < 0) idx = 0;
                if (idx >= n) idx = n - 1;
                var slide = slides[idx];
                var ideal = slideCenter(slide) - scroller.clientWidth / 2;
                var maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
                var target = Math.max(0, Math.min(ideal, maxScroll));
                /* Si el centrado ideal queda más allá del fin (redondeos / snap), ir al tope derecho */
                if (idx === n - 1 && maxScroll > 0 && ideal >= maxScroll - 1.5) {
                    target = maxScroll;
                }
                if (instant) {
                    scroller.scrollLeft = target;
                } else {
                    scroller.scrollTo({ left: target, behavior: "smooth" });
                }
            }

            renderDots();

            var raf = 0;
            function requestUpdate() {
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    raf = 0;
                    updateTransforms();
                });
            }

            scroller.addEventListener("scroll", requestUpdate, { passive: true });
            var relayout = debounce(function () {
                updateTransforms();
            }, 100);
            window.addEventListener("resize", relayout);

            if (typeof ResizeObserver !== "undefined") {
                var ro = new ResizeObserver(function () {
                    requestUpdate();
                });
                ro.observe(scroller);
            }

            if (prevBtn) {
                prevBtn.addEventListener("click", function () {
                    scrollToIndex(nearestIndex() - 1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    scrollToIndex(nearestIndex() + 1);
                });
            }

            root.scrollToCoverflowSlide = function (idx, instantJump) {
                scrollToIndex(idx, !!instantJump);
            };
            root.getNearestCoverflowIndex = nearestIndex;

            root.dataset.coverflowReady = "1";
            scrollToIndex(0, true);
            requestUpdate();

            (function () {
                var imgs = strip.querySelectorAll("img");
                var total = imgs.length;
                if (!total) return;
                var done = 0;
                function afterImages() {
                    scrollToIndex(nearestIndex(), true);
                    requestUpdate();
                }
                imgs.forEach(function (im) {
                    function onDone() {
                        done += 1;
                        if (done >= total) afterImages();
                    }
                    if (im.complete) onDone();
                    else im.addEventListener("load", onDone, { once: true });
                });
            })();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCoverflows);
    } else {
        initCoverflows();
    }
})();

(function () {
    function setupProyectoShowcaseTabs() {
        var wrap = document.getElementById("proyecto-showcase");
        if (!wrap) return;

        var car = wrap.querySelector(".js-proyecto-carousel-continuo");
        var tabs = wrap.querySelectorAll(".proyecto-tab");
        var descs = wrap.querySelectorAll(".proyecto-desc-panel");

        if (!car || !tabs.length) return;

        var slides = car.querySelectorAll(".proyecto-coverflow-slide");
        var firstSlideByProject = [];
        slides.forEach(function (s, i) {
            var p = parseInt(s.getAttribute("data-proyecto"), 10);
            if (!isNaN(p) && firstSlideByProject[p] === undefined) {
                firstSlideByProject[p] = i;
            }
        });

        function setUIToProject(idx) {
            if (idx < 0) idx = 0;
            if (idx >= tabs.length) idx = tabs.length - 1;
            car.dataset.activeProyectoUi = String(idx);

            tabs.forEach(function (tab, j) {
                var on = j === idx;
                tab.classList.toggle("is-active", on);
                tab.setAttribute("aria-selected", on ? "true" : "false");
                tab.tabIndex = on ? 0 : -1;
            });

            descs.forEach(function (d, j) {
                var on = j === idx;
                d.classList.toggle("is-active", on);
                if (on) {
                    d.removeAttribute("hidden");
                } else {
                    d.setAttribute("hidden", "");
                }
            });
        }

        function goToProject(projectIndex, instantJump) {
            var slideIdx = firstSlideByProject[projectIndex];
            if (slideIdx === undefined) return;
            if (typeof car.scrollToCoverflowSlide === "function") {
                car.scrollToCoverflowSlide(slideIdx, !!instantJump);
            }
            setUIToProject(projectIndex);
            window.dispatchEvent(new Event("resize"));
        }

        document.addEventListener("cmr-proyecto-activo", function (e) {
            if (!e.detail || typeof e.detail.index !== "number") return;
            setUIToProject(e.detail.index);
        });

        tabs.forEach(function (tab, idx) {
            tab.addEventListener("click", function () {
                goToProject(idx, false);
            });

            tab.addEventListener("keydown", function (e) {
                if (e.key === "ArrowRight") {
                    e.preventDefault();
                    var next = Math.min(tabs.length - 1, idx + 1);
                    goToProject(next, false);
                    tabs[next].focus();
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    var prev = Math.max(0, idx - 1);
                    goToProject(prev, false);
                    tabs[prev].focus();
                } else if (e.key === "Home") {
                    e.preventDefault();
                    goToProject(0, false);
                    tabs[0].focus();
                } else if (e.key === "End") {
                    e.preventDefault();
                    var last = tabs.length - 1;
                    goToProject(last, false);
                    tabs[last].focus();
                }
            });
        });

        if (typeof car.scrollToCoverflowSlide === "function") {
            setUIToProject(0);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupProyectoShowcaseTabs);
    } else {
        setupProyectoShowcaseTabs();
    }
})();

(function () {
    var section = document.getElementById("proyectos");
    var lb = document.getElementById("proyecto-captura-lightbox");
    var host = document.getElementById("proyecto-lightbox-carousel-host");
    if (!section || !lb || !host) return;

    var inner = lb.querySelector(".proyecto-captura-lightbox-inner");
    var backdrop = lb.querySelector(".proyecto-captura-lightbox-backdrop");
    var closeBtn = lb.querySelector(".proyecto-captura-lightbox-close");

    var stripEl = null;

    function scrollStrip(delta) {
        if (!stripEl) return;
        var w = stripEl.clientWidth;
        stripEl.scrollBy({ left: delta * w, behavior: "smooth" });
    }

    function openLightbox(anchor) {
        var carousel = anchor.closest(".proyecto-carousel");
        if (!carousel) return;

        var ringTrack = carousel.querySelector(".proyecto-ring-track");
        var slideEls = [];
        var idx = 0;
        var total = 0;

        if (ringTrack) {
            slideEls = Array.prototype.slice.call(ringTrack.querySelectorAll(".proyecto-ring-face"));
            total = slideEls.length;
            if (!total) return;
            var fig = anchor.closest(".proyecto-ring-face");
            idx = fig ? slideEls.indexOf(fig) : 0;
            if (idx < 0) idx = 0;
        } else {
            var imgs = carousel.querySelectorAll(
                ".proyecto-coverflow-slide img, .proyecto-ring-face img, .carousel-3d-face img"
            );
            total = imgs.length;
            if (!total) return;
            if (anchor.nodeName !== "IMG") return;
            for (var j = 0; j < imgs.length; j++) {
                if (imgs[j] === anchor) {
                    idx = j;
                    break;
                }
            }
        }

        host.innerHTML = "";
        stripEl = null;

        var wrap = document.createElement("div");
        wrap.className = "proyecto-lightbox-viewer";
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "Galería del proyecto");

        var strip = document.createElement("div");
        strip.className = "proyecto-lightbox-strip";
        strip.setAttribute("tabindex", "0");
        strip.setAttribute("aria-roledescription", "carrusel");
        strip.setAttribute(
            "aria-label",
            "Deslizá horizontalmente o usá las flechas para ver cada captura y portada"
        );

        function appendSlideFromRingFace(face, i) {
            var slide = document.createElement("div");
            slide.className = "proyecto-lightbox-slide";
            var innerImg = face.querySelector("img");
            if (innerImg) {
                slide.classList.add("proyecto-lightbox-slide--media");
                slide.setAttribute("aria-label", "Captura " + (i + 1) + " de " + total);
                var img = document.createElement("img");
                img.src = innerImg.getAttribute("src") || "";
                img.alt = innerImg.getAttribute("alt") || "";
                img.loading = "eager";
                img.decoding = "async";
                img.draggable = false;
                slide.appendChild(img);
            } else {
                slide.classList.add("proyecto-lightbox-slide--portada");
                slide.setAttribute("aria-label", "Portada del proyecto — " + (i + 1) + " de " + total);
                var portWrap = document.createElement("div");
                portWrap.className = "proyecto-lightbox-portada";
                var dp = face.getAttribute("data-proyecto");
                if (dp != null) portWrap.setAttribute("data-proyecto", dp);
                var portInner = face.querySelector(".proyecto-portada-inner");
                if (portInner) {
                    portWrap.appendChild(portInner.cloneNode(true));
                }
                slide.appendChild(portWrap);
            }
            strip.appendChild(slide);
        }

        if (ringTrack) {
            for (var r = 0; r < slideEls.length; r++) {
                appendSlideFromRingFace(slideEls[r], r);
            }
        } else {
            var imgsLegacy = carousel.querySelectorAll(
                ".proyecto-coverflow-slide img, .proyecto-ring-face img, .carousel-3d-face img"
            );
            for (var k = 0; k < imgsLegacy.length; k++) {
                var slideL = document.createElement("div");
                slideL.className = "proyecto-lightbox-slide proyecto-lightbox-slide--media";
                slideL.setAttribute("aria-label", "Captura " + (k + 1) + " de " + total);
                var imgL = document.createElement("img");
                imgL.src = imgsLegacy[k].getAttribute("src") || "";
                imgL.alt = imgsLegacy[k].getAttribute("alt") || "";
                imgL.loading = "eager";
                imgL.decoding = "async";
                imgL.draggable = false;
                slideL.appendChild(imgL);
                strip.appendChild(slideL);
            }
        }

        if (total > 1) {
            var prev = document.createElement("button");
            prev.type = "button";
            prev.className = "proyecto-lightbox-flecha proyecto-lightbox-flecha--prev";
            prev.setAttribute("aria-label", "Imagen anterior");
            prev.innerHTML = "&#8249;";
            prev.addEventListener("click", function (e) {
                e.stopPropagation();
                scrollStrip(-1);
            });

            var next = document.createElement("button");
            next.type = "button";
            next.className = "proyecto-lightbox-flecha proyecto-lightbox-flecha--next";
            next.setAttribute("aria-label", "Imagen siguiente");
            next.innerHTML = "&#8250;";
            next.addEventListener("click", function (e) {
                e.stopPropagation();
                scrollStrip(1);
            });

            wrap.appendChild(prev);
            wrap.appendChild(strip);
            wrap.appendChild(next);
        } else {
            wrap.appendChild(strip);
        }

        host.appendChild(wrap);
        stripEl = strip;

        lb.hidden = false;
        document.body.style.overflow = "hidden";

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (!stripEl) return;
                var w = stripEl.clientWidth;
                stripEl.scrollLeft = idx * w;
                try {
                    stripEl.focus({ preventScroll: true });
                } catch (err) {
                    stripEl.focus();
                }
            });
        });
    }

    function closeLightbox() {
        stripEl = null;
        host.innerHTML = "";
        lb.hidden = true;
        document.body.style.overflow = "";
    }

    function findRingFigureFromClick(e, ringTrack) {
        var fig = e.target.closest(".proyecto-ring-face");
        if (fig && ringTrack.contains(fig)) return fig;
        var path = typeof e.composedPath === "function" ? e.composedPath() : [];
        for (var i = 0; i < path.length; i++) {
            var node = path[i];
            if (!node || node.nodeType !== 1 || !node.classList) continue;
            if (node.classList.contains("proyecto-ring-face") && ringTrack.contains(node)) {
                return node;
            }
        }
        return null;
    }

    section.addEventListener("click", function (e) {
        var carousel = e.target.closest(".proyecto-carousel");
        if (!carousel) return;
        if (carousel.dataset.ringSuppressLightbox === "1") {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        var ringTrack = carousel.querySelector(".proyecto-ring-track");
        if (ringTrack) {
            if (e.target.closest(".carousel-3d-controls")) return;
            var fig = findRingFigureFromClick(e, ringTrack);
            if (!fig) return;
            openLightbox(fig);
            return;
        }
        var t = e.target;
        if (!t || t.nodeName !== "IMG") return;
        openLightbox(t);
    });

    if (backdrop) {
        backdrop.addEventListener("click", closeLightbox);
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            closeLightbox();
        });
    }
    if (inner) {
        inner.addEventListener("click", function (e) {
            if (e.target === inner) closeLightbox();
        });
    }
    document.addEventListener("keydown", function (e) {
        if (!lb || lb.hidden) return;
        if (e.key === "Escape") {
            closeLightbox();
            return;
        }
        if (!stripEl) return;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollStrip(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollStrip(1);
        }
    });
})();

(function () {
    var form = document.getElementById("form-asesoramiento");
    if (!form) return;
    var errEl = document.getElementById("form-asesoramiento-error");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (errEl) {
            errEl.hidden = true;
            errEl.textContent = "";
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var necesidades = form.querySelectorAll('input[name="necesidad"]:checked');
        if (necesidades.length === 0) {
            if (errEl) {
                errEl.textContent = "Marcá al menos una opción en «¿Qué tipo de necesidad tenés?».";
                errEl.hidden = false;
            }
            return;
        }

        function val(id) {
            var el = document.getElementById(id);
            return el ? (el.value || "").trim() : "";
        }

        var lineas = [];
        lineas.push("=== Solicitud de asesoramiento — CMR Software Solutions ===");
        lineas.push("");
        lineas.push("Nombre: " + val("fa-nombre"));
        lineas.push("Empresa: " + val("fa-empresa"));
        lineas.push("Rubro: " + val("fa-rubro"));
        lineas.push("Email: " + val("fa-email"));
        lineas.push("Teléfono / WhatsApp: " + val("fa-telefono"));
        lineas.push("");
        lineas.push("Necesidad / interés:");
        necesidades.forEach(function (cb) {
            lineas.push("  • " + cb.value);
        });
        lineas.push("");
        lineas.push("Cómo trabajan hoy:");
        lineas.push(val("fa-hoy") || "—");
        lineas.push("");
        lineas.push("Principal problema u objetivo:");
        lineas.push(val("fa-problema"));
        lineas.push("");
        lineas.push("Usuarios aproximados: " + (val("fa-usuarios") || "—"));
        lineas.push("Plazo: " + (val("fa-plazo") || "—"));
        lineas.push("Inversión orientativa: " + (val("fa-presupuesto") || "—"));
        lineas.push("");
        lineas.push("Información adicional:");
        lineas.push(val("fa-extra") || "—");

        var cuerpo = lineas.join("\n");
        var maxLen = 1900;
        if (cuerpo.length > maxLen) {
            cuerpo = cuerpo.slice(0, maxLen) + "\n… [mensaje recortado por límite del cliente de correo]";
        }

        var empresa = val("fa-empresa");
        var asunto = "Solicitud asesoramiento" + (empresa ? " — " + empresa : " — " + val("fa-nombre"));
        window.location.href =
            "mailto:cmrsoftware.sn@gmail.com?subject=" +
            encodeURIComponent(asunto) +
            "&body=" +
            encodeURIComponent(cuerpo);
    });

    document.addEventListener("click", function (e) {
        if (e.target.closest(".js-scroll-form")) {
            e.preventDefault();
            document.getElementById("asesoramiento").scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
})();
