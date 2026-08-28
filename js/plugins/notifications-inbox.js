let OPEN="is-open",MIN_PAGE=148,CONFIRM_MS=4e3,UNITS=[["year",31536e3],["month",2592e3],["week",604800],["day",86400],["hour",3600],["minute",60],["second",1]];function timeAgo(e){var e="number"==typeof e?1e3*e:new Date(e).getTime(),t=window.lang_ago||{};if(!isNaN(e)){var s,n,a=Math.max(0,Math.floor((Date.now()-e)/1e3));for([s,n]of UNITS)if(a>=n||"second"===s){let e=Math.floor(a/n);return(t[s]||`%s ${s}s ago`).replace("%s",String(e))}}return""}function escapeHTML(e){return String(null==e?"":e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function t(e,t){return(window.theme&&window.theme.notifications_i18n||{})[e]||t}function getPanel(){return document.getElementById("notifications-panel")}function isOpen(){var e=getPanel();return!!e&&e.classList.contains(OPEN)}function releaseFocus(e,t=!1){var s=document.activeElement;if(s&&e.contains(s)){if(t){e=Array.from(document.querySelectorAll(".notifications-bell, .follow-trigger")).find(e=>null!==e.offsetParent);if(e)return void e.focus({preventScroll:!0})}s.blur()}}function setInertLater(e,t){t?requestAnimationFrame(()=>{e.isConnected&&!e.classList.contains(OPEN)&&e.setAttribute("inert","")}):e.removeAttribute("inert")}function setOpen(t,{returnFocus:e=!0}={}){var s,n=getPanel();n&&(s=document.getElementById("notifications-mask"),t||releaseFocus(n,e),n.classList.toggle(OPEN,t),n.setAttribute("aria-hidden",t?"false":"true"),setInertLater(n,!t),s&&s.classList.toggle(OPEN,t),t?setPage("inbox",!1):disarmConfirm(),document.querySelectorAll(".notifications-bell").forEach(e=>{e.setAttribute("aria-expanded",t?"true":"false"),e.classList.toggle("is-active",t)}))}function setBadge(n){document.querySelectorAll(".notifications-bell").forEach(e=>{var t,s=e.querySelector(".bell-badge");s&&(t=Number(n)||0,s.textContent=99<t?"99+":String(t),e.classList.toggle("has-unread",0<t))})}function setBusy(e,t){e&&(e.classList.toggle("is-busy",!!t),"disabled"in e&&(e.disabled=!!t),e=e.querySelector("i"))&&(t?(e.dataset.rest||(e.dataset.rest=e.className),e.className="fa-solid fa-circle-notch fa-spin"):e.dataset.rest&&(e.className=e.dataset.rest,delete e.dataset.rest))}function setPanelBusy(e){var t=getPanel();t&&t.classList.toggle("is-busy",!!e)}let armedEl=null,armedKey="",armedTimer=0;function disarmConfirm(){var e;armedTimer&&clearTimeout(armedTimer),armedTimer=0,armedEl&&armedEl.isConnected&&(armedEl.classList.remove("is-confirm"),(e=armedEl.querySelector(".np-btn-label"))&&armedEl.dataset.rest&&(e.textContent=armedEl.dataset.rest),(e=armedEl.querySelector("i"))&&e.dataset.armed&&(e.className=e.dataset.armed,delete e.dataset.armed),delete armedEl.dataset.rest),armedEl=null,armedKey=""}function confirmStep(e,t,s){if(armedKey===t&&armedEl===e)return disarmConfirm(),!0;disarmConfirm(),armedEl=e,armedKey=t,e.classList.add("is-confirm");t=e.querySelector(".np-btn-label"),t&&(e.dataset.rest=t.textContent,t.textContent=s),t=e.querySelector("i");return t&&(t.dataset.armed=t.className,t.className="fa-solid fa-check"),armedTimer=setTimeout(disarmConfirm,CONFIRM_MS),!1}let currentPage="inbox";function getPage(){return currentPage}function setPage(e,t=!0){var n=getPanel();if(n){e="manage"===e?"manage":"inbox";let s=e!==currentPage;currentPage=e,s&&disarmConfirm(),n.dataset.page=currentPage,n.querySelectorAll(".np-page").forEach(e=>{var t=e.dataset.page===currentPage;t||releaseFocus(e),e.classList.toggle("is-current",t),e.setAttribute("aria-hidden",t?"false":"true"),t?e.removeAttribute("inert"):e.setAttribute("inert",""),t&&s&&(t=e.querySelector(".np-scroll"))&&(t.scrollTop=0)}),syncHead(n),fitViewport(t)}}let canMarkRead=!1;function syncHead(e){var s="manage"===currentPage,n=e.querySelector(".np-title"),a=e.querySelector(".np-back"),e=e.querySelector(".np-mark-read");n&&(n.textContent=s?t("manage_title","Manage subscription"):t("title","Notifications")),a&&(a.hidden=!s),e&&(e.hidden=s||!canMarkRead)}function pageCap(e){var t=parseFloat(getComputedStyle(e).maxHeight),t=Number.isFinite(t)?t:.8*window.innerHeight;let s=0;return e.querySelectorAll(".np-head, .np-progress").forEach(e=>{s+=e.getBoundingClientRect().height}),Math.max(MIN_PAGE,t-s)}function naturalHeight(e){var t=e.querySelector(".np-scroll"),t=t&&t.firstElementChild,e=e.querySelector(".np-foot"),t=(t?t.getBoundingClientRect().height:0)+(e?e.getBoundingClientRect().height:0);return Math.ceil(t)}function fitViewport(e=!0){var t,s,n=getPanel();n&&(t=n.querySelector(".np-viewport"),s=n.querySelector(".np-page.is-current"),t)&&s&&(n=Math.min(Math.floor(pageCap(n)),Math.max(MIN_PAGE,naturalHeight(s))),e?t.style.height=n+"px":(t.style.transition="none",t.style.height=n+"px",t.offsetHeight,t.style.transition=""),updateProgress())}function updateProgress(){var e,t,s=getPanel();s&&(e=s.querySelector(".np-progress-bar"),s=s.querySelector(".np-page.is-current .np-scroll"),e)&&s&&(s=(t=s.scrollHeight-s.clientHeight)<=1?1:Math.min(1,Math.max(0,s.scrollTop/t)),e.style.width=(100*s).toFixed(2)+"%")}let progressFrame=0;function scheduleProgress(){progressFrame=progressFrame||requestAnimationFrame(()=>{progressFrame=0,updateProgress()})}function wireChrome(e){!e.dataset.chromeWired&&(e.dataset.chromeWired="1",e.querySelectorAll(".np-scroll").forEach(e=>{e.addEventListener("scroll",scheduleProgress,{passive:!0})}),e=e.querySelector(".np-viewport"))&&e.addEventListener("transitionend",e=>{"height"===e.propertyName&&updateProgress()})}function itemHTML(e){var t=!e.read_at,s="note"===e.type?"fa-comment-dots":"announcement"===e.type?"fa-bullhorn":"fa-file-lines";return`
    <a class="np-item${t?" is-unread":""}" href="${escapeHTML(e.url)}" data-id="${escapeHTML(e.id)}">
      <span class="np-item-icon"><i class="fa-solid ${s}" aria-hidden="true"></i></span>
      <span class="np-item-main">
        <span class="np-item-title">${escapeHTML(e.title)}</span>
        ${e.body?`<span class="np-item-body">${escapeHTML(e.body)}</span>`:""}
        <span class="np-item-time">${escapeHTML(timeAgo(e.published_at))}</span>
      </span>
    </a>`}let DEVICE_ICONS={laptop:"fa-solid fa-laptop",desktop:"fa-solid fa-desktop",mobile:"fa-solid fa-mobile-screen-button",tablet:"fa-solid fa-tablet-screen-button"},BROWSERS=[[/Edg[A-Z]?\//,"Edge"],[/OPR\/|Opera/,"Opera"],[/SamsungBrowser/,"Samsung Internet"],[/Firefox\/|FxiOS/,"Firefox"],[/CriOS|Chrome\//,"Chrome"],[/Safari\//,"Safari"]],SYSTEMS=[[/Windows NT|Windows Phone/,"Windows"],[/iPhone|iPad|iPod|CPU OS \d/,"iOS"],[/Mac OS X|Macintosh/,"macOS"],[/Android/,"Android"],[/CrOS/,"ChromeOS"],[/Linux|X11/,"Linux"]];function matchFirst(e,t){for(var[s,n]of e)if(s.test(t))return n;return""}function describeDevice(e){var s=String(e.ua||"");let n=String(e.device||"").toLowerCase();DEVICE_ICONS[n]||(n=/iPad|Tablet/i.test(s)||/Android/.test(s)&&!/Mobile/.test(s)?"tablet":/iPhone|iPod|Mobile/.test(s)?"mobile":/Windows NT|Mac OS X|Macintosh|X11|CrOS/.test(s)?"desktop":"");e=t("unknown","Unknown");return{icon:DEVICE_ICONS[n]||"fa-brands fa-chromecast",browser:matchFirst(BROWSERS,s)||e,os:matchFirst(SYSTEMS,s)||e,kind:n?t("device_"+n,n.charAt(0).toUpperCase()+n.slice(1)):e}}function deviceHTML(e,s){var n=describeDevice(e),a=timeAgo(e.created_at);return`
    <li class="np-device${s?" is-this":""}">
      <span class="np-device-icon"><i class="${n.icon}" aria-hidden="true"></i></span>
      <span class="np-device-main">
        <span class="np-device-title">${escapeHTML(n.browser)}<span class="np-sep"></span>${escapeHTML(n.os)}<span class="np-sep"></span>${escapeHTML(n.kind)}${s?`<span class="np-device-tag">${escapeHTML(t("this_browser","This browser"))}</span>`:""}</span>
        <span class="np-device-time">${escapeHTML(a?t("subscribed","Subscribed")+" "+a:t("subscribed","Subscribed"))}</span>
      </span>
      <button type="button" class="np-device-remove" data-device="${escapeHTML(e.id)}"
              aria-label="${escapeHTML(t("remove_device","Remove this device"))}">
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
      </button>
    </li>`}function switchHTML({key:e,label:t,hint:s,on:n,locked:a=!1,disabled:i=!1}){var o=a||i;return`
    <div class="np-row${a?" is-locked":""}${i?" is-disabled":""}">
      <span class="np-row-main">
        <span class="np-row-label">${escapeHTML(t)}</span>
        ${s?`<span class="np-row-hint">${escapeHTML(s)}</span>`:""}
      </span>
      <button type="button" class="np-switch${n?" is-on":""}" role="switch"
              data-switch="${escapeHTML(e)}"
              aria-checked="${n?"true":"false"}"
              aria-label="${escapeHTML(t)}"${o?" disabled":""}>
        <span class="np-switch-knob"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
      </button>
    </div>`}function pushBlocker(e){return"denied"===e.pushState?t("push_denied","Blocked in your browser's settings."):"insecure"===e.pushState?t("push_insecure","Push needs a secure connection (https, or localhost)."):"unsupported"===e.pushState?t("push_unsupported","This browser cannot receive push."):e.needsInstall?t("push_ios","On iPhone, add this site to your Home Screen first."):""}function renderManage(e,a){e=e.querySelector(".np-manage");if(e){var i=a.topics||[];let s=a.selected||[];var o=e=>0===s.length||-1!==s.indexOf(e),r=pushBlocker(a),r=[switchHTML({key:"inbox",label:t("opt_inbox","Receive messages inside the blog"),hint:t("always_on","Always on"),on:!0,locked:!0}),switchHTML({key:"push",label:t("opt_push","Receive push notifications from this browser"),hint:r||t("opt_push_hint","Registers this browser as a push device."),on:!!a.pushHere,disabled:!!r})],i=(-1!==i.indexOf("announcements")&&r.push(switchHTML({key:"announcements",label:t("opt_announcements","Receive blog announcements"),hint:t("always_on","Always on"),on:!0,locked:!0})),-1!==i.indexOf("notes")&&r.push(switchHTML({key:"notes",label:t("opt_notes","Receive new instant notes"),hint:"",on:o("notes")})),-1!==i.indexOf("posts")&&r.push(switchHTML({key:"posts",label:t("opt_posts","Receive new blog posts"),hint:"",on:o("posts")})),a.devices||[]);let n=a.endpointTail||"";o=i.length?`<ul class="np-devices">${i.map(e=>deviceHTML(e,!!n&&e.tail===n)).join("")}</ul>`:`<p class="np-blank">${escapeHTML(t("no_devices","No browser is registered for push yet."))}</p>`;e.innerHTML=`
    <section class="np-section">
      <h3 class="np-section-title">${escapeHTML(t("section_delivery","What you receive"))}</h3>
      ${r.join("")}
    </section>

    <section class="np-section">
      <h3 class="np-section-title">
        ${escapeHTML(t("section_devices","Registered devices"))}
        <span class="np-count">${i.length}</span>
      </h3>
      ${o}
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
    </button>`}}function render(e){var s,n,a,i,o=getPanel();o&&(a=o.querySelector(".np-body"),s=o.querySelector(".np-foot"),a)&&s&&(wireChrome(o),n="following"===e.phase,o.classList.toggle("is-busy",!!e.busy),setBadge(e.unread||0),canMarkRead=n&&0<e.unread,n||"manage"!==currentPage?syncHead(o):setPage("inbox"),"loading"===e.phase?a.innerHTML='<div class="np-empty"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></div>':"error"===e.phase?a.innerHTML=`
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
        <p>${escapeHTML(n?t("empty_following","Nothing yet. New posts will show up here."):t("empty","Follow the blog to get notified about new posts."))}</p>
      </div>`,a=[],"error"===e.phase?a.push(`<button type="button" class="np-action np-retry"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("retry","Try again"))}</span></button>`):"signed-out"===e.phase?a.push(`<button type="button" class="np-action np-login"><i class="fa-brands fa-github" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("sign_in","Sign in with GitHub"))}</span></button>`):"not-following"===e.phase?a.push(`<button type="button" class="np-action np-follow"><i class="fa-regular fa-bell" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("follow","Follow this blog"))}</span></button>`):n&&((i=pushBlocker(e))&&a.push(`<p class="np-note">${escapeHTML(i)} ${escapeHTML(t("still_inbox","New items still appear here."))}</p>`),a.push(`<button type="button" class="np-action np-to-manage"><i class="fa-solid fa-sliders" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("manage","Manage subscription"))}</span></button>`)),s.innerHTML=a.join(""),n&&renderManage(o,e),fitViewport(isOpen()))}export{t,getPanel,isOpen,setOpen,setBadge,setBusy,setPanelBusy,disarmConfirm,confirmStep,getPage,setPage,fitViewport,render};