import{setBusy,confirmStep,disarmConfirm,timeAgo,escapeHTML,describeDevice}from"./notifications-inbox.js";let FADE_MS=130,MORPH_MS=280,MORPH_EASE="cubic-bezier(0.32, 0.72, 0, 1)",FADE_BLUR="blur(3px)",TOPICS=["posts","notes","announcements"],TYPE_ICONS={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},SPINNER_ROW='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>',MODERATION_DOCS="https://docs.github.com/en/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account";function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,i){return escapeHTML(t(e,i))}let root=null,base="",reduced=!1,state={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},blocklists:{posts:[],notes:[],announcements:[]}},pickers=new Map;async function token(){if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}}async function api(e,t={},i=!0){var a=await token();if(!a)return{ok:!1,status:401,data:null};a={method:t.method||"GET",headers:{Authorization:"Bearer "+a}};void 0!==t.body&&(a.headers["Content-Type"]="application/json",a.body=JSON.stringify(t.body));let s;try{s=await fetch(base+e,a)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&i&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if(reduced)t();else{let a=e.getBoundingClientRect().height;e.style.transition=`opacity ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`,e.style.opacity="0",e.style.filter=FADE_BLUR,setTimeout(()=>{if(s.isConnected){let i=t()||s.firstElementChild;if(i){i.style.transition="none",i.style.opacity="0",i.style.filter=FADE_BLUR;var e=i.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=a+"px",s.style.transition=`height ${MORPH_MS}ms `+MORPH_EASE,s.style.height=e+"px",i.style.transition=`opacity ${.7*MORPH_MS}ms ease, filter ${.7*MORPH_MS}ms ease`,i.style.opacity="1",i.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",i.style.transition="",i.style.filter="",contentChanged())};s.addEventListener("transitionend",t)}}},FADE_MS)}}class Picker{constructor(e,t,{onCommit:i,placeholder:a}){this.key=e,this.host=t,this.onCommit=i||(()=>{}),this.chips=[],this.busy=0,t.className="bm-picker",t.innerHTML=`<div class="bm-chips"><input class="bm-chip-input" type="text"
      spellcheck="false" autocomplete="off" placeholder="${escapeHTML(a)}"></div>`,this.list=t.querySelector(".bm-chips"),this.input=t.querySelector(".bm-chip-input"),this.input.addEventListener("keydown",e=>{"Enter"===e.key||","===e.key||" "===e.key?(e.preventDefault(),this.commit()):"Backspace"===e.key&&!this.input.value&&this.chips.length&&this.remove(this.chips[this.chips.length-1].raw)}),this.input.addEventListener("blur",()=>this.commit()),this.input.addEventListener("paste",e=>{var t=(e.clipboardData||window.clipboardData).getData("text");/[\s,]/.test(t)&&(e.preventDefault(),t.split(/[\s,]+/).forEach(e=>this.add(e)))}),t.addEventListener("click",e=>{var t=e.target.closest(".bm-chip-x");t?this.remove(t.dataset.raw):e.target.closest(".bm-chip")||this.input.focus()})}get ids(){return this.chips.filter(e=>"ok"===e.status).map(e=>e.id)}get settled(){return 0===this.busy&&this.chips.every(e=>"ok"===e.status)}set(e){this.chips=(e||[]).map(e=>({raw:String(e.login||e.id),id:e.id,login:e.login||"",name:e.name||"",status:"ok"})),this.paint()}clear(){this.chips=[],this.paint()}commit(){var e=this.input.value.trim();this.input.value="",e&&this.add(e)}add(e){let t=String(e).replace(/^@/,"").trim();t&&!this.chips.some(e=>e.raw.toLowerCase()===t.toLowerCase())&&(this.chips.push({raw:t,id:null,login:"",name:"",status:"checking"}),this.paint(),this.resolve(t))}remove(t){var e=this.chips.length;this.chips=this.chips.filter(e=>e.raw!==t),this.chips.length!==e&&(this.paint(),this.onCommit(this))}async resolve(t){this.busy++;var e,i=await api("/api/admin/lookup",{method:"POST",body:{ids:[t]}}),a=(this.busy--,this.chips.find(e=>e.raw===t));a&&((e=i.ok&&i.data&&(i.data.matched||[])[0])?(a.id=e.id,a.login=e.login,a.name=e.name||"",a.status="ok"):a.status=i.ok?"unknown":"error",this.paint(),this.onCommit(this))}paint(){this.list.querySelectorAll(".bm-chip").forEach(e=>e.remove());var e=this.chips.map(e=>chipHTML(e)).join("");this.input.insertAdjacentHTML("beforebegin",e),this.host.classList.toggle("has-unknown",this.chips.some(e=>"ok"!==e.status))}}function chipHTML(i){var a;return"checking"===i.status?`<span class="bm-chip is-checking">
      <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
      <span class="bm-chip-name">${escapeHTML(i.raw)}</span></span>`:"ok"!==i.status?(a="error"===i.status?t("chip_error","Lookup failed"):t("chip_unknown","Not a known reader"),`<span class="bm-chip is-unknown" title="${escapeHTML(a)}">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="bm-chip-name">${escapeHTML(i.raw)}</span>
      <button type="button" class="bm-chip-x" data-raw="${escapeHTML(i.raw)}"
              aria-label="${e("remove","Remove")}">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>`):`<span class="bm-chip is-ok">
    <img class="bm-chip-avatar" src="${avatarOf(i.id)}" alt="" loading="lazy">
    <span class="bm-chip-name">${escapeHTML(i.name||i.login)}</span>
    <span class="bm-chip-id">#${escapeHTML(i.id)}</span>
    <button type="button" class="bm-chip-x" data-raw="${escapeHTML(i.raw)}"
            aria-label="${e("remove","Remove")}">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>`}function avatarOf(e){return`https://avatars.githubusercontent.com/u/${encodeURIComponent(e)}?s=64&v=4`}function renderCompose(i){i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>${e("announce","Send an announcement")}
    </h2>

    <div class="bm-card bm-compose">
      <div class="bm-compose-audience">
        <div class="bm-seg" role="group" aria-label="${e("audience","Audience")}">
          <button type="button" data-mode="all" class="is-on">${e("aud_all","Everyone")}</button>
          <button type="button" data-mode="users">${e("aud_only","Only these")}</button>
          <button type="button" data-mode="except">${e("aud_except","Everyone except")}</button>
        </div>
        <div class="bm-picker-host" data-picker="audience" hidden></div>
        <p class="bm-hint bm-audience-hint">${e("aud_all_hint","Every follower receives this.")}</p>
      </div>

      <div class="bm-compose-fields">
        <input class="bm-field bm-c-title" type="text" maxlength="120"
               placeholder="${e("f_title","Title")}">
        <textarea class="bm-field bm-c-body" maxlength="500" rows="3"
                  placeholder="${e("f_body","What happened, in a sentence or two")}"></textarea>
        <input class="bm-field bm-c-url" type="url"
               placeholder="${e("f_url","Link — where pressing the notification goes")}">
      </div>

      <footer class="bm-compose-foot">
        <span class="bm-counter"><span class="bm-c-count">0</span>/500</span>
        <button type="button" class="bm-primary bm-post" disabled>
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span class="np-btn-label">${e("post","Post announcement")}</span>
        </button>
      </footer>
    </div>

    <div class="bm-receipt" hidden></div>`;var a=i.querySelector('[data-picker="audience"]');pickers.set("audience",new Picker("audience",a,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),i.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose()}function composeMode(i){state.compose.mode=i;var e=root.querySelector('[data-part="announce"]');e.querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===i)}),e.querySelector('[data-picker="audience"]').hidden="all"===i,e.querySelector(".bm-audience-hint").textContent="all"===i?t("aud_all_hint","Every follower receives this."):"users"===i?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),syncCompose()}function syncCompose(){var e,t,i,a,s,n=root.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),i=n.querySelector(".bm-c-url"),a=n.querySelector(".bm-post"),s=pickers.get("audience"),e)&&a&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==state.compose.mode)||s&&s.settled&&0<s.ids.length,a.disabled=!e.value.trim()||!i.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(e){var t=root.querySelector('[data-part="announce"]'),i=t.querySelector(".bm-c-title").value.trim(),a=t.querySelector(".bm-c-body").value.trim(),s=t.querySelector(".bm-c-url").value.trim(),n=state.compose.mode,o=pickers.get("audience"),l=(setBusy(e,!0),"all"===n?{kind:"all"}:{kind:n,users:o?o.ids:[]}),i=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(i),type:"announcement",topic:"announcements",title:i,body:a,url:s,tag:"announcements",audience:l}});setBusy(e,!1),renderReceipt(t.querySelector(".bm-receipt"),i,{mode:n,audience:l}),i.ok&&(t.querySelector(".bm-c-title").value="",t.querySelector(".bm-c-body").value="",t.querySelector(".bm-c-url").value="",o&&o.clear(),syncCompose(),setFilter(""))}function renderReceipt(i,a,{mode:s,audience:n}){var o,l,r,c;i.hidden=!1,a.ok?(c=((o=a.data||{}).counts||[])[0]||{},l=o.audience&&o.audience.matched||[],r=o.audience&&o.audience.unknown||[],c=[[t("r_id","Id"),o.ingested&&o.ingested[0]],[t("r_recipients","Inboxes written"),c.recipients],[t("r_devices","Push devices"),c.devices],[t("r_messages","Queue messages"),c.messages],[t("r_audience","Audience"),"all"===s?t("aud_all","Everyone"):`${"users"===s?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]],l.length&&c.push([t("r_matched","Matched"),l.map(e=>e.login+" #"+e.id).join(", ")]),r.length&&c.push([t("r_ignored","Ignored"),r.join(", ")]),(o.skipped||[]).length&&c.push([t("r_skipped","Already sent"),o.skipped.join(", ")]),o.absorbed&&c.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),i.className="bm-receipt is-good",i.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${c.map(([e,t])=>`<dt>${escapeHTML(e)}</dt><dd>${escapeHTML(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`):(s=a.data&&(a.data.error||a.data.message)||(a.status?"HTTP "+a.status:t("offline","The Worker did not answer.")),i.className="bm-receipt is-bad",i.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${escapeHTML(s)}</p>`)}function renderNotificationsShell(i){var a=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]];i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${a.map(([e,t])=>`<button type="button" data-type="${escapeHTML(e)}"${e===state.notifications.type?' class="is-on"':""}>${escapeHTML(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`}function notifInnerHTML(i){let a="";try{var s=JSON.parse(i.audience_json||"{}");a="users"===s.kind?t("aud_only","Only these")+" "+(s.users||[]).length:"except"===s.kind?t("aud_except","Everyone except")+" "+(s.users||[]).length:"all"===s.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}s=[i.id,i.type,i.topic,i.source,i.recipients+" "+t("m_inboxes","inboxes"),i.devices+" "+t("m_devices","devices"),a,timeAgo(i.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${TYPE_ICONS[i.type]||"fa-bell"}" aria-hidden="true"></i>
        </span>
        <div class="bm-notif-main">
          <div class="bm-notif-title">${escapeHTML(i.title)}</div>
          ${i.body?`<p class="bm-notif-body">${escapeHTML(i.body)}</p>`:""}
          <a class="bm-notif-url" href="${escapeHTML(i.url)}" target="_blank" rel="noopener">
            ${escapeHTML(i.url)}</a>
          <div class="bm-notif-meta">${s.map(e=>`<span>${escapeHTML(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-notif-actions">
          <button type="button" class="bm-icon bm-edit" aria-label="${e("edit","Edit")}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i></button>
          <button type="button" class="bm-icon bm-del" aria-label="${e("delete","Delete")}">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
        </div>
      </div>`}function notificationHTML(e){return`<li class="bm-notif" data-id="${escapeHTML(e.id)}">${notifInnerHTML(e)}</li>`}function editorHTML(t){return`
    <div class="bm-notif-inner is-editing">
      <div class="bm-notif-main">
        <input class="bm-field bm-e-title" type="text" maxlength="120"
               value="${escapeHTML(t.title)}">
        <textarea class="bm-field bm-e-body" maxlength="500" rows="3">${escapeHTML(t.body||"")}</textarea>
        <input class="bm-field bm-e-url" type="url" value="${escapeHTML(t.url)}">
        <p class="bm-hint">${e("edit_hint","Editing changes the inbox copy only. Nothing is pushed again.")}</p>
      </div>
      <div class="bm-notif-actions">
        <button type="button" class="bm-icon bm-save" aria-label="${e("save","Save")}">
          <i class="fa-solid fa-check" aria-hidden="true"></i></button>
        <button type="button" class="bm-icon bm-cancel" aria-label="${e("cancel","Cancel")}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
    </div>`}function paintNotifications(){var t=root.querySelector('[data-part="notifications"]'),i=t.querySelector(".bm-notifs"),a=t.querySelector(".bm-foot"),s=state.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?i.innerHTML=SPINNER_ROW:s.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?i.innerHTML=s.items.map(notificationHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,a.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){state.notifications.type=t,root.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var i=state.notifications,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&setBusy(t,!0),i.loading=!0,paintNotifications(),`?type=${encodeURIComponent(i.type)}&cursor=`+i.cursor),t=await api("/api/admin/notifications"+e);i.loading=!1,i.error=!t.ok,t.ok&&t.data&&(i.items=i.items.concat(t.data.items||[]),i.more=null!=t.data.cursor,i.cursor=t.data.cursor||i.cursor),paintNotifications()}function startEdit(t){let i=state.notifications.items.find(e=>e.id===t.dataset.id);i&&!t.querySelector(".is-editing")&&morph(t,t.firstElementChild,()=>{t.innerHTML=editorHTML(i);var e=t.querySelector(".bm-e-title");return e&&e.focus(),t.firstElementChild})}function cancelEdit(t){let e=state.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function saveEdit(e,t){let i=e.dataset.id;var a,s,n,o,l=state.notifications.items.find(e=>e.id===i);l&&(a=e.querySelector(".bm-e-title").value.trim(),s=e.querySelector(".bm-e-body").value.trim(),n=e.querySelector(".bm-e-url").value.trim(),a)&&(setBusy(t,!0),o=await api("/api/admin/notifications/"+encodeURIComponent(i),{method:"PUT",body:{title:a,body:s,url:n}}),setBusy(t,!1),o.ok?(l.title=a,l.body=s,n&&(l.url=n),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))}async function deleteNotification(e,t){let i=e.dataset.id;setBusy(t,!0);var a=await api("/api/admin/notifications/"+encodeURIComponent(i),{method:"DELETE"});setBusy(t,!1),a.ok&&(state.notifications.items=state.notifications.items.filter(e=>e.id!==i),collapseAway(e,paintNotifications))}function collapseAway(e,t){var i;reduced?t():(i=e.getBoundingClientRect().height,e.style.overflow="hidden",e.style.height=i+"px",e.style.transition=`height ${MORPH_MS}ms ${MORPH_EASE}, opacity ${FADE_MS}ms ease`,e.style.opacity="0",e.style.height="0px",setTimeout(t,MORPH_MS))}function renderFollowersShell(a){a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-users" aria-hidden="true"></i>${e("followers","Followers")}
      <span class="bm-count bm-follower-count"></span>
    </h2>

    <div class="bm-card bm-blocklists">
      <h3 class="bm-sub-title">${e("blocklists","Global blocklists")}</h3>
      <p class="bm-hint">${e("blocklists_hint","Anyone listed here is skipped for that kind of notification, silently and everywhere. Saved as soon as an entry resolves.")}</p>
      ${TOPICS.map(e=>`
        <div class="bm-blocklist">
          <label class="bm-blocklist-label">
            ${escapeHTML(t("topic_"+e,e))}
            <span class="bm-save-state" data-save="${e}"></span>
          </label>
          <div class="bm-picker-host" data-picker="${e}"></div>
        </div>`).join("")}
    </div>

    <p class="bm-notice">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      <span>${e("moderation_notice","Muting or banning here only affects notifications. It does not stop anyone commenting on the blog — comments are GitHub Discussions, so blocking a commenter is done in your GitHub account settings under Moderation.")}
      <a href="${MODERATION_DOCS}" target="_blank" rel="noopener">${e("moderation_docs","GitHub docs")}</a></span>
    </p>

    <ul class="bm-followers"></ul>
    <div class="bm-foot"></div>
    <div class="bm-orphans"></div>`,TOPICS.forEach(i=>{var e=a.querySelector(`[data-picker="${i}"]`);pickers.set(i,new Picker(i,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveBlocklist(i,e)}))})}async function saveBlocklist(e,t){let i=root.querySelector(`[data-save="${e}"]`);var a;t.settled?(i&&(i.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),a=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),i&&(i.innerHTML=a.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',a.ok)&&setTimeout(()=>i.innerHTML="",1800),a.ok&&(state.blocklists[e]=t.ids)):i&&(i.innerHTML="")}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,i,a,s){return s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(s="banned"===a,`
    <button type="button" class="bm-quiet bm-mod${(a="muted"===a)?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(i)}" data-next="${a?"":"muted"}">
      <i class="fa-solid ${a?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${a?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(i)}" data-next="${s?"":"banned"}">
      <i class="fa-solid ${s?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,i){var a=describeDevice(e);return`
    <li class="bm-device" data-device="${escapeHTML(e.id)}">
      <span class="bm-device-icon"><i class="${a.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${escapeHTML(a.browser)}<span class="bm-sep"></span>${escapeHTML(a.os)}<span class="bm-sep"></span>${escapeHTML(a.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${escapeHTML(t("subscribed","Subscribed")+" "+timeAgo(e.created_at))}<span class="bm-sep"></span>…${escapeHTML(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,i)}</div>
    </li>`}function followerHTML(i){var a=String(i.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),a=["#"+i.id,t("subscribed","Subscribed")+" "+timeAgo(i.created_at),i.devices.length+" "+t("m_devices","devices"),i.unread+" "+t("m_unread","unread"),a.length?t("m_blocked","Blocked")+": "+a.join(", "):""].filter(Boolean);return`
    <li class="bm-follower${i.state?" is-"+i.state:""}" data-follower="${escapeHTML(i.id)}">
      <div class="bm-follower-head">
        <img class="bm-avatar" src="${avatarOf(i.id)}" alt="" loading="lazy">
        <div class="bm-follower-main">
          <div class="bm-follower-name">
            ${escapeHTML(i.name||i.login)}
            <a class="bm-login" href="https://github.com/${encodeURIComponent(i.login)}"
               target="_blank" rel="noopener">@${escapeHTML(i.login)}</a>
            ${stateTag(i.state)}
          </div>
          <div class="bm-follower-meta">${a.map(e=>`<span>${escapeHTML(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",i.id,i.state,i.is_admin)}
        </div>
      </div>
      ${i.devices.length?`<ul class="bm-devices">${i.devices.map(e=>deviceHTML(e,i.is_admin)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var i=root.querySelector('[data-part="followers"]'),a=i.querySelector(".bm-followers"),s=i.querySelector(".bm-foot"),n=state.followers;n.totals&&(i.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),i.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?a.innerHTML=SPINNER_ROW:n.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?a.innerHTML=n.items.map(followerHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",i.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var a=state.followers,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&setBusy(t,!0),a.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+a.cursor));if(a.loading=!1,a.error=!e.ok,e.ok&&e.data){let i=e.data;a.items=a.items.concat(i.items||[]),a.more=null!=i.cursor,a.cursor=i.cursor||a.cursor,i.orphans&&(a.orphans=i.orphans),i.totals&&(a.totals=i.totals),i.blocklists&&(state.blocklists=i.blocklists,TOPICS.forEach(e=>{var t=pickers.get(e);t&&t.set(i.blocklists[e]||[])}))}paintFollowers()}async function moderate(e){var t=e.dataset.scope;let i=e.dataset.target;var a=e.dataset.next,s=(setBusy(e,!0),await api("/api/admin/moderation",{method:"PUT",body:"device"===t?{device_id:Number(i),state:a}:{github_id:Number(i),state:a}}));if(setBusy(e,!1),s.ok){e=state.followers;if("follower"===t){s=e.items.find(e=>String(e.id)===String(i));s&&(s.state=a)}else{for(var n of e.items){n=n.devices.find(e=>String(e.id)===String(i));n&&(n.state=a)}t=e.orphans.find(e=>String(e.id)===String(i));t&&(t.state=a)}paintFollowers()}}function showGate(i){var a=root.querySelector(".bm-gate"),s=root.querySelector(".bm-console");"ready"===(root.dataset.phase=i)?(a.hidden=!0,s.hidden=!1,contentChanged()):(a.hidden=!1,s.hidden=!0,s={loading:["fa-circle-notch fa-spin",t("checking","Checking your session…")],denied:["fa-lock",t("denied","This page is for the blog's administrator.")],error:["fa-plug-circle-xmark",t("unreachable","Couldn't reach the notification service.")]}[i],a.innerHTML=`<i class="fa-solid ${s[0]}" aria-hidden="true"></i>
    <p class="bm-gate-text">${escapeHTML(s[1])}</p>
    `+("loading"===i?"":`<button type="button" class="bm-quiet bm-retry">
             <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
             <span class="np-btn-label">${e("retry","Try again")}</span></button>`))}function wire(){root.addEventListener("click",e=>{var i,e=e.target,a=e.closest(".bm-retry");a?(setBusy(a,!0),boot(!0)):(a=e.closest(".bm-seg [data-mode]"))?composeMode(a.dataset.mode):(a=e.closest(".bm-notif-filter [data-type]"))?setFilter(a.dataset.type):(a=e.closest(".bm-post"))?send(a):(a=e.closest(".bm-more"))?("followers"===a.dataset.more?loadFollowers:loadNotifications)({trigger:a}):(a=e.closest(".bm-edit"))?startEdit(a.closest(".bm-notif")):(a=e.closest(".bm-cancel"))?cancelEdit(a.closest(".bm-notif")):(a=e.closest(".bm-save"))?saveEdit(a.closest(".bm-notif"),a):(a=e.closest(".bm-del"))?(i=a.closest(".bm-notif"),confirmStep(a,"del:"+i.dataset.id,"")&&deleteNotification(i,a)):(i=e.closest(".bm-mod"))?(a=`mod:${i.dataset.scope}:${i.dataset.target}:`+i.dataset.next,confirmStep(i,a,t("confirm","Press again"))&&moderate(i)):disarmConfirm()})}async function boot(e=!1){showGate("loading"),e&&window.blogAuth&&await window.blogAuth.getSession(!0);var t,e=await api("/api/admin/notifications?cursor=0&type=");401===e.status||403===e.status?showGate("denied"):e.ok?(showGate("ready"),renderCompose((t={announce:root.querySelector('[data-part="announce"]'),notifications:root.querySelector('[data-part="notifications"]'),followers:root.querySelector('[data-part="followers"]')}).announce),renderNotificationsShell(t.notifications),renderFollowersShell(t.followers),(t=state.notifications).items=e.data.items||[],t.more=null!=e.data.cursor,t.cursor=e.data.cursor||0,paintNotifications(),loadFollowers({reset:!0})):showGate("error")}function initBlogManagement(){var e=document.getElementById("blog-management");e&&(root=e,pickers.clear(),state.compose.mode="all",state.notifications.type="",state.notifications.loading=!1,state.followers.loading=!1,reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.theme&&window.theme.notifications||{},(base=window.blogAuth?window.blogAuth.resolveApiBase(e.api_url):String(e.api_url||"").replace(/\/+$/,""))?(wire(),boot()):showGate("error"))}export{initBlogManagement};