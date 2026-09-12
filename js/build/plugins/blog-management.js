import{setBusy as n,confirmStep as s,disarmConfirm as i,timeAgo as a,escapeHTML as o,describeDevice as l}from"./notifications-inbox.js";import{Picker as r,avatarOf as c}from"../tools/chipPicker.js";import{siteRoot as d}from"../tools/vaultCrypto.js";let u=130,p=280,m="cubic-bezier(0.32, 0.72, 0, 1)",b="blur(3px)",f=["posts","notes","announcements"],h={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},y='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>';function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,a){return o(t(e,a))}let g=null,v="",$=!1,w={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},posts:{items:[],audiences:{},filter:"",loading:!1},blocklists:{posts:[],notes:[],announcements:[]}},k=new Map;async function api(e,t={},a=!0){var i=await(async()=>{if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}})();if(!i)return{ok:!1,status:401,data:null};i={method:t.method||"GET",headers:{Authorization:"Bearer "+i}};let s;void 0!==t.body&&(i.headers["Content-Type"]="application/json",i.body=JSON.stringify(t.body));try{s=await fetch(v+e,i)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&a&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if($)t();else{let i=e.getBoundingClientRect().height;e.style.transition="opacity 130ms ease, filter 130ms ease",e.style.opacity="0",e.style.filter=b,setTimeout(()=>{if(s.isConnected){let a=t()||s.firstElementChild;if(a){a.style.transition="none",a.style.opacity="0",a.style.filter=b;var e=a.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=i+"px",s.style.transition="height 280ms "+m,s.style.height=e+"px",a.style.transition="opacity 196ms ease, filter 196ms ease",a.style.opacity="1",a.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",a.style.transition="",a.style.filter="",contentChanged())};s.addEventListener("transitionend",t)}}},u)}}async function lookupIdentity(e){e=await api("/api/admin/lookup",{method:"POST",body:{ids:[e]}});return{ok:e.ok,matched:e.data&&e.data.matched||[]}}function makePicker(e,a,i){return new r(e,a,{...i,lookup:lookupIdentity,t:t})}function syncCompose(){var e,t,a,i,s,n=g.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),a=n.querySelector(".bm-c-url"),i=n.querySelector(".bm-send"),s=k.get("audience"),e)&&i&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==w.compose.mode)||s&&s.settled&&0<s.ids.length,i.disabled=!e.value.trim()||!a.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(a){var i=g.querySelector('[data-part="announce"]'),s=i.querySelector(".bm-c-title").value.trim(),l=i.querySelector(".bm-c-body").value.trim(),r=i.querySelector(".bm-c-url").value.trim(),d=w.compose.mode,c=k.get("audience"),u=(n(a,!0),"all"===d?{kind:"all"}:{kind:d,users:c?c.ids:[]}),s=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(s),type:"announcement",topic:"announcements",title:s,body:l,url:r,tag:"announcements",audience:u}});n(a,!1),((i,s,{mode:a,audience:n})=>{if(i.hidden=!1,!s.ok){let a=s.data&&(s.data.error||s.data.message)||(s.status?"HTTP "+s.status:t("offline","The Worker did not answer."));return i.className="bm-receipt is-bad",i.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${o(a)}</p>`}var l=((s=s.data||{}).counts||[])[0]||{},r=s.audience&&s.audience.matched||[],d=s.audience&&s.audience.unknown||[],l=[[t("r_id","Id"),s.ingested&&s.ingested[0]],[t("r_recipients","Inboxes written"),l.recipients],[t("r_devices","Push devices"),l.devices],[t("r_messages","Queue messages"),l.messages],[t("r_audience","Audience"),"all"===a?t("aud_all","Everyone"):`${"users"===a?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]];r.length&&l.push([t("r_matched","Matched"),r.map(e=>e.login+" #"+e.id).join(", ")]),d.length&&l.push([t("r_ignored","Ignored"),d.join(", ")]),(s.skipped||[]).length&&l.push([t("r_skipped","Already sent"),s.skipped.join(", ")]),s.absorbed&&l.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),i.className="bm-receipt is-good",i.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${l.map(([e,t])=>`<dt>${o(e)}</dt><dd>${o(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`})(i.querySelector(".bm-receipt"),s,{mode:d,audience:u}),s.ok&&(i.querySelector(".bm-c-title").value="",i.querySelector(".bm-c-body").value="",i.querySelector(".bm-c-url").value="",c&&c.clear(),syncCompose(),setFilter(""))}function notifInnerHTML(i){let s="";try{let e=JSON.parse(i.audience_json||"{}");s="users"===e.kind?t("aud_only","Only these")+" "+(e.users||[]).length:"except"===e.kind?t("aud_except","Everyone except")+" "+(e.users||[]).length:"all"===e.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}let n=[i.id,i.type,i.topic,i.source,i.recipients+" "+t("m_inboxes","inboxes"),i.devices+" "+t("m_devices","devices"),s,a(i.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${h[i.type]||"fa-bell"}" aria-hidden="true"></i>
        </span>
        <div class="bm-notif-main">
          <div class="bm-notif-title">${o(i.title)}</div>
          ${i.body?`<p class="bm-notif-body">${o(i.body)}</p>`:""}
          <a class="bm-notif-url" href="${o(i.url)}" target="_blank" rel="noopener">
            ${o(i.url)}</a>
          <div class="bm-notif-meta">${n.map(e=>`<span>${o(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-notif-actions">
          <button type="button" class="bm-icon bm-edit" aria-label="${e("edit","Edit")}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i></button>
          <button type="button" class="bm-icon bm-del" aria-label="${e("delete","Delete")}">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
        </div>
      </div>`}function notificationHTML(e){return`<li class="bm-notif" data-id="${o(e.id)}">${notifInnerHTML(e)}</li>`}function paintNotifications(){var t=g.querySelector('[data-part="notifications"]'),a=t.querySelector(".bm-notifs"),i=t.querySelector(".bm-foot"),s=w.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?a.innerHTML=y:s.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?a.innerHTML=s.items.map(notificationHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,i.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){w.notifications.type=t,g.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var a=w.notifications,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&n(t,!0),a.loading=!0,paintNotifications(),`?type=${encodeURIComponent(a.type)}&cursor=`+a.cursor),t=await api("/api/admin/notifications"+e);a.loading=!1,a.error=!t.ok,t.ok&&t.data&&(a.items=a.items.concat(t.data.items||[]),a.more=null!=t.data.cursor,a.cursor=t.data.cursor||a.cursor),paintNotifications()}function startEdit(a){let i=w.notifications.items.find(e=>e.id===a.dataset.id);i&&!a.querySelector(".is-editing")&&morph(a,a.firstElementChild,()=>{a.innerHTML=(t=i,`
    <div class="bm-notif-inner is-editing">
      <div class="bm-notif-main">
        <input class="bm-field bm-e-title" type="text" maxlength="120"
               value="${o(t.title)}">
        <textarea class="bm-field bm-e-body" maxlength="500" rows="3">${o(t.body||"")}</textarea>
        <input class="bm-field bm-e-url" type="url" value="${o(t.url)}">
        <p class="bm-hint">${e("edit_hint","Editing changes the inbox copy only. Nothing is pushed again.")}</p>
      </div>
      <div class="bm-notif-actions">
        <button type="button" class="bm-icon bm-save" aria-label="${e("save","Save")}">
          <i class="fa-solid fa-check" aria-hidden="true"></i></button>
        <button type="button" class="bm-icon bm-cancel" aria-label="${e("cancel","Cancel")}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
    </div>`);var t=a.querySelector(".bm-e-title");return t&&t.focus(),a.firstElementChild})}function cancelEdit(t){let e=w.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function deleteNotification(e,t){let a=e.dataset.id;n(t,!0);var i=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"DELETE"});n(t,!1),i.ok&&(w.notifications.items=w.notifications.items.filter(e=>e.id!==a),t=e,i=paintNotifications,$?i():(e=t.getBoundingClientRect().height,t.style.overflow="hidden",t.style.height=e+"px",t.style.transition=`height 280ms ${m}, opacity 130ms ease`,t.style.opacity="0",t.style.height="0px",setTimeout(i,p)))}let S=["","encrypted","draft","unpublished"];function renderPostsShell(a){var i=[["",t("p_all","All")],["encrypted",t("p_encrypted","Encrypted")],["draft",t("p_drafts","Drafts")],["unpublished",t("p_unpublished","Unpublished")]];a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-newspaper" aria-hidden="true"></i>${e("p_title","Posts management")}
      <span class="bm-count bm-post-count"></span>
    </h2>
    <p class="bm-lede">${e("p_lede","Every article and album on the site, and what can be done with each. Nothing here is fetched — it was sealed into this page by the build.")}</p>

    <div class="bm-post-bar">
      <div class="bm-seg bm-post-filter" role="group">
        ${i.map(([e,t])=>`<button type="button" data-filter="${o(e)}"${e===w.posts.filter?' class="is-on"':""}>${o(t)}</button>`).join("")}
      </div>
      <a class="bm-write" href="${o(d()+"/blog-management/write/")}">
        <i class="fa-solid fa-feather-pointed" aria-hidden="true"></i>
        <span>${e("p_new","New post")}</span>
      </a>
    </div>

    <ul class="bm-post-list"></ul>`}function canGrant(e){return!!(e.published&&e.encrypted&&e.vaultId)}function postRowHTML(a){var i=a.date?new Date(a.date):null,s=(w.posts.audiences[a.vaultId]||[]).length,n=canGrant(a),l=[],r=(i&&l.push(`<span><i class="fa-solid fa-calendars"></i>${i.toISOString().slice(0,10)}</span>`),(a.categories||[]).length&&l.push(`<span><i class="fa-solid fa-folders"></i>${o(a.categories.join(" / "))}</span>`),(a.tags||[]).length&&l.push(`<span><i class="fa-solid fa-tags"></i>${o(a.tags.join(", "))}</span>`),a.slug&&l.push(`<span class="bm-post-slug"><i class="fa-solid fa-link"></i>${o(a.slug)}</span>`),i=[],"album"===(r=a).kind&&i.push(["album","fa-images",t("p_album","Album")]),r.encrypted&&i.push(["encrypted","fa-lock-keyhole",t("v_badge","Encrypted")]),r.draft&&i.push(["draft","fa-pen-nib",t("p_draft","Draft")]),r.published||i.push(["unpublished","fa-eye-slash",t("p_unpublished_tag","Unpublished")]),r.sticky&&i.push(["sticky","fa-thumbtack",t("p_sticky","Pinned")]),i.map(([e,t,a])=>`<span class="bm-bubble is-${e}"><i class="fa-solid ${t}" aria-hidden="true"></i>${o(a)}</span>`).join("")),i=n?`<span class="bm-bubble is-readers" data-empty="${s?"0":"1"}">
         <i class="fa-solid fa-user-lock" aria-hidden="true"></i>
         ${w.posts.loading?'<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>':`<strong>${s}</strong>`+o(t(1===s?"v_reader":"v_readers","readers"))}</span>`:"",s="album"===a.kind?"":`<a class="bm-quiet bm-post-edit" href="${o((e=>(e=(e.draft||e).href)+(e.indexOf("#")<0?"#edit":""))(a))}">
           <i class="fa-solid fa-pen" aria-hidden="true"></i>
           <span class="np-btn-label">${e("edit","Edit")}</span></a>
         `+(a.published?`<button type="button" class="bm-quiet bm-danger bm-post-unpublish">
                  <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>
                  <span class="np-btn-label">${e("p_unpublish","Unpublish")}</span></button>`:"");return`
    <li class="bm-post${a.encrypted?" is-encrypted":""}${a.draft?" is-draft":""}" data-key="${o(a.key)}">
      <div class="bm-post-main">
        <div class="bm-post-title">
          <i class="fa-solid ${"album"===a.kind?"fa-images":a.encrypted?"fa-lock-keyhole":"fa-file-lines"}" aria-hidden="true"></i>
          <a href="${o(a.href)}" target="_blank" rel="noopener">${o(a.title||t("p_untitled","Untitled"))}</a>
        </div>
        <div class="bm-post-meta">${l.join("")}</div>
        ${a.excerpt?`<p class="bm-post-excerpt">${o(a.excerpt)}</p>`:""}
      </div>

      <div class="bm-post-side">
        <div class="bm-bubbles">${r}${i}</div>
        <div class="bm-post-actions">${s}</div>
      </div>

      ${n?`<div class="bm-post-audience">
               <label class="bm-blocklist-label">
                 ${e("v_audience","Who can read this")}
                 <span class="bm-save-state" data-save="vault:${o(a.vaultId)}"></span>
               </label>
               <div class="bm-picker-host" data-picker="vault:${o(a.vaultId)}"></div>
             </div>`:""}
    </li>`}function paintPosts(){var o,l=g.querySelector('[data-part="posts"]');if(l){let a=l.querySelector(".bm-post-list"),s=w.posts,n=s.items.filter(e=>{return e=e,!((t=s.filter)&&("encrypted"===t?!e.encrypted:"draft"===t?!e.draft:"unpublished"===t&&e.published));var t});l.querySelector(".bm-post-count").textContent=n.length||"",n.length?a.innerHTML=n.map(postRowHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("p_empty","Nothing matches this filter.")}</li>`;for(let i of n)if(canGrant(i)){let e="vault:"+i.vaultId,a=l.querySelector(`[data-picker="${CSS.escape(e)}"]`);a&&((o=makePicker(e,a,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveAudience(i.vaultId,e)})).set(s.audiences[i.vaultId]||[]),k.set(e,o))}contentChanged()}}async function saveAudience(e,t){let a=g.querySelector(`[data-save="${CSS.escape("vault:"+e)}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),t=t.entries,i=await api(`/api/admin/vault/${encodeURIComponent(e)}/audience`,{method:"PUT",body:{audience:t}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(w.posts.audiences[e]=t,e=(i=g.querySelector(`[data-picker="${CSS.escape("vault:"+e)}"]`))&&i.closest(".bm-post").querySelector(".bm-bubble.is-readers"))&&(e.querySelector("strong").textContent=t.length,e.dataset.empty=t.length?"0":"1")):a&&(a.innerHTML="")}async function unpublishPost(a,e){var i=w.posts.items.find(e=>e.key===a.dataset.key);if(i){n(e,!0),a.classList.add("is-working");try{let[e,t]=await Promise.all([import("./editor/repo.js"),import("./editor/session.js")]);await e.open(!0),await t.unpublish(i),i.published=!1,i.encrypted=!1,i.draft=i.draft||{id:"",slug:i.slug||"",href:i.href,source:i.source},i.vaultId="",paintPosts()}catch(e){a.classList.add("is-bad"),setTimeout(()=>a.classList.remove("is-bad"),1600);var s=e&&e.message,o=g.querySelector('[data-part="posts"]');if(o){let e=o.querySelector(".bm-post-error");e||((e=document.createElement("p")).className="bm-post-error",o.appendChild(e)),e.textContent=s||t("offline","The Worker did not answer."),contentChanged()}}finally{a.classList.remove("is-working"),n(e,!1)}}}function renderFollowersShell(i){i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-users" aria-hidden="true"></i>${e("followers","Followers")}
      <span class="bm-count bm-follower-count"></span>
    </h2>

    <div class="bm-card bm-blocklists">
      <h3 class="bm-sub-title">${e("blocklists","Global blocklists")}</h3>
      <p class="bm-hint">${e("blocklists_hint","Anyone listed here is skipped for that kind of notification, silently and everywhere. Saved as soon as an entry resolves.")}</p>
      ${f.map(e=>`
        <div class="bm-blocklist">
          <label class="bm-blocklist-label">
            ${o(t("topic_"+e,e))}
            <span class="bm-save-state" data-save="${e}"></span>
          </label>
          <div class="bm-picker-host" data-picker="${e}"></div>
        </div>`).join("")}
    </div>

    <p class="bm-notice">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      <span>${e("moderation_notice","Muting or banning here can only affect notifications and access to encrypted posts. It does not stop anyone commenting on the blog — comments are GitHub Discussions, so blocking a commenter is done in your GitHub account settings under Moderation.")}
      <a href="https://docs.github.com/en/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account" target="_blank" rel="noopener">${e("moderation_docs","GitHub docs")}</a></span>
    </p>

    <ul class="bm-followers"></ul>
    <div class="bm-foot"></div>
    <div class="bm-orphans"></div>`,f.forEach(a=>{var e=i.querySelector(`[data-picker="${a}"]`);k.set(a,makePicker(a,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>(async(e,t)=>{let a=g.querySelector(`[data-save="${e}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),i=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(w.blocklists[e]=t.ids)):a&&(a.innerHTML="")})(a,e)}))})}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,a,i,s){return s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(s="banned"===i,`
    <button type="button" class="bm-quiet bm-mod${(i="muted"===i)?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${i?"":"muted"}">
      <i class="fa-solid ${i?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${i?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${s?"":"banned"}">
      <i class="fa-solid ${s?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,i){var s=l(e);return`
    <li class="bm-device" data-device="${o(e.id)}">
      <span class="bm-device-icon"><i class="${s.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${o(s.browser)}<span class="bm-sep"></span>${o(s.os)}<span class="bm-sep"></span>${o(s.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${o(t("subscribed","Subscribed")+" "+a(e.created_at))}<span class="bm-sep"></span>…${o(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,i)}</div>
    </li>`}function followerHTML(i){var s=String(i.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),s=["#"+i.id,t("subscribed","Subscribed")+" "+a(i.created_at),i.devices.length+" "+t("m_devices","devices"),i.unread+" "+t("m_unread","unread"),s.length?t("m_blocked","Blocked")+": "+s.join(", "):""].filter(Boolean);return`
    <li class="bm-follower${i.state?" is-"+i.state:""}" data-follower="${o(i.id)}">
      <div class="bm-follower-head">
        <img class="bm-avatar" src="${c(i.id)}" alt="" loading="lazy">
        <div class="bm-follower-main">
          <div class="bm-follower-name">
            ${o(i.name||i.login)}
            <a class="bm-login" href="https://github.com/${encodeURIComponent(i.login)}"
               target="_blank" rel="noopener">@${o(i.login)}</a>
            ${stateTag(i.state)}
          </div>
          <div class="bm-follower-meta">${s.map(e=>`<span>${o(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",i.id,i.state,i.is_admin)}
        </div>
      </div>
      ${i.devices.length?`<ul class="bm-devices">${i.devices.map(e=>deviceHTML(e,i.is_admin)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var a=g.querySelector('[data-part="followers"]'),i=a.querySelector(".bm-followers"),s=a.querySelector(".bm-foot"),n=w.followers;n.totals&&(a.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),a.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?i.innerHTML=y:n.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?i.innerHTML=n.items.map(followerHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",a.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var i=w.followers,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&n(t,!0),i.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+i.cursor));if(i.loading=!1,i.error=!e.ok,e.ok&&e.data){let a=e.data;i.items=i.items.concat(a.items||[]),i.more=null!=a.cursor,i.cursor=a.cursor||i.cursor,a.orphans&&(i.orphans=a.orphans),a.totals&&(i.totals=a.totals),a.blocklists&&(w.blocklists=a.blocklists,f.forEach(e=>{var t=k.get(e);t&&t.set(a.blocklists[e]||[])}))}paintFollowers()}function wire(){g.addEventListener("click",e=>{var a,e=e.target,o=e.closest(".bm-seg [data-mode]");if(o)return a=o.dataset.mode,w.compose.mode=a,(o=g.querySelector('[data-part="announce"]')).querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===a)}),o.querySelector('[data-picker="audience"]').hidden="all"===a,o.querySelector(".bm-audience-hint").textContent="all"===a?t("aud_all_hint","Every follower receives this."):"users"===a?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),void syncCompose();o=e.closest(".bm-notif-filter [data-type]");if(o)setFilter(o.dataset.type);else{var o=e.closest(".bm-post-filter [data-filter]");if(o)return o=o.dataset.filter,w.posts.filter=S.includes(o)?o:"",g.querySelectorAll(".bm-post-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.filter===w.posts.filter)}),void paintPosts();o=e.closest(".bm-send");if(o)send(o);else{o=e.closest(".bm-more");if(o)("followers"===o.dataset.more?loadFollowers:loadNotifications)({trigger:o});else{o=e.closest(".bm-edit");if(o)startEdit(o.closest(".bm-notif"));else{o=e.closest(".bm-cancel");if(o)cancelEdit(o.closest(".bm-notif"));else{o=e.closest(".bm-save");if(o)(async(e,t)=>{let a=e.dataset.id,i=w.notifications.items.find(e=>e.id===a);var s,o,l,r;i&&(s=e.querySelector(".bm-e-title").value.trim(),o=e.querySelector(".bm-e-body").value.trim(),l=e.querySelector(".bm-e-url").value.trim(),s)&&(n(t,!0),r=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"PUT",body:{title:s,body:o,url:l}}),n(t,!1),r.ok?(i.title=s,i.body=o,l&&(i.url=l),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))})(o.closest(".bm-notif"),o);else{o=e.closest(".bm-del");if(o){let e=o.closest(".bm-notif");void(s(o,"del:"+e.dataset.id,"")&&deleteNotification(e,o))}else{o=e.closest(".bm-mod");if(o){let e=`mod:${o.dataset.scope}:${o.dataset.target}:`+o.dataset.next;void(s(o,e,t("confirm","Press again"))&&(async a=>{let e=a.dataset.scope,i=a.dataset.target,s=a.dataset.next;n(a,!0);var t=await api("/api/admin/moderation",{method:"PUT",body:"device"===e?{device_id:Number(i),state:s}:{github_id:Number(i),state:s}});if(n(a,!1),t.ok){a=w.followers;if("follower"===e){let e=a.items.find(e=>String(e.id)===String(i));e&&(e.state=s)}else{for(let t of a.items){let e=t.devices.find(e=>String(e.id)===String(i));e&&(e.state=s)}let e=a.orphans.find(e=>String(e.id)===String(i));e&&(e.state=s)}paintFollowers()}})(o))}else{o=e.closest(".bm-post-unpublish");if(o){let e=o.closest(".bm-post");s(o,"unpub:"+e.dataset.key,t("confirm","Press again"))&&unpublishPost(e,o)}else i()}}}}}}}}})}function boot(){var a,i,s={posts:g.querySelector('[data-part="posts"]'),announce:g.querySelector('[data-part="announce"]'),notifications:g.querySelector('[data-part="notifications"]'),followers:g.querySelector('[data-part="followers"]')};s.posts&&(renderPostsShell(s.posts),paintPosts()),(a=s.announce).innerHTML=`
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

    <div class="bm-receipt" hidden></div>`,i=a.querySelector('[data-picker="audience"]'),k.set("audience",makePicker("audience",i,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),a.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose(),i=s.notifications,a=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]],i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${a.map(([e,t])=>`<button type="button" data-type="${o(e)}"${e===w.notifications.type?' class="is-on"':""}>${o(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`,renderFollowersShell(s.followers),s.posts&&(async()=>{w.posts.loading=!0;var e=await api("/api/admin/vault");w.posts.loading=!1,e.ok&&e.data&&(w.posts.audiences=e.data.audiences||{}),paintPosts()})(),loadNotifications({reset:!0}),loadFollowers({reset:!0})}function initBlogManagement(e){var t=document.getElementById("blog-management");t&&(g=t,k.clear(),w.compose.mode="all",w.notifications.type="",w.notifications.loading=!1,w.followers.loading=!1,w.posts.items=e&&e.items||[],w.posts.audiences={},w.posts.filter="",$=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.theme&&window.theme.backend||{},v=window.blogAuth?window.blogAuth.resolveApiBase():String(t.api_url||"").replace(/\/+$/,""),wire(),boot())}export{initBlogManagement};