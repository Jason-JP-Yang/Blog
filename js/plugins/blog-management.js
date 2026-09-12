import{setBusy,confirmStep,disarmConfirm,timeAgo,escapeHTML,describeDevice}from"./notifications-inbox.js";import{Picker,avatarOf}from"../tools/chipPicker.js";import{siteRoot}from"../tools/vaultCrypto.js";let FADE_MS=130,MORPH_MS=280,MORPH_EASE="cubic-bezier(0.32, 0.72, 0, 1)",FADE_BLUR="blur(3px)",TOPICS=["posts","notes","announcements"],TYPE_ICONS={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},SPINNER_ROW='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>',MODERATION_DOCS="https://docs.github.com/en/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account";function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,a){return escapeHTML(t(e,a))}let root=null,base="",reduced=!1,state={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},posts:{items:[],audiences:{},filter:"",loading:!1},blocklists:{posts:[],notes:[],announcements:[]}},pickers=new Map;async function token(){if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}}async function api(e,t={},a=!0){var s=await token();if(!s)return{ok:!1,status:401,data:null};s={method:t.method||"GET",headers:{Authorization:"Bearer "+s}};void 0!==t.body&&(s.headers["Content-Type"]="application/json",s.body=JSON.stringify(t.body));let i;try{i=await fetch(base+e,s)}catch{return{ok:!1,status:0,data:null}}if((401===i.status||403===i.status)&&a&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await i.json()}catch{}return{ok:i.ok,status:i.status,data:n}}function morph(i,e,t){if(reduced)t();else{let s=e.getBoundingClientRect().height;e.style.transition=`opacity ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`,e.style.opacity="0",e.style.filter=FADE_BLUR,setTimeout(()=>{if(i.isConnected){let a=t()||i.firstElementChild;if(a){a.style.transition="none",a.style.opacity="0",a.style.filter=FADE_BLUR;var e=a.getBoundingClientRect().height;i.style.overflow="hidden",i.style.height=s+"px",i.style.transition=`height ${MORPH_MS}ms `+MORPH_EASE,i.style.height=e+"px",a.style.transition=`opacity ${.7*MORPH_MS}ms ease, filter ${.7*MORPH_MS}ms ease`,a.style.opacity="1",a.style.filter="none";let t=e=>{"height"===e.propertyName&&(i.removeEventListener("transitionend",t),i.style.transition="",i.style.height="",i.style.overflow="",a.style.transition="",a.style.filter="",contentChanged())};i.addEventListener("transitionend",t)}}},FADE_MS)}}async function lookupIdentity(e){e=await api("/api/admin/lookup",{method:"POST",body:{ids:[e]}});return{ok:e.ok,matched:e.data&&e.data.matched||[]}}function makePicker(e,a,s){return new Picker(e,a,{...s,lookup:lookupIdentity,t:t})}function renderCompose(a){a.innerHTML=`
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
        <button type="button" class="bm-primary bm-send" disabled>
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span class="np-btn-label">${e("post","Post announcement")}</span>
        </button>
      </footer>
    </div>

    <div class="bm-receipt" hidden></div>`;var s=a.querySelector('[data-picker="audience"]');pickers.set("audience",makePicker("audience",s,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),a.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose()}function composeMode(a){state.compose.mode=a;var e=root.querySelector('[data-part="announce"]');e.querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===a)}),e.querySelector('[data-picker="audience"]').hidden="all"===a,e.querySelector(".bm-audience-hint").textContent="all"===a?t("aud_all_hint","Every follower receives this."):"users"===a?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),syncCompose()}function syncCompose(){var e,t,a,s,i,n=root.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),a=n.querySelector(".bm-c-url"),s=n.querySelector(".bm-send"),i=pickers.get("audience"),e)&&s&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==state.compose.mode)||i&&i.settled&&0<i.ids.length,s.disabled=!e.value.trim()||!a.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(e){var t=root.querySelector('[data-part="announce"]'),a=t.querySelector(".bm-c-title").value.trim(),s=t.querySelector(".bm-c-body").value.trim(),i=t.querySelector(".bm-c-url").value.trim(),n=state.compose.mode,o=pickers.get("audience"),l=(setBusy(e,!0),"all"===n?{kind:"all"}:{kind:n,users:o?o.ids:[]}),a=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(a),type:"announcement",topic:"announcements",title:a,body:s,url:i,tag:"announcements",audience:l}});setBusy(e,!1),renderReceipt(t.querySelector(".bm-receipt"),a,{mode:n,audience:l}),a.ok&&(t.querySelector(".bm-c-title").value="",t.querySelector(".bm-c-body").value="",t.querySelector(".bm-c-url").value="",o&&o.clear(),syncCompose(),setFilter(""))}function renderReceipt(a,s,{mode:i,audience:n}){var o,l,r,c;a.hidden=!1,s.ok?(c=((o=s.data||{}).counts||[])[0]||{},l=o.audience&&o.audience.matched||[],r=o.audience&&o.audience.unknown||[],c=[[t("r_id","Id"),o.ingested&&o.ingested[0]],[t("r_recipients","Inboxes written"),c.recipients],[t("r_devices","Push devices"),c.devices],[t("r_messages","Queue messages"),c.messages],[t("r_audience","Audience"),"all"===i?t("aud_all","Everyone"):`${"users"===i?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]],l.length&&c.push([t("r_matched","Matched"),l.map(e=>e.login+" #"+e.id).join(", ")]),r.length&&c.push([t("r_ignored","Ignored"),r.join(", ")]),(o.skipped||[]).length&&c.push([t("r_skipped","Already sent"),o.skipped.join(", ")]),o.absorbed&&c.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),a.className="bm-receipt is-good",a.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${c.map(([e,t])=>`<dt>${escapeHTML(e)}</dt><dd>${escapeHTML(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`):(i=s.data&&(s.data.error||s.data.message)||(s.status?"HTTP "+s.status:t("offline","The Worker did not answer.")),a.className="bm-receipt is-bad",a.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${escapeHTML(i)}</p>`)}function renderNotificationsShell(a){var s=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]];a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${s.map(([e,t])=>`<button type="button" data-type="${escapeHTML(e)}"${e===state.notifications.type?' class="is-on"':""}>${escapeHTML(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`}function notifInnerHTML(a){let s="";try{var i=JSON.parse(a.audience_json||"{}");s="users"===i.kind?t("aud_only","Only these")+" "+(i.users||[]).length:"except"===i.kind?t("aud_except","Everyone except")+" "+(i.users||[]).length:"all"===i.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}i=[a.id,a.type,a.topic,a.source,a.recipients+" "+t("m_inboxes","inboxes"),a.devices+" "+t("m_devices","devices"),s,timeAgo(a.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${TYPE_ICONS[a.type]||"fa-bell"}" aria-hidden="true"></i>
        </span>
        <div class="bm-notif-main">
          <div class="bm-notif-title">${escapeHTML(a.title)}</div>
          ${a.body?`<p class="bm-notif-body">${escapeHTML(a.body)}</p>`:""}
          <a class="bm-notif-url" href="${escapeHTML(a.url)}" target="_blank" rel="noopener">
            ${escapeHTML(a.url)}</a>
          <div class="bm-notif-meta">${i.map(e=>`<span>${escapeHTML(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
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
    </div>`}function paintNotifications(){var t=root.querySelector('[data-part="notifications"]'),a=t.querySelector(".bm-notifs"),s=t.querySelector(".bm-foot"),i=state.notifications;t.querySelector(".bm-notif-count").textContent=i.items.length?String(i.items.length):"",t.classList.toggle("is-loading",i.loading),i.loading&&!i.items.length?a.innerHTML=SPINNER_ROW:i.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:i.items.length?a.innerHTML=i.items.map(notificationHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,s.innerHTML=i.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){state.notifications.type=t,root.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var a=state.notifications,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&setBusy(t,!0),a.loading=!0,paintNotifications(),`?type=${encodeURIComponent(a.type)}&cursor=`+a.cursor),t=await api("/api/admin/notifications"+e);a.loading=!1,a.error=!t.ok,t.ok&&t.data&&(a.items=a.items.concat(t.data.items||[]),a.more=null!=t.data.cursor,a.cursor=t.data.cursor||a.cursor),paintNotifications()}function startEdit(t){let a=state.notifications.items.find(e=>e.id===t.dataset.id);a&&!t.querySelector(".is-editing")&&morph(t,t.firstElementChild,()=>{t.innerHTML=editorHTML(a);var e=t.querySelector(".bm-e-title");return e&&e.focus(),t.firstElementChild})}function cancelEdit(t){let e=state.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function saveEdit(e,t){let a=e.dataset.id;var s,i,n,o,l=state.notifications.items.find(e=>e.id===a);l&&(s=e.querySelector(".bm-e-title").value.trim(),i=e.querySelector(".bm-e-body").value.trim(),n=e.querySelector(".bm-e-url").value.trim(),s)&&(setBusy(t,!0),o=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"PUT",body:{title:s,body:i,url:n}}),setBusy(t,!1),o.ok?(l.title=s,l.body=i,n&&(l.url=n),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))}async function deleteNotification(e,t){let a=e.dataset.id;setBusy(t,!0);var s=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"DELETE"});setBusy(t,!1),s.ok&&(state.notifications.items=state.notifications.items.filter(e=>e.id!==a),collapseAway(e,paintNotifications))}function collapseAway(e,t){var a;reduced?t():(a=e.getBoundingClientRect().height,e.style.overflow="hidden",e.style.height=a+"px",e.style.transition=`height ${MORPH_MS}ms ${MORPH_EASE}, opacity ${FADE_MS}ms ease`,e.style.opacity="0",e.style.height="0px",setTimeout(t,MORPH_MS))}let POST_FILTERS=["","encrypted","draft","unpublished"];function writeHref(){return siteRoot()+"/blog-management/write/"}function renderPostsShell(a){var s=[["",t("p_all","All")],["encrypted",t("p_encrypted","Encrypted")],["draft",t("p_drafts","Drafts")],["unpublished",t("p_unpublished","Unpublished")]];a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-newspaper" aria-hidden="true"></i>${e("p_title","Posts management")}
      <span class="bm-count bm-post-count"></span>
    </h2>
    <p class="bm-lede">${e("p_lede","Every article and album on the site, and what can be done with each. Nothing here is fetched — it was sealed into this page by the build.")}</p>

    <div class="bm-post-bar">
      <div class="bm-seg bm-post-filter" role="group">
        ${s.map(([e,t])=>`<button type="button" data-filter="${escapeHTML(e)}"${e===state.posts.filter?' class="is-on"':""}>${escapeHTML(t)}</button>`).join("")}
      </div>
      <a class="bm-write" href="${escapeHTML(writeHref())}">
        <i class="fa-solid fa-feather-pointed" aria-hidden="true"></i>
        <span>${e("p_new","New post")}</span>
      </a>
    </div>

    <ul class="bm-post-list"></ul>`}function postFlags(e){var a=[];return"album"===e.kind&&a.push(["album","fa-images",t("p_album","Album")]),e.encrypted&&a.push(["encrypted","fa-lock-keyhole",t("v_badge","Encrypted")]),e.draft&&a.push(["draft","fa-pen-nib",t("p_draft","Draft")]),e.published||a.push(["unpublished","fa-eye-slash",t("p_unpublished_tag","Unpublished")]),e.sticky&&a.push(["sticky","fa-thumbtack",t("p_sticky","Pinned")]),a}function matchesFilter(e,t){return!(t&&("encrypted"===t?!e.encrypted:"draft"===t?!e.draft:"unpublished"===t&&e.published))}function canGrant(e){return!!(e.published&&e.encrypted&&e.vaultId)}function editHref(e){e=(e.draft||e).href;return e+(e.indexOf("#")<0?"#edit":"")}function postRowHTML(a){var s=a.date?new Date(a.date):null,i=(state.posts.audiences[a.vaultId]||[]).length,n=canGrant(a),o=[],s=(s&&o.push(`<span><i class="fa-solid fa-calendars"></i>${s.toISOString().slice(0,10)}</span>`),(a.categories||[]).length&&o.push(`<span><i class="fa-solid fa-folders"></i>${escapeHTML(a.categories.join(" / "))}</span>`),(a.tags||[]).length&&o.push(`<span><i class="fa-solid fa-tags"></i>${escapeHTML(a.tags.join(", "))}</span>`),a.slug&&o.push(`<span class="bm-post-slug"><i class="fa-solid fa-link"></i>${escapeHTML(a.slug)}</span>`),postFlags(a).map(([e,t,a])=>`<span class="bm-bubble is-${e}"><i class="fa-solid ${t}" aria-hidden="true"></i>${escapeHTML(a)}</span>`).join("")),i=n?`<span class="bm-bubble is-readers" data-empty="${i?"0":"1"}">
         <i class="fa-solid fa-user-lock" aria-hidden="true"></i>
         ${state.posts.loading?'<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>':`<strong>${i}</strong>`+escapeHTML(t(1===i?"v_reader":"v_readers","readers"))}</span>`:"",l="album"===a.kind?"":`<a class="bm-quiet bm-post-edit" href="${escapeHTML(editHref(a))}">
           <i class="fa-solid fa-pen" aria-hidden="true"></i>
           <span class="np-btn-label">${e("edit","Edit")}</span></a>
         `+(a.published?`<button type="button" class="bm-quiet bm-danger bm-post-unpublish">
                  <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>
                  <span class="np-btn-label">${e("p_unpublish","Unpublish")}</span></button>`:"");return`
    <li class="bm-post${a.encrypted?" is-encrypted":""}${a.draft?" is-draft":""}" data-key="${escapeHTML(a.key)}">
      <div class="bm-post-main">
        <div class="bm-post-title">
          <i class="fa-solid ${"album"===a.kind?"fa-images":a.encrypted?"fa-lock-keyhole":"fa-file-lines"}" aria-hidden="true"></i>
          <a href="${escapeHTML(a.href)}" target="_blank" rel="noopener">${escapeHTML(a.title||t("p_untitled","Untitled"))}</a>
        </div>
        <div class="bm-post-meta">${o.join("")}</div>
        ${a.excerpt?`<p class="bm-post-excerpt">${escapeHTML(a.excerpt)}</p>`:""}
      </div>

      <div class="bm-post-side">
        <div class="bm-bubbles">${s}${i}</div>
        <div class="bm-post-actions">${l}</div>
      </div>

      ${n?`<div class="bm-post-audience">
               <label class="bm-blocklist-label">
                 ${e("v_audience","Who can read this")}
                 <span class="bm-save-state" data-save="vault:${escapeHTML(a.vaultId)}"></span>
               </label>
               <div class="bm-picker-host" data-picker="vault:${escapeHTML(a.vaultId)}"></div>
             </div>`:""}
    </li>`}function paintPosts(){var i=root.querySelector('[data-part="posts"]');if(i){var a=i.querySelector(".bm-post-list");let s=state.posts;var n,o,l=s.items.filter(e=>matchesFilter(e,s.filter));i.querySelector(".bm-post-count").textContent=l.length||"",l.length?a.innerHTML=l.map(postRowHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("p_empty","Nothing matches this filter.")}</li>`;for(let a of l)canGrant(a)&&(n="vault:"+a.vaultId,o=i.querySelector(`[data-picker="${CSS.escape(n)}"]`))&&((o=makePicker(n,o,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveAudience(a.vaultId,e)})).set(s.audiences[a.vaultId]||[]),pickers.set(n,o));contentChanged()}}function setPostFilter(e){state.posts.filter=POST_FILTERS.includes(e)?e:"",root.querySelectorAll(".bm-post-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.filter===state.posts.filter)}),paintPosts()}async function loadAudiences(){state.posts.loading=!0;var e=await api("/api/admin/vault");state.posts.loading=!1,e.ok&&e.data&&(state.posts.audiences=e.data.audiences||{}),paintPosts()}async function saveAudience(e,t){let a=root.querySelector(`[data-save="${CSS.escape("vault:"+e)}"]`);var s;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),t=t.entries,s=await api(`/api/admin/vault/${encodeURIComponent(e)}/audience`,{method:"PUT",body:{audience:t}}),a&&(a.innerHTML=s.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',s.ok)&&setTimeout(()=>a.innerHTML="",1800),s.ok&&(state.posts.audiences[e]=t,e=(s=root.querySelector(`[data-picker="${CSS.escape("vault:"+e)}"]`))&&s.closest(".bm-post").querySelector(".bm-bubble.is-readers"))&&(e.querySelector("strong").textContent=t.length,e.dataset.empty=t.length?"0":"1")):a&&(a.innerHTML="")}async function unpublishPost(t,e){var a=state.posts.items.find(e=>e.key===t.dataset.key);if(a){setBusy(e,!0),t.classList.add("is-working");try{var[s,i]=await Promise.all([import("./editor/repo.js"),import("./editor/session.js")]);await s.open(!0),await i.unpublish(a),a.published=!1,a.encrypted=!1,a.draft=a.draft||{id:"",slug:a.slug||"",href:a.href,source:a.source},a.vaultId="",paintPosts()}catch(e){t.classList.add("is-bad"),setTimeout(()=>t.classList.remove("is-bad"),1600),notePostError(e&&e.message)}finally{t.classList.remove("is-working"),setBusy(e,!1)}}}function notePostError(a){var s=root.querySelector('[data-part="posts"]');if(s){let e=s.querySelector(".bm-post-error");e||((e=document.createElement("p")).className="bm-post-error",s.appendChild(e)),e.textContent=a||t("offline","The Worker did not answer."),contentChanged()}}function renderFollowersShell(s){s.innerHTML=`
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
      <span>${e("moderation_notice","Muting or banning here can only affect notifications and access to encrypted posts. It does not stop anyone commenting on the blog — comments are GitHub Discussions, so blocking a commenter is done in your GitHub account settings under Moderation.")}
      <a href="${MODERATION_DOCS}" target="_blank" rel="noopener">${e("moderation_docs","GitHub docs")}</a></span>
    </p>

    <ul class="bm-followers"></ul>
    <div class="bm-foot"></div>
    <div class="bm-orphans"></div>`,TOPICS.forEach(a=>{var e=s.querySelector(`[data-picker="${a}"]`);pickers.set(a,makePicker(a,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveBlocklist(a,e)}))})}async function saveBlocklist(e,t){let a=root.querySelector(`[data-save="${e}"]`);var s;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),s=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),a&&(a.innerHTML=s.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',s.ok)&&setTimeout(()=>a.innerHTML="",1800),s.ok&&(state.blocklists[e]=t.ids)):a&&(a.innerHTML="")}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,a,s,i){return i?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(i="banned"===s,`
    <button type="button" class="bm-quiet bm-mod${(s="muted"===s)?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(a)}" data-next="${s?"":"muted"}">
      <i class="fa-solid ${s?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${i?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(a)}" data-next="${i?"":"banned"}">
      <i class="fa-solid ${i?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${i?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,a){var s=describeDevice(e);return`
    <li class="bm-device" data-device="${escapeHTML(e.id)}">
      <span class="bm-device-icon"><i class="${s.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${escapeHTML(s.browser)}<span class="bm-sep"></span>${escapeHTML(s.os)}<span class="bm-sep"></span>${escapeHTML(s.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${escapeHTML(t("subscribed","Subscribed")+" "+timeAgo(e.created_at))}<span class="bm-sep"></span>…${escapeHTML(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,a)}</div>
    </li>`}function followerHTML(a){var s=String(a.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),s=["#"+a.id,t("subscribed","Subscribed")+" "+timeAgo(a.created_at),a.devices.length+" "+t("m_devices","devices"),a.unread+" "+t("m_unread","unread"),s.length?t("m_blocked","Blocked")+": "+s.join(", "):""].filter(Boolean);return`
    <li class="bm-follower${a.state?" is-"+a.state:""}" data-follower="${escapeHTML(a.id)}">
      <div class="bm-follower-head">
        <img class="bm-avatar" src="${avatarOf(a.id)}" alt="" loading="lazy">
        <div class="bm-follower-main">
          <div class="bm-follower-name">
            ${escapeHTML(a.name||a.login)}
            <a class="bm-login" href="https://github.com/${encodeURIComponent(a.login)}"
               target="_blank" rel="noopener">@${escapeHTML(a.login)}</a>
            ${stateTag(a.state)}
          </div>
          <div class="bm-follower-meta">${s.map(e=>`<span>${escapeHTML(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",a.id,a.state,a.is_admin)}
        </div>
      </div>
      ${a.devices.length?`<ul class="bm-devices">${a.devices.map(e=>deviceHTML(e,a.is_admin)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var a=root.querySelector('[data-part="followers"]'),s=a.querySelector(".bm-followers"),i=a.querySelector(".bm-foot"),n=state.followers;n.totals&&(a.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),a.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?s.innerHTML=SPINNER_ROW:n.error?s.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?s.innerHTML=n.items.map(followerHTML).join(""):s.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,i.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",a.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var s=state.followers,e=(e&&(s.items=[],s.cursor=0,s.more=!1),t&&setBusy(t,!0),s.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+s.cursor));if(s.loading=!1,s.error=!e.ok,e.ok&&e.data){let a=e.data;s.items=s.items.concat(a.items||[]),s.more=null!=a.cursor,s.cursor=a.cursor||s.cursor,a.orphans&&(s.orphans=a.orphans),a.totals&&(s.totals=a.totals),a.blocklists&&(state.blocklists=a.blocklists,TOPICS.forEach(e=>{var t=pickers.get(e);t&&t.set(a.blocklists[e]||[])}))}paintFollowers()}async function moderate(e){var t=e.dataset.scope;let a=e.dataset.target;var s=e.dataset.next,i=(setBusy(e,!0),await api("/api/admin/moderation",{method:"PUT",body:"device"===t?{device_id:Number(a),state:s}:{github_id:Number(a),state:s}}));if(setBusy(e,!1),i.ok){e=state.followers;if("follower"===t){i=e.items.find(e=>String(e.id)===String(a));i&&(i.state=s)}else{for(var n of e.items){n=n.devices.find(e=>String(e.id)===String(a));n&&(n.state=s)}t=e.orphans.find(e=>String(e.id)===String(a));t&&(t.state=s)}paintFollowers()}}function wire(){root.addEventListener("click",e=>{var a,e=e.target,s=e.closest(".bm-seg [data-mode]");s?composeMode(s.dataset.mode):(s=e.closest(".bm-notif-filter [data-type]"))?setFilter(s.dataset.type):(s=e.closest(".bm-post-filter [data-filter]"))?setPostFilter(s.dataset.filter):(s=e.closest(".bm-send"))?send(s):(s=e.closest(".bm-more"))?("followers"===s.dataset.more?loadFollowers:loadNotifications)({trigger:s}):(s=e.closest(".bm-edit"))?startEdit(s.closest(".bm-notif")):(s=e.closest(".bm-cancel"))?cancelEdit(s.closest(".bm-notif")):(s=e.closest(".bm-save"))?saveEdit(s.closest(".bm-notif"),s):(s=e.closest(".bm-del"))?(a=s.closest(".bm-notif"),confirmStep(s,"del:"+a.dataset.id,"")&&deleteNotification(a,s)):(a=e.closest(".bm-mod"))?(s=`mod:${a.dataset.scope}:${a.dataset.target}:`+a.dataset.next,confirmStep(a,s,t("confirm","Press again"))&&moderate(a)):(s=e.closest(".bm-post-unpublish"))?(a=s.closest(".bm-post"),confirmStep(s,"unpub:"+a.dataset.key,t("confirm","Press again"))&&unpublishPost(a,s)):disarmConfirm()})}function boot(){var e={posts:root.querySelector('[data-part="posts"]'),announce:root.querySelector('[data-part="announce"]'),notifications:root.querySelector('[data-part="notifications"]'),followers:root.querySelector('[data-part="followers"]')};e.posts&&(renderPostsShell(e.posts),paintPosts()),renderCompose(e.announce),renderNotificationsShell(e.notifications),renderFollowersShell(e.followers),e.posts&&loadAudiences(),loadNotifications({reset:!0}),loadFollowers({reset:!0})}function initBlogManagement(e){var t=document.getElementById("blog-management");t&&(root=t,pickers.clear(),state.compose.mode="all",state.notifications.type="",state.notifications.loading=!1,state.followers.loading=!1,state.posts.items=e&&e.items||[],state.posts.audiences={},state.posts.filter="",reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.theme&&window.theme.backend||{},base=window.blogAuth?window.blogAuth.resolveApiBase():String(t.api_url||"").replace(/\/+$/,""),wire(),boot())}export{initBlogManagement};