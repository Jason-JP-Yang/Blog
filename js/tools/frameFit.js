let MESSAGE="umami-frame-size",SETTLE_MS=400,posted=0,timer=null;function isFramed(){return!!window.__umamiFramed}function report(){var e=document.documentElement,e=Math.max(e.scrollHeight,document.body?document.body.scrollHeight:0);if(e&&!(Math.abs(e-posted)<8)){posted=e;try{window.parent.postMessage({type:MESSAGE,height:e},"*")}catch{}}}function schedule(){clearTimeout(timer),timer=setTimeout(report,SETTLE_MS)}function freeze(){var e=document.createElement("style");e.textContent=`
    [data-framed="umami"] .preloader,
    [data-framed="umami"] .progress-bar-container,
    [data-framed="umami"] .side-tools-container,
    [data-framed="umami"] .post-tools-container { display: none !important; }
    [data-framed="umami"] *,
    [data-framed="umami"] *::before,
    [data-framed="umami"] *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
    /* The whole point: viewport units bound to the visitor's screen, not to a
       frame that is as tall as the document. */
    [data-framed="umami"] .home-banner-container { min-height: var(--frame-vh) !important; }
    [data-framed="umami"] .home-banner-container .description { min-height: calc(var(--frame-vh) * 0.9) !important; }
    [data-framed="umami"] .home-banner-background { height: var(--frame-vh) !important; }
  `,document.head.appendChild(e),document.querySelectorAll("img[loading='lazy']").forEach(e=>{e.loading="eager";var t=e.getAttribute("data-src");t&&!e.getAttribute("src")&&(e.src=t)})}export default function initFrameFit(){isFramed()&&(freeze(),schedule(),window.addEventListener("load",schedule),document.fonts&&document.fonts.ready&&document.fonts.ready.then(schedule),"undefined"!=typeof ResizeObserver)&&document.body&&new ResizeObserver(schedule).observe(document.body)}export{isFramed};