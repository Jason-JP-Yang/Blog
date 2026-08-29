let OPEN="is-open",MIN_PAGE=148,CONFIRM_MS=4e3,UNITS=[["year",31536e3],["month",2592e3],["week",604800],["day",86400],["hour",3600],["minute",60],["second",1]];function timeAgo(e){var e="number"==typeof e?1e3*e:new Date(e).getTime(),t=window.lang_ago||{};if(!isNaN(e)){var n,s,a=Math.max(0,Math.floor((Date.now()-e)/1e3));for([n,s]of UNITS)if(a>=s||"second"===n){let e=Math.floor(a/s);return(t[n]||`%s ${n}s ago`).replace("%s",String(e))}}return""}function escapeHTML(e){return String(null==e?"":e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function t(e,t){return(window.theme&&window.theme.notifications_i18n||{})[e]||t}function getPanel(){return document.getElementById("notifications-panel")}function isOpen(){var e=getPanel();return!!e&&e.classList.contains(OPEN)}function releaseFocus(e,t=!1){var n=document.activeElement;if(n&&e.contains(n)){if(t){e=Array.from(document.querySelectorAll(".notifications-bell, .follow-trigger")).find(e=>null!==e.offsetParent);if(e)return void e.focus({preventScroll:!0})}n.blur()}}function setInertLater(e,t){t?requestAnimationFrame(()=>{e.isConnected&&!e.classList.contains(OPEN)&&e.setAttribute("inert","")}):e.removeAttribute("inert")}function setOpen(t,{returnFocus:e=!0}={}){var n,s=getPanel();s&&(n=document.getElementById("notifications-mask"),t||releaseFocus(s,e),s.classList.toggle(OPEN,t),s.setAttribute("aria-hidden",t?"false":"true"),setInertLater(s,!t),n&&n.classList.toggle(OPEN,t),t?setPage("inbox",!1):disarmConfirm(),document.querySelectorAll(".notifications-bell").forEach(e=>{e.setAttribute("aria-expanded",t?"true":"false"),e.classList.toggle("is-active",t)}))}function setBadge(s){document.querySelectorAll(".notifications-bell").forEach(e=>{var t,n=e.querySelector(".bell-badge");n&&(t=Number(s)||0,n.textContent=99<t?"99+":String(t),e.classList.toggle("has-unread",0<t))})}function setBusy(e,t){e&&(e.classList.toggle("is-busy",!!t),"disabled"in e&&(e.disabled=!!t),e=e.querySelector("i"))&&(t?(e.dataset.rest||(e.dataset.rest=e.className),e.className="fa-solid fa-circle-notch fa-spin"):e.dataset.rest&&(e.className=e.dataset.rest,delete e.dataset.rest))}function setPanelBusy(e){var t=getPanel();t&&t.classList.toggle("is-busy",!!e)}let armedEl=null,armedKey="",armedTimer=0;function disarmConfirm(){var e;armedTimer&&clearTimeout(armedTimer),armedTimer=0,armedEl&&armedEl.isConnected&&(armedEl.classList.remove("is-confirm"),(e=armedEl.querySelector(".np-btn-label"))&&armedEl.dataset.rest&&(e.textContent=armedEl.dataset.rest),(e=armedEl.querySelector("i"))&&e.dataset.armed&&(e.className=e.dataset.armed,delete e.dataset.armed),delete armedEl.dataset.rest),armedEl=null,armedKey=""}function confirmStep(e,t,n){if(armedKey===t&&armedEl===e)return disarmConfirm(),!0;disarmConfirm(),armedEl=e,armedKey=t,e.classList.add("is-confirm");t=e.querySelector(".np-btn-label"),t&&(e.dataset.rest=t.textContent,t.textContent=n),t=e.querySelector("i");return t&&(t.dataset.armed=t.className,t.className="fa-solid fa-check"),armedTimer=setTimeout(disarmConfirm,CONFIRM_MS),!1}let currentPage="inbox";function getPage(){return currentPage}function setPage(e,t=!0){var s=getPanel();if(s){e="manage"===e?"manage":"inbox";let n=e!==currentPage;currentPage=e,n&&disarmConfirm(),s.dataset.page=currentPage,s.querySelectorAll(".np-page").forEach(e=>{var t=e.dataset.page===currentPage;t||releaseFocus(e),e.classList.toggle("is-current",t),e.setAttribute("aria-hidden",t?"false":"true"),t?e.removeAttribute("inert"):e.setAttribute("inert",""),t&&n&&(t=e.querySelector(".np-scroll"))&&(t.scrollTop=0)}),syncHead(s),fitViewport(t)}}let canMarkRead=!1,isBanned=!1;function syncHead(e){var n="manage"===currentPage,s=e.querySelector(".np-title"),a=e.querySelector(".np-back"),e=e.querySelector(".np-mark-read");s&&(s.textContent=n?t("manage_title","Manage subscription"):t("title","Notifications")),a&&(a.hidden=!n||isBanned),e&&(e.hidden=n||!canMarkRead)}function pageCap(e){var t=parseFloat(getComputedStyle(e).maxHeight),t=Number.isFinite(t)?t:.8*window.innerHeight;let n=0;return e.querySelectorAll(".np-head, .np-progress").forEach(e=>{n+=e.getBoundingClientRect().height}),Math.max(MIN_PAGE,t-n)}function naturalHeight(e){var t=e.querySelector(".np-scroll"),t=t&&t.firstElementChild,e=e.querySelector(".np-foot"),t=(t?t.getBoundingClientRect().height:0)+(e?e.getBoundingClientRect().height:0);return Math.ceil(t)}function fitViewport(e=!0){var t,n,s=getPanel();s&&(t=s.querySelector(".np-viewport"),n=s.querySelector(".np-page.is-current"),t)&&n&&(s=Math.min(Math.floor(pageCap(s)),Math.max(MIN_PAGE,naturalHeight(n))),e?t.style.height=s+"px":(t.style.transition="none",t.style.height=s+"px",t.offsetHeight,t.style.transition=""),updateProgress())}function updateProgress(){var e,t,n=getPanel();n&&(e=n.querySelector(".np-progress-bar"),n=n.querySelector(".np-page.is-current .np-scroll"),e)&&n&&(n=(t=n.scrollHeight-n.clientHeight)<=1?1:Math.min(1,Math.max(0,n.scrollTop/t)),e.style.width=(100*n).toFixed(2)+"%")}let progressFrame=0;function scheduleProgress(){progressFrame=progressFrame||requestAnimationFrame(()=>{progressFrame=0,updateProgress()})}function wireChrome(e){!e.dataset.chromeWired&&(e.dataset.chromeWired="1",e.querySelectorAll(".np-scroll").forEach(e=>{e.addEventListener("scroll",scheduleProgress,{passive:!0})}),e=e.querySelector(".np-viewport"))&&e.addEventListener("transitionend",e=>{"height"===e.propertyName&&updateProgress()})}function itemHTML(e){var t=!e.read_at,n="note"===e.type?"fa-comment-dots":"announcement"===e.type?"fa-bullhorn":"fa-file-lines";return`
    <a class="np-item${t?" is-unread":""}" href="${escapeHTML(e.url)}" data-id="${escapeHTML(e.id)}">
      <span class="np-item-icon"><i class="fa-solid ${n}" aria-hidden="true"></i></span>
      <span class="np-item-main">
        <span class="np-item-title">${escapeHTML(e.title)}</span>
        ${e.body?`<span class="np-item-body">${escapeHTML(e.body)}</span>`:""}
        <span class="np-item-time">${escapeHTML(timeAgo(e.published_at))}</span>
      </span>
    </a>`}let DEVICE_ICONS={laptop:"fa-solid fa-laptop",desktop:"fa-solid fa-desktop",mobile:"fa-solid fa-mobile-screen-button",tablet:"fa-solid fa-tablet-screen-button"},BROWSERS=[[/Edg[A-Z]?\//,"Edge"],[/OPR\/|Opera/,"Opera"],[/SamsungBrowser/,"Samsung Internet"],[/Firefox\/|FxiOS/,"Firefox"],[/CriOS|Chrome\//,"Chrome"],[/Safari\//,"Safari"]],SYSTEMS=[[/Windows NT|Windows Phone/,"Windows"],[/iPhone|iPad|iPod|CPU OS \d/,"iOS"],[/Mac OS X|Macintosh/,"macOS"],[/Android/,"Android"],[/CrOS/,"ChromeOS"],[/Linux|X11/,"Linux"]];function matchFirst(e,t){for(var[n,s]of e)if(n.test(t))return s;return""}function describeDevice(e){var n=String(e.ua||"");let s=String(e.device||"").toLowerCase();DEVICE_ICONS[s]||(s=/iPad|Tablet/i.test(n)||/Android/.test(n)&&!/Mobile/.test(n)?"tablet":/iPhone|iPod|Mobile/.test(n)?"mobile":/Windows NT|Mac OS X|Macintosh|X11|CrOS/.test(n)?"desktop":"");e=t("unknown","Unknown");return{icon:DEVICE_ICONS[s]||"fa-brands fa-chromecast",browser:matchFirst(BROWSERS,n)||e,os:matchFirst(SYSTEMS,n)||e,kind:s?t("device_"+s,s.charAt(0).toUpperCase()+s.slice(1)):e}}function deviceHTML(e,n){var s=describeDevice(e),a=timeAgo(e.created_at),i=!!e.banned;return`
    <li class="np-device${n?" is-this":""}${i?" is-banned":""}">
      <span class="np-device-icon"><i class="${s.icon}" aria-hidden="true"></i></span>
      <span class="np-device-main">
        <span class="np-device-title">${escapeHTML(s.browser)}<span class="np-sep"></span>${escapeHTML(s.os)}<span class="np-sep"></span>${escapeHTML(s.kind)}${n?`<span class="np-device-tag">${escapeHTML(t("this_browser","This browser"))}</span>`:""}${i?`<span class="np-device-tag is-banned">${escapeHTML(t("banned","Banned"))}</span>`:""}</span>
        <span class="np-device-time">${escapeHTML(a?t("subscribed","Subscribed")+" "+a:t("subscribed","Subscribed"))}</span>
      </span>
      ${i?"":`<button type="button" class="np-device-remove" data-device="${escapeHTML(e.id)}"
              aria-label="${escapeHTML(t("remove_device","Remove this device"))}">
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
      </button>`}
    </li>`}function switchHTML({key:e,label:t,hint:n,on:s,locked:a=!1,disabled:i=!1}){var o=a||i;return`
    <div class="np-row${a?" is-locked":""}${i?" is-disabled":""}">
      <span class="np-row-main">
        <span class="np-row-label">${escapeHTML(t)}</span>
        ${n?`<span class="np-row-hint">${escapeHTML(n)}</span>`:""}
      </span>
      <button type="button" class="np-switch${s?" is-on":""}" role="switch"
              data-switch="${escapeHTML(e)}"
              aria-checked="${s?"true":"false"}"
              aria-label="${escapeHTML(t)}"${o?" disabled":""}>
        <span class="np-switch-knob"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
      </button>
    </div>`}function thisDeviceBanned(e){let t=e.endpointTail||"";return!!t&&(e.devices||[]).some(e=>e.tail===t&&e.banned)}function pushBlocker(e){return thisDeviceBanned(e)?t("push_device_banned","Push from this browser has been turned off by the blog owner."):"denied"===e.pushState?t("push_denied","Blocked in your browser's settings."):"insecure"===e.pushState?t("push_insecure","Push needs a secure connection (https, or localhost)."):"unsupported"===e.pushState?t("push_unsupported","This browser cannot receive push."):e.needsInstall?t("push_ios","On iPhone, add this site to your Home Screen first."):""}function bannedHTML(){return`
    <div class="np-banned">
      <i class="fa-solid fa-ban" aria-hidden="true"></i>
      <p class="np-banned-title">${escapeHTML(t("account_banned","Your account has been blocked"))}</p>
      <p class="np-banned-note">${escapeHTML(t("account_banned_note","You can stay signed in and keep commenting on posts — only the ability to subscribe to this blog has been withdrawn. If the owner has also blocked you on GitHub, commenting stops too."))}</p>
      <button type="button" class="np-quiet np-logout">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        <span class="np-btn-label">${escapeHTML(t("logout","Log out from this browser"))}</span>
      </button>
    </div>`}function renderManage(e,a){var i=e.querySelector(".np-manage");if(i){e=a.topics||[];let n=a.selected||[];var o=e=>0===n.length||-1!==n.indexOf(e),r=pushBlocker(a),r=[switchHTML({key:"inbox",label:t("opt_inbox","Receive messages inside the blog"),hint:t("always_on","Always on"),on:!0,locked:!0}),switchHTML({key:"push",label:t("opt_push","Receive push notifications from this browser"),hint:r||t("opt_push_hint","Registers this browser as a push device."),on:!!a.pushHere&&!thisDeviceBanned(a),disabled:!!r})],e=(-1!==e.indexOf("announcements")&&r.push(switchHTML({key:"announcements",label:t("opt_announcements","Receive blog announcements"),hint:t("always_on","Always on"),on:!0,locked:!0})),-1!==e.indexOf("notes")&&r.push(switchHTML({key:"notes",label:t("opt_notes","Receive new instant notes"),hint:"",on:o("notes")})),-1!==e.indexOf("posts")&&r.push(switchHTML({key:"posts",label:t("opt_posts","Receive new blog posts"),hint:"",on:o("posts")})),a.devices||[]);let s=a.endpointTail||"";var o=e.length?`<ul class="np-devices">${e.map(e=>deviceHTML(e,!!s&&e.tail===s)).join("")}</ul>`:`<p class="np-blank">${escapeHTML(t("no_devices","No browser is registered for push yet."))}</p>`,l=e.some(e=>e.banned)?`<p class="np-alert">
         <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
         <span>${escapeHTML(t("device_banned_note","One of the browsers above has been blocked from receiving notifications by the blog owner, and cannot be removed. This usually follows abuse of the subscription. Please use the blog considerately; if you believe this is a mistake, get in touch through the comments."))}</span>
       </p>`:"";if(i.innerHTML=`
    <section class="np-section">
      <h3 class="np-section-title">${escapeHTML(t("section_delivery","What you receive"))}</h3>
      ${r.join("")}
    </section>

    <section class="np-section">
      <h3 class="np-section-title">
        ${escapeHTML(t("section_devices","Registered devices"))}
        <span class="np-count">${e.length}</span>
      </h3>
      ${o}
      ${l}
    </section>

    <section class="np-section np-danger">
      <p class="np-note">${escapeHTML(t("logout_note","After logging out of this browser you can no longer comment on posts, react to photos in Masonry, or receive notifications and push here. The next time you sign in the blog tries to restore everything automatically; if that fails, press Follow again to get push back."))}</p>
      <button type="button" class="np-quiet np-logout">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        <span class="np-btn-label">${escapeHTML(t("logout","Log out from this browser"))}</span>
      </button>

      <p class="np-note">${escapeHTML(t("unfollow_note","You will stop following this blog and will no longer receive push notifications on any browser. Your inbox is cleared and cannot be recovered. You stay signed in — to sign out, use the comments tab under any post."))}</p>
      <button type="button" class="np-quiet np-unfollow">
        <i class="fa-solid fa-bell-slash" aria-hidden="true"></i>
        <span class="np-btn-label">${escapeHTML(t("unfollow_blog","Unfollow the blog"))}</span>
      </button>
    </section>

    <button type="button" class="np-action np-to-inbox">
      <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
      <span class="np-btn-label">${escapeHTML(t("back_to_inbox","Back to notifications"))}</span>
    </button>`,a.banned){var c=document.createElement("div");for(c.className="np-veiled",c.setAttribute("inert",""),c.setAttribute("aria-hidden","true");i.firstChild;)c.appendChild(i.firstChild);i.appendChild(c),i.insertAdjacentHTML("beforeend",bannedHTML())}}}function render(e){var n,s,a,i,o=getPanel();o&&(a=o.querySelector(".np-body"),n=o.querySelector(".np-foot"),a)&&n&&(wireChrome(o),s="following"===e.phase,o.classList.toggle("is-busy",!!e.busy),isBanned=!!e.banned,o.classList.toggle("is-banned",isBanned),setBadge(e.unread||0),canMarkRead=s&&0<e.unread&&!isBanned,isBanned?setPage("manage"):s||"manage"!==currentPage?syncHead(o):setPage("inbox"),"loading"===e.phase?a.innerHTML='<div class="np-empty"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></div>':"error"===e.phase?a.innerHTML=`
      <div class="np-empty">
        <i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i>
        <p>${escapeHTML(t("unreachable","Couldn't reach the notification service. Your subscription is unchanged."))}</p>
      </div>`:"signed-out"===e.phase?a.innerHTML=`
      <div class="np-empty">
        <i class="fa-regular fa-bell" aria-hidden="true"></i>
        <p>${escapeHTML(t("signed_out","Sign in with GitHub to follow this blog."))}</p>
      </div>`:e.items&&0!==e.items.length?a.innerHTML=`<div class="np-list">${e.items.map(itemHTML).join("")}</div>`:a.innerHTML=`
      <div class="np-empty">
        <i class="fa-regular fa-bell-slash" aria-hidden="true"></i>
        <p>${escapeHTML(s?t("empty_following","Nothing yet. New posts will show up here."):t("empty","Follow the blog to get notified about new posts."))}</p>
      </div>`,a=[],"error"===e.phase?a.push(`<button type="button" class="np-action np-retry"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("retry","Try again"))}</span></button>`):"signed-out"===e.phase?a.push(`<button type="button" class="np-action np-login"><i class="fa-brands fa-github" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("sign_in","Sign in with GitHub"))}</span></button>`):"not-following"===e.phase?a.push(`<button type="button" class="np-action np-follow"><i class="fa-regular fa-bell" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("follow","Follow this blog"))}</span></button>`):s&&((i=pushBlocker(e))&&a.push(`<p class="np-note">${escapeHTML(i)} ${escapeHTML(t("still_inbox","New items still appear here."))}</p>`),a.push(`<button type="button" class="np-action np-to-manage"><i class="fa-solid fa-sliders" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("manage","Manage subscription"))}</span></button>`)),n.innerHTML=a.join(""),(s||isBanned)&&renderManage(o,e),fitViewport(isOpen()))}export{timeAgo,escapeHTML,t,getPanel,isOpen,setOpen,setBadge,setBusy,setPanelBusy,disarmConfirm,confirmStep,getPage,setPage,fitViewport,describeDevice,render};