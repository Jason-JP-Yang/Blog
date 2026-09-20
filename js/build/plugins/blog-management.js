import{setBusy as n,confirmStep as a,disarmConfirm as s,timeAgo as i,escapeHTML as o,describeDevice as l}from"./notifications-inbox.js";import{initManagementAnalytics as r}from"./management-analytics.js";import{Picker as c,avatarOf as d}from"../tools/chipPicker.js";import{b64urlToBytes as u,fetchSealed as p,importAesKey as m,openJSON as b,openText as f,siteRoot as h,vaultPrefix as g}from"../tools/vaultCrypto.js";import{enter as y,exit as v,pop as $}from"./editor/motion.js";let w=130,k=280,S="cubic-bezier(0.32, 0.72, 0, 1)",_="blur(3px)",q=["posts","notes","announcements"],T={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},L='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>';function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,a){return o(t(e,a))}let C=null,H="",M=!1,x={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1,me:null,role:"admin"},posts:{items:[],audiences:{},editors:{},filter:"",loading:!1,queue:[],bar:null,busy:!1},blocklists:{posts:[],notes:[],announcements:[]},me:{admin:!1,panels:{},grades:{},id:0,login:""},collab:{people:[],roster:[],loading:!1,error:!1},log:{record:null,loading:!1,error:!1}},E=new Map;async function api(e,t={},a=!0){var i=await(async()=>{if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}})();if(!i)return{ok:!1,status:401,data:null};i={method:t.method||"GET",headers:{Authorization:"Bearer "+i}};let s;void 0!==t.body&&(i.headers["Content-Type"]="application/json",i.body=JSON.stringify(t.body));try{s=await fetch(H+e,i)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&a&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if(M)t();else{let i=e.getBoundingClientRect().height;e.style.transition="opacity 130ms ease, filter 130ms ease",e.style.opacity="0",e.style.filter=_,setTimeout(()=>{if(s.isConnected){let a=t()||s.firstElementChild;if(a){a.style.transition="none",a.style.opacity="0",a.style.filter=_;var e=a.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=i+"px",s.style.transition="height 280ms "+S,s.style.height=e+"px",a.style.transition="opacity 196ms ease, filter 196ms ease",a.style.opacity="1",a.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",a.style.transition="",a.style.filter="",contentChanged())};s.addEventListener("transitionend",t)}}},w)}}async function lookupIdentity(e){e=await api("/api/admin/lookup",{method:"POST",body:{ids:[e]}});return{ok:e.ok,matched:e.data&&e.data.matched||[]}}function makePicker(e,a,i){return new c(e,a,{...i,lookup:lookupIdentity,t:t})}function syncCompose(){var e,t,a,i,s,n=C.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),a=n.querySelector(".bm-c-url"),i=n.querySelector(".bm-send"),s=E.get("audience"),e)&&i&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==x.compose.mode)||s&&s.settled&&0<s.ids.length,i.disabled=!e.value.trim()||!a.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(a){var i=C.querySelector('[data-part="announce"]'),s=i.querySelector(".bm-c-title").value.trim(),l=i.querySelector(".bm-c-body").value.trim(),r=i.querySelector(".bm-c-url").value.trim(),d=x.compose.mode,c=E.get("audience"),u=(n(a,!0),"all"===d?{kind:"all"}:{kind:d,users:c?c.ids:[]}),s=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(s),type:"announcement",topic:"announcements",title:s,body:l,url:r,tag:"announcements",audience:u}});n(a,!1),((i,s,{mode:a,audience:n})=>{if(i.hidden=!1,!s.ok){let a=s.data&&(s.data.error||s.data.message)||(s.status?"HTTP "+s.status:t("offline","The Worker did not answer."));return i.className="bm-receipt is-bad",i.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${o(a)}</p>`}var l=((s=s.data||{}).counts||[])[0]||{},r=s.audience&&s.audience.matched||[],d=s.audience&&s.audience.unknown||[],l=[[t("r_id","Id"),s.ingested&&s.ingested[0]],[t("r_recipients","Inboxes written"),l.recipients],[t("r_devices","Push devices"),l.devices],[t("r_messages","Queue messages"),l.messages],[t("r_audience","Audience"),"all"===a?t("aud_all","Everyone"):`${"users"===a?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]];r.length&&l.push([t("r_matched","Matched"),r.map(e=>e.login+" #"+e.id).join(", ")]),d.length&&l.push([t("r_ignored","Ignored"),d.join(", ")]),(s.skipped||[]).length&&l.push([t("r_skipped","Already sent"),s.skipped.join(", ")]),s.absorbed&&l.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),i.className="bm-receipt is-good",i.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${l.map(([e,t])=>`<dt>${o(e)}</dt><dd>${o(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`})(i.querySelector(".bm-receipt"),s,{mode:d,audience:u}),s.ok&&(i.querySelector(".bm-c-title").value="",i.querySelector(".bm-c-body").value="",i.querySelector(".bm-c-url").value="",c&&c.clear(),syncCompose(),setFilter(""))}function notifInnerHTML(a){let s="";try{let e=JSON.parse(a.audience_json||"{}");s="users"===e.kind?t("aud_only","Only these")+" "+(e.users||[]).length:"except"===e.kind?t("aud_except","Everyone except")+" "+(e.users||[]).length:"all"===e.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}let n=[a.id,a.type,a.topic,a.source,a.recipients+" "+t("m_inboxes","inboxes"),a.devices+" "+t("m_devices","devices"),s,i(a.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${T[a.type]||"fa-bell"}" aria-hidden="true"></i>
        </span>
        <div class="bm-notif-main">
          <div class="bm-notif-title">${o(a.title)}</div>
          ${a.body?`<p class="bm-notif-body">${o(a.body)}</p>`:""}
          <a class="bm-notif-url" href="${o(a.url)}" target="_blank" rel="noopener">
            ${o(a.url)}</a>
          <div class="bm-notif-meta">${n.map(e=>`<span>${o(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-notif-actions">
          <button type="button" class="bm-icon bm-edit" aria-label="${e("edit","Edit")}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i></button>
          <button type="button" class="bm-icon bm-del" aria-label="${e("delete","Delete")}">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
        </div>
      </div>`}function notificationHTML(e){return`<li class="bm-notif" data-id="${o(e.id)}">${notifInnerHTML(e)}</li>`}function paintNotifications(){var t=C.querySelector('[data-part="notifications"]'),a=t.querySelector(".bm-notifs"),i=t.querySelector(".bm-foot"),s=x.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?a.innerHTML=L:s.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?a.innerHTML=s.items.map(notificationHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,i.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){x.notifications.type=t,C.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var a=x.notifications,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&n(t,!0),a.loading=!0,paintNotifications(),`?type=${encodeURIComponent(a.type)}&cursor=`+a.cursor),t=await api("/api/admin/notifications"+e);a.loading=!1,a.error=!t.ok,t.ok&&t.data&&(a.items=a.items.concat(t.data.items||[]),a.more=null!=t.data.cursor,a.cursor=t.data.cursor||a.cursor),paintNotifications()}function startEdit(a){let i=x.notifications.items.find(e=>e.id===a.dataset.id);i&&!a.querySelector(".is-editing")&&morph(a,a.firstElementChild,()=>{a.innerHTML=(t=i,`
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
    </div>`);var t=a.querySelector(".bm-e-title");return t&&t.focus(),a.firstElementChild})}function cancelEdit(t){let e=x.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function deleteNotification(e,t){let a=e.dataset.id;n(t,!0);var i=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"DELETE"});n(t,!1),i.ok&&(x.notifications.items=x.notifications.items.filter(e=>e.id!==a),t=e,i=paintNotifications,M?i():(e=t.getBoundingClientRect().height,t.style.overflow="hidden",t.style.height=e+"px",t.style.transition=`height 280ms ${S}, opacity 130ms ease`,t.style.opacity="0",t.style.height="0px",setTimeout(i,k)))}let I=["","encrypted","draft","unpublished","pinned"];function renderPostsShell(a){var i=[["",t("p_all","All")],["encrypted",t("p_encrypted","Encrypted")],["draft",t("p_drafts","Drafts")],["unpublished",t("p_unpublished","Unpublished")],["pinned",t("p_sticky","Sticky")]];a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-newspaper" aria-hidden="true"></i>${e("p_title","Posts management")}
      <span class="bm-count bm-post-count"></span>
    </h2>
    <p class="bm-lede">${e("p_lede","Every article and album on the site, and what can be done with each. Nothing here is fetched — it was sealed into this page by the build.")}</p>

    <div class="bm-post-bar">
      <div class="bm-seg bm-post-filter" role="group">
        ${i.map(([e,t])=>`<button type="button" data-filter="${o(e)}"${e===x.posts.filter?' class="is-on"':""}>${o(t)}</button>`).join("")}
      </div>
      ${canCommit()?`<span class="bm-make">
               <a class="bm-write" href="${o(h()+"/blog-management/write/")}">
                 <i class="fa-solid fa-feather-pointed" aria-hidden="true"></i>
                 <span>${e("p_new","New post")}</span>
               </a>
               <a class="bm-write bm-write-album" href="${o(h()+"/blog-management/masonry/")}">
                 <i class="fa-solid fa-images" aria-hidden="true"></i>
                 <span>${e("p_new_album","New album")}</span>
               </a>
             </span>`:""}
    </div>

    <ul class="bm-post-list"></ul>`}function canGrant(e){return!!(x.me.admin&&e.published&&e.encrypted&&e.vaultId)}function canAssign(e){return!(!x.me.admin||!e.vaultId)}function postRowHTML(a){var i=a.date?new Date(a.date):null,s=(x.posts.audiences[a.vaultId]||[]).length,n=canGrant(a),l=[],r=(i&&l.push(`<span><i class="fa-solid fa-calendars"></i>${i.toISOString().slice(0,10)}</span>`),(a.categories||[]).length&&l.push(`<span><i class="fa-solid fa-folders"></i>${o(a.categories.join(" / "))}</span>`),(a.tags||[]).length&&l.push(`<span><i class="fa-solid fa-tags"></i>${o(a.tags.join(", "))}</span>`),a.slug&&l.push(`<span class="bm-post-slug"><i class="fa-solid fa-link"></i>${o(a.slug)}</span>`),i=[],(r=a).sticky&&i.push(["sticky","fa-thumbtack",t("p_sticky","Sticky")]),"album"===r.kind&&i.push(["album","fa-images",t("p_album","Album")]),r.encrypted&&i.push(["encrypted","fa-lock-keyhole",t("v_badge","Encrypted")]),r.draft&&i.push(["draft","fa-pen-nib",t("p_draft","Draft")]),r.published||i.push(["unpublished","fa-eye-slash",t("p_unpublished_tag","Unpublished")]),i.map(([e,t,a])=>`<span class="bm-bubble is-${e}"><i class="fa-regular ${t}" aria-hidden="true"></i>${o(a)}</span>`).join("")),i=n?`<span class="bm-bubble is-readers" data-empty="${s?"0":"1"}">
         <i class="fa-regular fa-user-lock" aria-hidden="true"></i>
         ${x.posts.loading?'<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>':`<strong>${s}</strong>`+o(t(1===s?"v_reader":"v_readers","readers"))}</span>`:"",s=x.posts.queue.includes(a.key),d=canCommit()?`<a class="bm-quiet bm-post-edit" href="${o((e=>(e=e.href)+(e.indexOf("#")<0?"#edit":""))(a))}">
         <i class="fa-solid fa-pen" aria-hidden="true"></i>
         <span class="np-btn-label">${e("edit","Edit")}</span></a>
       `+(a.published?`<button type="button" class="bm-quiet bm-danger bm-post-unpublish${s?" is-on":""}">
                <i class="fa-solid ${s?"fa-check":"fa-eye-slash"}" aria-hidden="true"></i>
                <span class="np-btn-label">${s?e("p_unpub_queued","Queued"):e("p_unpublish","Unpublish")}</span></button>`:""):"";return`
    <li class="bm-post${a.encrypted?" is-encrypted":""}${a.draft?" is-draft":""}${s?" is-queued":""}" data-key="${o(a.key)}">
      <div class="bm-post-main">
        <div class="bm-post-title">
          <i class="fa-solid ${"album"===a.kind?"fa-images":a.encrypted?"fa-lock-keyhole":"fa-file-lines"}" aria-hidden="true"></i>
          <a href="${o(a.href)}">${o(a.title||t("p_untitled","Untitled"))}</a>
        </div>
        <div class="bm-post-meta">${l.join("")}</div>
        ${a.excerpt?`<p class="bm-post-excerpt">${o(a.excerpt)}</p>`:""}
      </div>

      <div class="bm-post-side">
        <div class="bm-bubbles">${r}${i}</div>
        <div class="bm-post-actions">${d}</div>
      </div>

      ${n?`<div class="bm-post-audience">
               <label class="bm-blocklist-label">
                 ${e("v_audience","Who can read this")}
                 <span class="bm-save-state" data-save="vault:${o(a.vaultId)}"></span>
               </label>
               <div class="bm-picker-host" data-picker="vault:${o(a.vaultId)}"></div>
             </div>`:""}
      ${canAssign(a)?`<div class="bm-post-audience">
               <label class="bm-blocklist-label">
                 ${e("v_editors","Who can edit this")}
                 <span class="bm-save-state" data-save="edit:${o(a.vaultId)}"></span>
               </label>
               <div class="bm-picker-host" data-picker="edit:${o(a.vaultId)}"></div>
             </div>`:""}
    </li>`}function paintPosts(){let o=C.querySelector('[data-part="posts"]');if(o){let a=o.querySelector(".bm-post-list"),n=x.posts,i=n.items.filter(e=>{return e=e,!((t=n.filter)&&("encrypted"===t?!e.encrypted:"draft"===t?!e.draft:"unpublished"===t?e.published:"pinned"===t&&!e.sticky));var t});o.querySelector(".bm-post-count").textContent=i.length||"",i.length?a.innerHTML=i.map(postRowHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("p_empty","Nothing matches this filter.")}</li>`;for(let s of i){if(canGrant(s)){let a="vault:"+s.vaultId,i=o.querySelector(`[data-picker="${CSS.escape(a)}"]`);if(i){let e=makePicker(a,i,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveAudience(s.vaultId,e)});e.set(n.audiences[s.vaultId]||[]),E.set(a,e)}}if(canAssign(s)){let a="edit:"+s.vaultId,i=o.querySelector(`[data-picker="${CSS.escape(a)}"]`);if(i){let e=makePicker(a,i,{placeholder:t("ed_placeholder","Collaborator login or numeric id, then Enter"),onCommit:e=>saveEditors(s.vaultId,e)});e.set(n.editors[s.vaultId]||[]),E.set(a,e)}}}contentChanged()}}async function loadAudiences(){if(x.me.admin){x.posts.loading=!0;var[t,a]=await Promise.all([api("/api/admin/vault"),api("/api/admin/collab")]);if(x.posts.loading=!1,t.ok&&t.data&&(x.posts.audiences=t.data.audiences||{}),a.ok&&a.data){x.posts.editors=a.data.editors||{},x.collab.people=a.data.people||[],x.me.grades=a.data.grades||x.me.grades;{let s=C.querySelector('[data-part="collab"]');if(s){let t=s.querySelector(".bm-collab-list"),a=new Map(x.collab.people.map(e=>[String(e.id),e])),i=(x.collab.roster||[]).map(e=>{var t=a.get(String(e.id));return{id:e.id,login:e.username||t&&t.login||"",name:e.name||"",panels:t&&t.panels||{}}});for(let[t,e]of a)i.some(e=>String(e.id)===t)||i.push({id:e.id,login:e.login,name:"",panels:e.panels||{}});s.querySelector(".bm-collab-count").textContent=i.length||"",t.innerHTML=i.length?`<ul class="bm-list">${i.map(collabRowHTML).join("")}</ul>`:`<p class="bm-blank">${e("c_empty","No collaborators are configured. Add them to backend.collaborators and to the Worker's COLLABORATORS, then rebuild.")}</p>`,contentChanged()}}}paintPosts()}}async function saveEditors(e,t){let a=C.querySelector(`[data-save="${CSS.escape("edit:"+e)}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),t=t.entries,i=await api(`/api/admin/vault/${encodeURIComponent(e)}/editors`,{method:"PUT",body:{editors:t}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(x.posts.editors[e]=t)):a&&(a.innerHTML="")}async function saveAudience(e,t){let a=C.querySelector(`[data-save="${CSS.escape("vault:"+e)}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),t=t.entries,i=await api(`/api/admin/vault/${encodeURIComponent(e)}/audience`,{method:"PUT",body:{audience:t}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(x.posts.audiences[e]=t,e=(i=C.querySelector(`[data-picker="${CSS.escape("vault:"+e)}"]`))&&i.closest(".bm-post").querySelector(".bm-bubble.is-readers"))&&(e.querySelector("strong").textContent=t.length,e.dataset.empty=t.length?"0":"1")):a&&(a.innerHTML="")}let N=[["committed","fa-code-commit","Committed"],["building","fa-hammer","Building"],["pushed","fa-upload","Artifact pushed"],["deployed","fa-globe","Deployed"]],A={gitea:"fa-solid fa-server",github:"fa-brands fa-github"},P=null,B=null,j=null;function loadRepo(){return P=P||import("./editor/repo.js")}async function holdCredentials(e){var t=await(B=B||import("./editor/credentials.js"));e?t.hold():t.release()}function rowEl(e){return C.querySelector(`.bm-post[data-key="${CSS.escape(e)}"]`)}function toggleUnpublish(a){var i,s=x.posts;s.busy||(a=a.dataset.key,(i=s.queue.indexOf(a))<0?s.queue.push(a):s.queue.splice(i,1),paintPosts(),(s.queue.length?()=>{let i=x.posts,a=!i.bar;if(a){let a=document.createElement("div");a.className="ed-docbar bm-unpub",a.innerHTML=`
      <div class="ed-docbar-id">
        <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>
        <span class="bm-unpub-count"></span>
      </div>
      <div class="ed-docbar-actions">
        <button type="button" class="ed-act ed-backend bm-unpub-backend" hidden></button>
        <span class="ed-dot" data-state="dirty"></span>
        <button type="button" class="ed-act ed-act-primary bm-unpub-go">
          <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          <span>${e("p_unpub_go","Save & publish")}</span>
        </button>
        <button type="button" class="ed-act ed-close bm-unpub-x" title="${o(t("p_unpub_cancel","Cancel"))}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <div class="ed-progress">${N.map(([e,a,i])=>`<span class="ed-stage" data-key="${e}" data-state="wait">
         <i class="fa-solid ${a}" aria-hidden="true"></i>${o(t("p_s_"+e,i))}
       </span>`).join("")}</div>
      <div class="ed-notice" hidden></div>`,C.insertBefore(a,C.querySelector(".bm-console")),i.bar=a,holdCredentials(!0),a.querySelector(".bm-unpub-x").addEventListener("click",()=>closeBar()),a.querySelector(".bm-unpub-go").addEventListener("click",()=>(async()=>{var s=x.posts;if(!s.busy&&s.queue.length){var o=(()=>{let t=new Set(x.posts.queue);return x.posts.items.filter(e=>t.has(e.key))})();if(o.length){let a=s.bar,i=a.querySelector(".bm-unpub-go");s.busy=!0,C.classList.add("is-unpublishing"),n(i,!0),a.querySelector(".ed-dot").dataset.state="busy",barNotice(null,"");for(let e of o)rowEl(e.key)?.classList.add("is-working");try{let[e,a]=await Promise.all([loadRepo(),import("./editor/session.js")]),i=(await e.open(!0),await a.unpublishAll(o));if(!i)throw new Error(t("p_unpub_empty","There was nothing to commit."));markStage("committed","done"),barNotice("info",(t("p_unpub_done","Committed")+" "+(i.short||"")).trim());for(let e of o)e.published=!1,"album"!==e.kind&&(e.encrypted=!1),e.draft=e.draft||{id:"",slug:e.slug||"",href:e.href,source:e.source},"album"!==e.kind&&(e.vaultId="");s.queue=[],paintPosts();{var l=i.sha;clearInterval(j),markStage("building","live");let a=0;j=setInterval(async()=>{if(100<(a+=1))return clearInterval(j);var e=await(await loadRepo()).commitStatus(l);e&&e.count&&("pending"!==e.state?"success"===e.state?(clearInterval(j),markStage("building","done"),markStage("pushed","done"),markStage("deployed","live"),setTimeout(()=>{markStage("deployed","done"),barNotice("info",t("p_unpub_land","Done. Loading the site as readers see it…")),setTimeout(()=>window.location.assign(h()+"/blog-management/"),1200)},2e4)):"failure"!==e.state&&"error"!==e.state||(clearInterval(j),markStage("building","fail"),barNotice("error",t("p_unpub_failed","The build failed. The commit landed; nothing published has changed.")),x.posts.busy=!1,C.classList.remove("is-unpublishing")):markStage("building","live"))},6e3);return}}catch(e){markStage("committed","fail"),barNotice("error",e&&e.message||t("offline","The Worker did not answer.")),s.busy=!1,C.classList.remove("is-unpublishing"),n(i,!1),a.querySelector(".ed-dot").dataset.state="dirty";for(let e of o)rowEl(e.key)?.classList.remove("is-working")}}else closeBar()}})()),a.querySelector(".bm-unpub-backend").addEventListener("click",()=>(async()=>{var s=x.posts.bar;if(s&&!x.posts.busy){let e=s.querySelector(".bm-unpub-backend"),a=await loadRepo(),i=a.backends().find(e=>e.id!==a.activeId());if(i){e.disabled=!0;try{await a.use(i.id),await paintBackend()}catch(s){barNotice("error",t("unreachable","Couldn't reach the backend."))}finally{e.disabled=!1}}}})())}var s=i.queue.length;i.bar.querySelector(".bm-unpub-count").textContent=s+" "+t(1===s?"p_unpub_one":"p_unpub_many",1===s?"post to withdraw":"posts to withdraw"),a&&(y(i.bar),paintBackend()),contentChanged()}:closeBar)())}function markStage(e,t){var a=x.posts.bar,a=a&&a.querySelector(`.ed-stage[data-key="${e}"]`);a&&a.dataset.state!==t&&(a.dataset.state=t,$(a))}function barNotice(e,t){var a,i=x.posts.bar;i&&(i=i.querySelector(".ed-notice"),t?(a="error"===e?"fa-circle-exclamation":"warn"===e?"fa-triangle-exclamation":"fa-circle-info",i.hidden=!1,i.dataset.kind=e,i.innerHTML=`<i class="fa-solid ${a}" aria-hidden="true"></i><span>${o(t)}</span>`,$(i)):i.hidden=!0)}async function closeBar(){var e=x.posts,t=(clearInterval(j),e.queue=[],e.busy=!1,C.classList.remove("is-unpublishing"),e.bar);e.bar=null,paintPosts(),t&&(holdCredentials(!1),await v(t),t.remove(),contentChanged())}async function paintBackend(){var s=x.posts.bar;if(s){var n,l,r=s.querySelector(".bm-unpub-backend");let e;try{await(e=await loadRepo()).open(!1)}catch(s){return void(r.hidden=!0)}let a=e.backends(),i=e.activeId();!i||a.length<2?r.hidden=!0:(n=a.find(e=>e.id===i),l=a.find(e=>e.id!==i),r.hidden=!1,r.dataset.backend=i,r.innerHTML=`<i class="${A[i]||A.gitea}" aria-hidden="true"></i><span>${o(n&&n.label||i)}</span>`,r.title=l?t("p_backend","Build on")+" "+(l.label||l.id):"")}}function renderFollowersShell(i){i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-users" aria-hidden="true"></i>${e("followers","Followers")}
      <span class="bm-count bm-follower-count"></span>
    </h2>

    <div class="bm-card bm-blocklists">
      <h3 class="bm-sub-title">${e("blocklists","Global blocklists")}</h3>
      <p class="bm-hint">${e("blocklists_hint","Anyone listed here is skipped for that kind of notification, silently and everywhere. Saved as soon as an entry resolves.")}</p>
      ${q.map(e=>`
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
    <div class="bm-orphans"></div>`,q.forEach(a=>{var e=i.querySelector(`[data-picker="${a}"]`);E.set(a,makePicker(a,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>(async(e,t)=>{let a=C.querySelector(`[data-save="${e}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),i=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(i=i.data&&i.data.users||[],(x.blocklists[e]=i).length!==t.ids.length)&&t.set(i)):a&&(a.innerHTML="")})(a,e)}))})}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function lockOn(e){var t;return e&&e.is_admin?"admin":(t=x.followers,e=e&&(null!=e.id?e.id:e.github_id),"collab"===t.role&&null!=t.me&&String(e)===String(t.me)?"you":"")}function moderationButtons(t,a,i,s){return"admin"===s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:"you"===s?`<span class="bm-tag is-you">${e("you","You")}</span>`:(s="banned"===i,`
    <button type="button" class="bm-quiet bm-mod${(i="muted"===i)?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${i?"":"muted"}">
      <i class="fa-solid ${i?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${i?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${s?"":"banned"}">
      <i class="fa-solid ${s?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,a){var s=l(e);return`
    <li class="bm-device" data-device="${o(e.id)}">
      <span class="bm-device-icon"><i class="${s.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${o(s.browser)}<span class="bm-sep"></span>${o(s.os)}<span class="bm-sep"></span>${o(s.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${o(t("subscribed","Subscribed")+" "+i(e.created_at))}<span class="bm-sep"></span>…${o(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,a)}</div>
    </li>`}function followerHTML(a){let s=lockOn(a),n=String(a.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),l=["#"+a.id,t("subscribed","Subscribed")+" "+i(a.created_at),a.devices.length+" "+t("m_devices","devices"),a.unread+" "+t("m_unread","unread"),n.length?t("m_blocked","Blocked")+": "+n.join(", "):""].filter(Boolean);return`
    <li class="bm-follower${a.state?" is-"+a.state:""}" data-follower="${o(a.id)}">
      <div class="bm-follower-head">
        <img class="bm-avatar" src="${d(a.id)}" alt="" loading="lazy">
        <div class="bm-follower-main">
          <div class="bm-follower-name">
            ${o(a.name||a.login)}
            <a class="bm-login" href="https://github.com/${encodeURIComponent(a.login)}"
               target="_blank" rel="noopener">@${o(a.login)}</a>
            ${a.is_collab?`<span class="bm-tag is-collab">${e("collab","Collaborator")}</span>`:""}
            ${stateTag(a.state)}
          </div>
          <div class="bm-follower-meta">${l.map(e=>`<span>${o(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",a.id,a.state,s)}
        </div>
      </div>
      ${a.devices.length?`<ul class="bm-devices">${a.devices.map(e=>deviceHTML(e,s)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var a=C.querySelector('[data-part="followers"]'),i=a.querySelector(".bm-followers"),s=a.querySelector(".bm-foot"),n=x.followers;n.totals&&(a.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),a.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?i.innerHTML=L:n.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?i.innerHTML=n.items.map(followerHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",a.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,lockOn(e))).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var i=x.followers,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&n(t,!0),i.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+i.cursor));if(i.loading=!1,i.error=!e.ok,e.ok&&e.data){let a=e.data;null!=a.me&&(i.me=a.me),a.role&&(i.role=a.role),i.items=i.items.concat(a.items||[]),i.more=null!=a.cursor,i.cursor=a.cursor||i.cursor,a.orphans&&(i.orphans=a.orphans),a.totals&&(i.totals=a.totals),a.blocklists&&(x.blocklists=a.blocklists,q.forEach(e=>{var t=E.get(e);t&&t.set(a.blocklists[e]||[])}))}paintFollowers()}function wire(){C.addEventListener("click",e=>{var i,e=e.target,o=e.closest(".bm-seg [data-mode]");if(o)return i=o.dataset.mode,x.compose.mode=i,(o=C.querySelector('[data-part="announce"]')).querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===i)}),o.querySelector('[data-picker="audience"]').hidden="all"===i,o.querySelector(".bm-audience-hint").textContent="all"===i?t("aud_all_hint","Every follower receives this."):"users"===i?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),void syncCompose();o=e.closest(".bm-notif-filter [data-type]");if(o)setFilter(o.dataset.type);else{var o=e.closest(".bm-post-filter [data-filter]");if(o)return o=o.dataset.filter,x.posts.filter=I.includes(o)?o:"",C.querySelectorAll(".bm-post-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.filter===x.posts.filter)}),void paintPosts();o=e.closest(".bm-send");if(o)send(o);else{o=e.closest(".bm-more");if(o)("followers"===o.dataset.more?loadFollowers:loadNotifications)({trigger:o});else{o=e.closest(".bm-edit");if(o)startEdit(o.closest(".bm-notif"));else{o=e.closest(".bm-cancel");if(o)cancelEdit(o.closest(".bm-notif"));else{o=e.closest(".bm-save");if(o)(async(e,t)=>{let a=e.dataset.id,i=x.notifications.items.find(e=>e.id===a);var s,o,l,r;i&&(s=e.querySelector(".bm-e-title").value.trim(),o=e.querySelector(".bm-e-body").value.trim(),l=e.querySelector(".bm-e-url").value.trim(),s)&&(n(t,!0),r=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"PUT",body:{title:s,body:o,url:l}}),n(t,!1),r.ok?(i.title=s,i.body=o,l&&(i.url=l),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))})(o.closest(".bm-notif"),o);else{o=e.closest(".bm-del");if(o){let e=o.closest(".bm-notif");void(a(o,"del:"+e.dataset.id,"")&&deleteNotification(e,o))}else{o=e.closest(".bm-mod");if(o){let e=`mod:${o.dataset.scope}:${o.dataset.target}:`+o.dataset.next;void(a(o,e,t("confirm","Press again"))&&(async a=>{let e=a.dataset.scope,i=a.dataset.target,s=a.dataset.next;n(a,!0);var t=await api("/api/admin/moderation",{method:"PUT",body:"device"===e?{device_id:Number(i),state:s}:{github_id:Number(i),state:s}});if(n(a,!1),t.ok){a=x.followers;if("follower"===e){let e=a.items.find(e=>String(e.id)===String(i));e&&(e.state=s)}else{for(let t of a.items){let e=t.devices.find(e=>String(e.id)===String(i));e&&(e.state=s)}let e=a.orphans.find(e=>String(e.id)===String(i));e&&(e.state=s)}paintFollowers()}})(o))}else{o=e.closest(".bm-grade");o&&!o.disabled?(async a=>{let o=a.closest(".bm-collab");if(o){let t=o.dataset.id,i=a.dataset.panel,s=a.dataset.grade,n={};for(let a of o.querySelectorAll(".bm-collab-cell")){let e=a.querySelector(".bm-grade.is-on"),t=a.querySelector(".bm-grade").dataset.panel;U[t]||(n[t]=t===i?s:e&&e.dataset.grade||"")}for(let e of a.parentElement.querySelectorAll(".bm-grade"))e.classList.toggle("is-on",e===a);let e=o.querySelector(`[data-save="${CSS.escape("collab:"+t)}"]`);e&&(e.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>');var l,r=(o.querySelector(".bm-collab-login").textContent||"").replace(/^@/,""),d=await api("/api/admin/collab/"+encodeURIComponent(t),{method:"PUT",body:{login:r,panels:n}});e&&(e.innerHTML=d.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',d.ok)&&setTimeout(()=>e.innerHTML="",1800),d.ok&&((l=x.collab.people.find(e=>String(e.id)===String(t)))?l.panels=d.data.panels||n:x.collab.people.push({id:Number(t),login:r,panels:d.data.panels||n}))}})(o):(o=e.closest(".bm-post-unpublish"))?toggleUnpublish(o.closest(".bm-post")):s()}}}}}}}}})}let R=[["posts","fa-newspaper","Posts management"],["analytics","fa-chart-simple","Analytics"],["announce","fa-bullhorn","Announce"],["notifications","fa-bell","Notifications"],["followers","fa-users","Followers"],["buildlog","fa-terminal","Build log"]],O=[["","fa-ban","Denied"],["r","fa-eye","Read"],["rw","fa-pen-to-square","Read & write"]],U={posts:"rw"};function collabRowHTML(s){var e=R.map(([n,e,a])=>{let l=x.me.grades&&x.me.grades[n]||["","r","rw"],r=U[n],d=r||s.panels[n]||"",i=O.map(([e,a,i])=>{var s=!!r||!l.includes(e);return`<button type="button" class="bm-grade${d===e?" is-on":""}"
        data-grade="${o(e)}" data-panel="${o(n)}"
        ${s?"disabled":""} title="${o(t("g_"+(e||"none"),i))}">
        <i class="fa-solid ${a}" aria-hidden="true"></i></button>`}).join("");return`<div class="bm-collab-cell">
        <span class="bm-collab-panel"><i class="fa-solid ${e}" aria-hidden="true"></i>${o(t("part_"+n,a))}</span>
        <span class="bm-seg bm-collab-grades">${i}</span>
      </div>`}).join("");return`<li class="bm-collab" data-id="${o(String(s.id))}">
      <div class="bm-collab-head">
        <img class="bm-collab-avatar" alt="" loading="lazy"
             src="https://avatars.githubusercontent.com/u/${o(String(s.id))}?s=64">
        <span class="bm-collab-name">${o(s.name||s.login||s.id)}</span>
        <span class="bm-collab-login">@${o(s.login||s.id)}</span>
        <span class="bm-save-state" data-save="collab:${o(String(s.id))}"></span>
      </div>
      <div class="bm-collab-grid">${e}</div>
    </li>`}function paintLog(){var a=C.querySelector('[data-part="buildlog"]');if(a){var i,s=a.querySelector(".bm-log-body"),a=a.querySelector(".bm-log-when"),n=x.log.record;if(!x.log.loading)return n?(i=n.status&&"success"!==n.status,a.textContent=String(n.at||"").replace("T"," ").slice(0,16),s.innerHTML=`
    <div class="bm-log-head">
      <span class="bm-bubble is-${i?"danger":"ok"}">
        <i class="fa-regular ${i?"fa-circle-xmark":"fa-circle-check"}" aria-hidden="true"></i>
        ${o(i?t("l_failed","Failed"):t("l_ok","Succeeded"))}
      </span>
      ${n.reason?`<span class="bm-bubble"><i class="fa-regular fa-play"></i>${o(n.reason)}</span>`:""}
      ${n.sha?`<span class="bm-bubble"><i class="fa-regular fa-code-commit"></i>${o(n.sha)}</span>`:""}
    </div>
    <pre class="bm-log-text"><code>${o(n.text||"")}</code></pre>`,void contentChanged()):(a.textContent="",s.innerHTML=`<p class="bm-blank">${e("l_empty","No build has written a log yet.")}</p>`,contentChanged())}}async function boot(){var a,i,s,n;await!((s=await api("/api/editor/session")).ok&&s.data&&(x.me={admin:x.me.admin||!!s.data.admin,panels:s.data.panels||{},grades:s.data.grades||{},id:s.data.id||0,login:s.data.login||""},x.followers.me=x.me.id,x.followers.role=x.me.admin?"admin":"collaborator"));let l={posts:C.querySelector('[data-part="posts"]'),analytics:C.querySelector('[data-part="analytics"]'),announce:C.querySelector('[data-part="announce"]'),notifications:C.querySelector('[data-part="notifications"]'),followers:C.querySelector('[data-part="followers"]'),collab:C.querySelector('[data-part="collab"]'),buildlog:C.querySelector('[data-part="buildlog"]')},d=e=>x.me.admin?"rw":x.me.panels[e]||"",c={posts:!0,analytics:!!d("analytics"),announce:!!d("announce"),notifications:!!d("notifications"),followers:!!d("followers"),collab:x.me.admin,buildlog:!!d("buildlog")};for([a,i]of Object.entries(l))if(i&&!c[a]){i.remove(),l[a]=null;let e=C.parentElement&&C.parentElement.querySelector(`a[href="#bm-${a}"]`);e&&e.closest(".nav-item")&&e.closest(".nav-item").remove()}l.posts&&(renderPostsShell(l.posts),paintPosts()),l.analytics&&r(l.analytics,C,t),l.announce&&((s=l.announce).innerHTML=`
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

    <div class="bm-receipt" hidden></div>`,n=s.querySelector('[data-picker="audience"]'),E.set("audience",makePicker("audience",n,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),s.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose()),l.notifications&&(n=l.notifications,s=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]],n.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${s.map(([e,t])=>`<button type="button" data-type="${o(e)}"${e===x.notifications.type?' class="is-on"':""}>${o(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`),l.followers&&renderFollowersShell(l.followers),l.collab&&(l.collab.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-user-shield" aria-hidden="true"></i>${e("c_title","Collaborators")}
      <span class="bm-count bm-collab-count"></span>
    </h2>
    <p class="bm-lede">${e("c_lede","What each collaborator sees in this console. Posts management is always theirs and always scoped to the items they were given; everything else starts denied.")}</p>
    <div class="bm-collab-list">${L}</div>`),l.buildlog&&(l.buildlog.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-terminal" aria-hidden="true"></i>${e("l_title","Build log")}
      <span class="bm-count bm-log-when"></span>
    </h2>
    <p class="bm-lede">${e("l_lede","What the last deploy actually did. The runner prints nothing in public — this is where its output goes, sealed, and it is written even when the build failed.")}</p>
    <div class="bm-log-body">${L}</div>`),l.posts&&loadAudiences(),l.notifications&&loadNotifications({reset:!0}),l.followers&&loadFollowers({reset:!0}),l.buildlog&&(async()=>{x.log.loading=!0,paintLog();try{var e=await api("/api/editor/keys",{method:"POST",body:{}}),t=(e.data&&e.data.items||[]).find(e=>"log"===e.kind);if(!t)throw new Error("no key");var a=await p(`${g()}/${t.slug}/log.bin`);x.log.record=a?JSON.parse(await f(await m(u(t.key)),a)):null}catch(e){x.log.record=null}x.log.loading=!1,paintLog()})()}function canCommit(){var e=window.theme&&window.theme.backend||{};return!(!e.online_editor||!e.online_editor.enable)}async function initBlogManagement(e,t){var a=document.getElementById("blog-management");a&&(C=a,E.clear(),x.me={admin:!(!t||!t.admin),panels:{},grades:{},id:0,login:""},x.compose.mode="all",x.notifications.type="",x.notifications.loading=!1,x.followers.loading=!1,x.posts.items=e&&e.items||[],x.posts.audiences={},x.posts.editors={},x.collab.roster=(window.theme&&window.theme.backend||{}).collaborators||[],x.log.record=null,x.posts.filter="",x.posts.queue=[],x.posts.bar=null,x.posts.busy=!1,clearInterval(j),M=window.matchMedia("(prefers-reduced-motion: reduce)").matches,a=window.theme&&window.theme.backend||{},H=window.blogAuth?window.blogAuth.resolveApiBase():String(a.api_url||"").replace(/\/+$/,""),wire(),await boot(),!e)&&C.querySelector('[data-part="posts"]')&&(x.posts.items=(t=((t=await api("/api/editor/keys",{method:"POST",body:{}})).data&&t.data.items||[]).filter(e=>"post"===e.kind||"album"===e.kind),await(await Promise.all(t.map(async e=>{try{var t,a=await p(`${g()}/${e.slug}/r.bin`);return a?{...t=await b(await m(u(e.key)),a),vaultId:t.vaultId||e.id,slug:t.slug||e.slug}:null}catch(e){return null}}))).filter(Boolean)),paintPosts())}export{initBlogManagement};