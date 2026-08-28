let e="is-open",n=[["year",31536e3],["month",2592e3],["week",604800],["day",86400],["hour",3600],["minute",60],["second",1]];function timeAgo(e){let t="number"==typeof e?1e3*e:new Date(e).getTime(),a=window.lang_ago||{};if(!isNaN(t)){var i=Math.max(0,Math.floor((Date.now()-t)/1e3));for(let[t,s]of n)if(i>=s||"second"===t){let e=Math.floor(i/s);return(a[t]||`%s ${t}s ago`).replace("%s",String(e))}}return""}function escapeHTML(e){return String(null==e?"":e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function t(e,t){return(window.theme&&window.theme.notifications_i18n||{})[e]||t}function getPanel(){return document.getElementById("notifications-panel")}function isOpen(){var t=getPanel();return!!t&&t.classList.contains(e)}function releaseFocus(e,t=!1){var s=document.activeElement;if(s&&e.contains(s)){if(t){let e=Array.from(document.querySelectorAll(".notifications-bell, .follow-trigger")).find(e=>null!==e.offsetParent);if(e)return void e.focus({preventScroll:!0})}s.blur()}}function setOpen(t,{returnFocus:s=!0}={}){var n,a,i=getPanel();i&&(n=document.getElementById("notifications-mask"),t||releaseFocus(i,s),i.classList.toggle(e,t),i.setAttribute("aria-hidden",t?"false":"true"),a=i,!t?requestAnimationFrame(()=>{a.isConnected&&!a.classList.contains(e)&&a.setAttribute("inert","")}):a.removeAttribute("inert"),n&&n.classList.toggle(e,t),t?setPage("inbox",!1):disarmConfirm(),document.querySelectorAll(".notifications-bell").forEach(e=>{e.setAttribute("aria-expanded",t?"true":"false"),e.classList.toggle("is-active",t)}))}function setBadge(n){document.querySelectorAll(".notifications-bell").forEach(e=>{var t,s=e.querySelector(".bell-badge");s&&(t=Number(n)||0,s.textContent=99<t?"99+":String(t),e.classList.toggle("has-unread",0<t))})}function setBusy(e,t){e&&(e.classList.toggle("is-busy",!!t),"disabled"in e&&(e.disabled=!!t),e=e.querySelector("i"))&&(t?(e.dataset.rest||(e.dataset.rest=e.className),e.className="fa-solid fa-circle-notch fa-spin"):e.dataset.rest&&(e.className=e.dataset.rest,delete e.dataset.rest))}function setPanelBusy(e){var t=getPanel();t&&t.classList.toggle("is-busy",!!e)}let s=null,i="",a=0;function disarmConfirm(){var e;a&&clearTimeout(a),a=0,s&&s.isConnected&&(s.classList.remove("is-confirm"),(e=s.querySelector(".np-btn-label"))&&s.dataset.rest&&(e.textContent=s.dataset.rest),(e=s.querySelector("i"))&&e.dataset.armed&&(e.className=e.dataset.armed,delete e.dataset.armed),delete s.dataset.rest),s=null,i=""}function confirmStep(e,t,n){if(i===t&&s===e)return disarmConfirm(),!0;disarmConfirm(),s=e,i=t,e.classList.add("is-confirm");t=e.querySelector(".np-btn-label"),t&&(e.dataset.rest=t.textContent,t.textContent=n),t=e.querySelector("i");return t&&(t.dataset.armed=t.className,t.className="fa-solid fa-check"),a=setTimeout(disarmConfirm,4e3),!1}let o="inbox";function getPage(){return o}function setPage(t,n=!0){var a=getPanel();if(a){let e="manage"===t?"manage":"inbox",s=e!==o;o=e,s&&disarmConfirm(),a.dataset.page=o,a.querySelectorAll(".np-page").forEach(t=>{let e=t.dataset.page===o;if(e||releaseFocus(t),t.classList.toggle("is-current",e),t.setAttribute("aria-hidden",e?"false":"true"),e?t.removeAttribute("inert"):t.setAttribute("inert",""),e&&s){let e=t.querySelector(".np-scroll");e&&(e.scrollTop=0)}}),syncHead(a),fitViewport(n)}}let r=!1;function syncHead(e){var s="manage"===o,n=e.querySelector(".np-title"),a=e.querySelector(".np-back"),e=e.querySelector(".np-mark-read");n&&(n.textContent=s?t("manage_title","Manage subscription"):t("title","Notifications")),a&&(a.hidden=!s),e&&(e.hidden=s||!r)}function fitViewport(e=!0){var t,s,n=getPanel();n&&(t=n.querySelector(".np-viewport"),s=n.querySelector(".np-page.is-current"),t)&&s&&(n=Math.min(Math.floor((e=>{var t=parseFloat(getComputedStyle(e).maxHeight),t=Number.isFinite(t)?t:.8*window.innerHeight;let s=0;return e.querySelectorAll(".np-head, .np-progress").forEach(e=>{s+=e.getBoundingClientRect().height}),Math.max(148,t-s)})(n)),Math.max(148,(s=(s=(n=s).querySelector(".np-scroll"))&&s.firstElementChild,n=n.querySelector(".np-foot"),s=(s?s.getBoundingClientRect().height:0)+(n?n.getBoundingClientRect().height:0),Math.ceil(s)))),e?t.style.height=n+"px":(t.style.transition="none",t.style.height=n+"px",t.offsetHeight,t.style.transition=""),updateProgress())}function updateProgress(){var e,t,s=getPanel();s&&(e=s.querySelector(".np-progress-bar"),s=s.querySelector(".np-page.is-current .np-scroll"),e)&&s&&(s=(t=s.scrollHeight-s.clientHeight)<=1?1:Math.min(1,Math.max(0,s.scrollTop/t)),e.style.width=(100*s).toFixed(2)+"%")}let c=0;function scheduleProgress(){c=c||requestAnimationFrame(()=>{c=0,updateProgress()})}function itemHTML(e){var t=!e.read_at,s="note"===e.type?"fa-comment-dots":"announcement"===e.type?"fa-bullhorn":"fa-file-lines";return`
    <a class="np-item${t?" is-unread":""}" href="${escapeHTML(e.url)}" data-id="${escapeHTML(e.id)}">
      <span class="np-item-icon"><i class="fa-solid ${s}" aria-hidden="true"></i></span>
      <span class="np-item-main">
        <span class="np-item-title">${escapeHTML(e.title)}</span>
        ${e.body?`<span class="np-item-body">${escapeHTML(e.body)}</span>`:""}
        <span class="np-item-time">${escapeHTML(timeAgo(e.published_at))}</span>
      </span>
    </a>`}let l={laptop:"fa-solid fa-laptop",desktop:"fa-solid fa-desktop",mobile:"fa-solid fa-mobile-screen-button",tablet:"fa-solid fa-tablet-screen-button"},p=[[/Edg[A-Z]?\//,"Edge"],[/OPR\/|Opera/,"Opera"],[/SamsungBrowser/,"Samsung Internet"],[/Firefox\/|FxiOS/,"Firefox"],[/CriOS|Chrome\//,"Chrome"],[/Safari\//,"Safari"]],u=[[/Windows NT|Windows Phone/,"Windows"],[/iPhone|iPad|iPod|CPU OS \d/,"iOS"],[/Mac OS X|Macintosh/,"macOS"],[/Android/,"Android"],[/CrOS/,"ChromeOS"],[/Linux|X11/,"Linux"]];function matchFirst(e,t){for(var[s,n]of e)if(s.test(t))return n;return""}function deviceHTML(e,s){var n=(e=>{var s=String(e.ua||"");let n=String(e.device||"").toLowerCase();return l[n]||(n=/iPad|Tablet/i.test(s)||/Android/.test(s)&&!/Mobile/.test(s)?"tablet":/iPhone|iPod|Mobile/.test(s)?"mobile":/Windows NT|Mac OS X|Macintosh|X11|CrOS/.test(s)?"desktop":""),e=t("unknown","Unknown"),{icon:l[n]||"fa-brands fa-chromecast",browser:matchFirst(p,s)||e,os:matchFirst(u,s)||e,kind:n?t("device_"+n,n.charAt(0).toUpperCase()+n.slice(1)):e}})(e),a=timeAgo(e.created_at);return`
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
    </div>`}function pushBlocker(e){return"denied"===e.pushState?t("push_denied","Blocked in your browser's settings."):"insecure"===e.pushState?t("push_insecure","Push needs a secure connection (https, or localhost)."):"unsupported"===e.pushState?t("push_unsupported","This browser cannot receive push."):e.needsInstall?t("push_ios","On iPhone, add this site to your Home Screen first."):""}function render(s){let e=getPanel();if(e){var c=e.querySelector(".np-body"),p=e.querySelector(".np-foot");if(c&&p){!(n=e).dataset.chromeWired&&(n.dataset.chromeWired="1",n.querySelectorAll(".np-scroll").forEach(e=>{e.addEventListener("scroll",scheduleProgress,{passive:!0})}),n=n.querySelector(".np-viewport"))&&n.addEventListener("transitionend",e=>{"height"===e.propertyName&&updateProgress()});var n="following"===s.phase,c=(e.classList.toggle("is-busy",!!s.busy),setBadge(s.unread||0),r=n&&0<s.unread,n||"manage"!==o?syncHead(e):setPage("inbox"),"loading"===s.phase?c.innerHTML='<div class="np-empty"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></div>':"error"===s.phase?c.innerHTML=`
      <div class="np-empty">
        <i class="fa-solid fa-plug-circle-xmark" aria-hidden="true"></i>
        <p>${escapeHTML(t("unreachable","Couldn't reach the notification service. Your subscription is unchanged."))}</p>
      </div>`:"signed-out"===s.phase?c.innerHTML=`
      <div class="np-empty">
        <i class="fa-regular fa-bell" aria-hidden="true"></i>
        <p>${escapeHTML(t("signed_out","Sign in with GitHub to follow this blog."))}</p>
      </div>`:s.items&&0!==s.items.length?c.innerHTML=`<div class="np-list">${s.items.map(itemHTML).join("")}</div>`:c.innerHTML=`
      <div class="np-empty">
        <i class="fa-regular fa-bell-slash" aria-hidden="true"></i>
        <p>${escapeHTML(n?t("empty_following","Nothing yet. New posts will show up here."):t("empty","Follow the blog to get notified about new posts."))}</p>
      </div>`,[]);if("error"===s.phase)c.push(`<button type="button" class="np-action np-retry"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("retry","Try again"))}</span></button>`);else if("signed-out"===s.phase)c.push(`<button type="button" class="np-action np-login"><i class="fa-brands fa-github" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("sign_in","Sign in with GitHub"))}</span></button>`);else if("not-following"===s.phase)c.push(`<button type="button" class="np-action np-follow"><i class="fa-regular fa-bell" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("follow","Follow this blog"))}</span></button>`);else if(n){let e=pushBlocker(s);e&&c.push(`<p class="np-note">${escapeHTML(e)} ${escapeHTML(t("still_inbox","New items still appear here."))}</p>`),c.push(`<button type="button" class="np-action np-to-manage"><i class="fa-solid fa-sliders" aria-hidden="true"></i> <span class="np-btn-label">${escapeHTML(t("manage","Manage subscription"))}</span></button>`)}if(p.innerHTML=c.join(""),n){p=e;c=s;if(p=p.querySelector(".np-manage")){let e=c.topics||[],s=c.selected||[],n=e=>0===s.length||-1!==s.indexOf(e),a=pushBlocker(c),i=[switchHTML({key:"inbox",label:t("opt_inbox","Receive messages inside the blog"),hint:t("always_on","Always on"),on:!0,locked:!0}),switchHTML({key:"push",label:t("opt_push","Receive push notifications from this browser"),hint:a||t("opt_push_hint","Registers this browser as a push device."),on:!!c.pushHere,disabled:!!a})],o=(-1!==e.indexOf("announcements")&&i.push(switchHTML({key:"announcements",label:t("opt_announcements","Receive blog announcements"),hint:t("always_on","Always on"),on:!0,locked:!0})),-1!==e.indexOf("notes")&&i.push(switchHTML({key:"notes",label:t("opt_notes","Receive new instant notes"),hint:"",on:n("notes")})),-1!==e.indexOf("posts")&&i.push(switchHTML({key:"posts",label:t("opt_posts","Receive new blog posts"),hint:"",on:n("posts")})),c.devices||[]),r=c.endpointTail||"",l=o.length?`<ul class="np-devices">${o.map(e=>deviceHTML(e,!!r&&e.tail===r)).join("")}</ul>`:`<p class="np-blank">${escapeHTML(t("no_devices","No browser is registered for push yet."))}</p>`;p.innerHTML=`
    <section class="np-section">
      <h3 class="np-section-title">${escapeHTML(t("section_delivery","What you receive"))}</h3>
      ${i.join("")}
    </section>

    <section class="np-section">
      <h3 class="np-section-title">
        ${escapeHTML(t("section_devices","Registered devices"))}
        <span class="np-count">${o.length}</span>
      </h3>
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
    </button>`}}fitViewport(isOpen())}}}export{t,getPanel,isOpen,setOpen,setBadge,setBusy,setPanelBusy,disarmConfirm,confirmStep,getPage,setPage,fitViewport,render};