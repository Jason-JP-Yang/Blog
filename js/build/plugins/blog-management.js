import{setBusy as n,confirmStep as a,disarmConfirm as i,timeAgo as s,escapeHTML as o,describeDevice as l}from"./notifications-inbox.js";import{Picker as r,avatarOf as c}from"../tools/chipPicker.js";import{b64urlToBytes as d,importAesKey as u,openJSON as m,fetchSealed as p,vaultPrefix as b,siteRoot as f}from"../tools/vaultCrypto.js";let h=130,v=280,y="cubic-bezier(0.32, 0.72, 0, 1)",g="blur(3px)",$=["posts","notes","announcements"],w={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},k='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>';function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,a){return o(t(e,a))}let S=null,_="",T=!1,L={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},vault:{items:[],offset:0,more:!1,error:!1,loading:!1,keys:null},blocklists:{posts:[],notes:[],announcements:[]}},q=new Map;async function api(e,t={},a=!0){var i=await(async()=>{if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}})();if(!i)return{ok:!1,status:401,data:null};i={method:t.method||"GET",headers:{Authorization:"Bearer "+i}};let s;void 0!==t.body&&(i.headers["Content-Type"]="application/json",i.body=JSON.stringify(t.body));try{s=await fetch(_+e,i)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&a&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if(T)t();else{let i=e.getBoundingClientRect().height;e.style.transition="opacity 130ms ease, filter 130ms ease",e.style.opacity="0",e.style.filter=g,setTimeout(()=>{if(s.isConnected){let a=t()||s.firstElementChild;if(a){a.style.transition="none",a.style.opacity="0",a.style.filter=g;var e=a.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=i+"px",s.style.transition="height 280ms "+y,s.style.height=e+"px",a.style.transition="opacity 196ms ease, filter 196ms ease",a.style.opacity="1",a.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",a.style.transition="",a.style.filter="",contentChanged())};s.addEventListener("transitionend",t)}}},h)}}async function lookupIdentity(e){e=await api("/api/admin/lookup",{method:"POST",body:{ids:[e]}});return{ok:e.ok,matched:e.data&&e.data.matched||[]}}function makePicker(e,a,i){return new r(e,a,{...i,lookup:lookupIdentity,t:t})}function syncCompose(){var e,t,a,i,s,n=S.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),a=n.querySelector(".bm-c-url"),i=n.querySelector(".bm-post"),s=q.get("audience"),e)&&i&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==L.compose.mode)||s&&s.settled&&0<s.ids.length,i.disabled=!e.value.trim()||!a.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(a){var i=S.querySelector('[data-part="announce"]'),s=i.querySelector(".bm-c-title").value.trim(),l=i.querySelector(".bm-c-body").value.trim(),r=i.querySelector(".bm-c-url").value.trim(),d=L.compose.mode,c=q.get("audience"),u=(n(a,!0),"all"===d?{kind:"all"}:{kind:d,users:c?c.ids:[]}),s=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(s),type:"announcement",topic:"announcements",title:s,body:l,url:r,tag:"announcements",audience:u}});n(a,!1),((i,s,{mode:a,audience:n})=>{if(i.hidden=!1,!s.ok){let a=s.data&&(s.data.error||s.data.message)||(s.status?"HTTP "+s.status:t("offline","The Worker did not answer."));return i.className="bm-receipt is-bad",i.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${o(a)}</p>`}var l=((s=s.data||{}).counts||[])[0]||{},r=s.audience&&s.audience.matched||[],d=s.audience&&s.audience.unknown||[],l=[[t("r_id","Id"),s.ingested&&s.ingested[0]],[t("r_recipients","Inboxes written"),l.recipients],[t("r_devices","Push devices"),l.devices],[t("r_messages","Queue messages"),l.messages],[t("r_audience","Audience"),"all"===a?t("aud_all","Everyone"):`${"users"===a?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]];r.length&&l.push([t("r_matched","Matched"),r.map(e=>e.login+" #"+e.id).join(", ")]),d.length&&l.push([t("r_ignored","Ignored"),d.join(", ")]),(s.skipped||[]).length&&l.push([t("r_skipped","Already sent"),s.skipped.join(", ")]),s.absorbed&&l.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),i.className="bm-receipt is-good",i.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${l.map(([e,t])=>`<dt>${o(e)}</dt><dd>${o(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`})(i.querySelector(".bm-receipt"),s,{mode:d,audience:u}),s.ok&&(i.querySelector(".bm-c-title").value="",i.querySelector(".bm-c-body").value="",i.querySelector(".bm-c-url").value="",c&&c.clear(),syncCompose(),setFilter(""))}function notifInnerHTML(a){let i="";try{let e=JSON.parse(a.audience_json||"{}");i="users"===e.kind?t("aud_only","Only these")+" "+(e.users||[]).length:"except"===e.kind?t("aud_except","Everyone except")+" "+(e.users||[]).length:"all"===e.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}let n=[a.id,a.type,a.topic,a.source,a.recipients+" "+t("m_inboxes","inboxes"),a.devices+" "+t("m_devices","devices"),i,s(a.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${w[a.type]||"fa-bell"}" aria-hidden="true"></i>
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
      </div>`}function notificationHTML(e){return`<li class="bm-notif" data-id="${o(e.id)}">${notifInnerHTML(e)}</li>`}function paintNotifications(){var t=S.querySelector('[data-part="notifications"]'),a=t.querySelector(".bm-notifs"),i=t.querySelector(".bm-foot"),s=L.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?a.innerHTML=k:s.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?a.innerHTML=s.items.map(notificationHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,i.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){L.notifications.type=t,S.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var a=L.notifications,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&n(t,!0),a.loading=!0,paintNotifications(),`?type=${encodeURIComponent(a.type)}&cursor=`+a.cursor),t=await api("/api/admin/notifications"+e);a.loading=!1,a.error=!t.ok,t.ok&&t.data&&(a.items=a.items.concat(t.data.items||[]),a.more=null!=t.data.cursor,a.cursor=t.data.cursor||a.cursor),paintNotifications()}function startEdit(a){let i=L.notifications.items.find(e=>e.id===a.dataset.id);i&&!a.querySelector(".is-editing")&&morph(a,a.firstElementChild,()=>{a.innerHTML=(t=i,`
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
    </div>`);var t=a.querySelector(".bm-e-title");return t&&t.focus(),a.firstElementChild})}function cancelEdit(t){let e=L.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}function collapseAway(e,t){var a;T?t():(a=e.getBoundingClientRect().height,e.style.overflow="hidden",e.style.height=a+"px",e.style.transition=`height 280ms ${y}, opacity 130ms ease`,e.style.opacity="0",e.style.height="0px",setTimeout(t,v))}function vaultRowHTML(a){var i=a.meta||{},s=i.date?new Date(i.date):null,n=a.audience.length;return`
    <li class="bm-vault" data-id="${o(a.id)}">
      <div class="bm-vault-main">
        <div class="bm-vault-title">
          <i class="fa-solid ${i.album?"fa-images":"fa-lock-keyhole"}" aria-hidden="true"></i>
          <a href="${o(b()+"/"+a.slug+"/")}" target="_blank" rel="noopener">
            ${o(i.title||t("v_unreadable","Unreadable — key does not match"))}
          </a>
        </div>
        <div class="bm-vault-meta">
          ${s?`<span><i class="fa-solid fa-calendars"></i>${s.toISOString().slice(0,10)}</span>`:""}
          ${i.category?`<span><i class="fa-solid fa-folders"></i>${o(i.category)}</span>`:""}
          ${(i.tags||[]).length?`<span><i class="fa-solid fa-tags"></i>${i.tags.map(o).join(", ")}</span>`:""}
          <span class="bm-vault-slug"><i class="fa-solid fa-link"></i>${o(a.slug)}</span>
        </div>
        ${i.excerpt?`<p class="bm-vault-excerpt">${o(i.excerpt)}…</p>`:""}
      </div>

      <div class="bm-vault-side">
        <div class="bm-vault-readers" data-empty="${n?"0":"1"}">
          <i class="fa-solid fa-user-lock" aria-hidden="true"></i>
          <strong>${n}</strong>
          <span>${o(t(1===n?"v_reader":"v_readers","readers"))}</span>
        </div>
        <button type="button" class="bm-quiet bm-danger bm-vault-revoke" title="${o(t("v_revoke_hint",""))}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
          <span class="np-btn-label">${e("v_revoke","Revoke")}</span>
        </button>
      </div>

      <div class="bm-vault-audience">
        <label class="bm-blocklist-label">
          ${e("v_audience","Who can read this")}
          <span class="bm-save-state" data-save="vault:${o(a.id)}"></span>
        </label>
        <div class="bm-picker-host" data-picker="vault:${o(a.id)}"></div>
      </div>
    </li>`}function paintVault(){var n,o=S.querySelector('[data-part="vault"]');if(o){let a=o.querySelector(".bm-vault-list"),i=o.querySelector(".bm-foot"),s=L.vault;o.querySelector(".bm-vault-count").textContent=s.items.length||"",o.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?a.innerHTML=k:s.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the service.")}</li>`:s.items.length?a.innerHTML=s.items.map(vaultRowHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("v_empty","No encrypted post has been activated yet.")}</li>`,i.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="vault">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"";for(let i of s.items){let e="vault:"+i.id,a=o.querySelector(`[data-picker="${CSS.escape(e)}"]`);a&&((n=makePicker(e,a,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveVaultAudience(i.id,e)})).set(i.audience),q.set(e,n))}contentChanged()}}async function loadVault({reset:t=!1,trigger:a=null}={}){let i=L.vault;t&&(i.items=[],i.offset=0,i.more=!1,i.keys=null),a&&n(a,!0),i.loading=!0,paintVault();var[t,a]=await Promise.all([api("/api/admin/vault?offset="+i.offset),i.keys?Promise.resolve(null):api("/api/vault/keys",{method:"POST",body:{}})]);if(i.loading=!1,i.error=!t.ok,a&&a.ok&&a.data&&(i.keys=new Map((a.data.posts||[]).map(e=>[e.id,e.key]))),t.ok&&t.data){let e=(t.data.posts||[]).map(e=>({...e,key:i.keys?.get(e.id)}));a=e.filter(e=>e.key),await Promise.all(a.map(async e=>{if(!e.meta){e.meta={};try{var t,a,i=await u(d(e.key)),s=await p(`${b()}/${e.slug}/c.bin`);s&&(a="album"===(t=(await m(i,s)).meta||{}).kind,e.meta={album:a,title:(a?t.name:t.title)||t.title||"",date:t.date||"",category:a?t.category||"":(t.categories||[]).map(e=>e.name).join(" / "),tags:(t.tags||[]).map(e=>e.name),excerpt:((a?t.description:t.excerpt)||"").slice(0,150)})}catch(e){}}})),i.items=i.items.concat(e),i.more=!!t.data.more,i.offset=i.items.length}paintVault()}async function saveVaultAudience(a,e){let t=S.querySelector(`[data-save="${CSS.escape("vault:"+a)}"]`);if(e.settled){t&&(t.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>');var i=e.entries,e=await api(`/api/admin/vault/${encodeURIComponent(a)}/audience`,{method:"PUT",body:{audience:i}});if(t&&(t.innerHTML=e.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',e.ok)&&setTimeout(()=>t.innerHTML="",1800),e.ok){let t=L.vault.items.find(e=>e.id===a);if(t){t.audience=i;let e=S.querySelector(`.bm-vault[data-id="${CSS.escape(a)}"] .bm-vault-readers`);e&&(e.querySelector("strong").textContent=i.length,e.dataset.empty=i.length?"0":"1")}}}else t&&(t.innerHTML="")}function renderFollowersShell(i){i.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-users" aria-hidden="true"></i>${e("followers","Followers")}
      <span class="bm-count bm-follower-count"></span>
    </h2>

    <div class="bm-card bm-blocklists">
      <h3 class="bm-sub-title">${e("blocklists","Global blocklists")}</h3>
      <p class="bm-hint">${e("blocklists_hint","Anyone listed here is skipped for that kind of notification, silently and everywhere. Saved as soon as an entry resolves.")}</p>
      ${$.map(e=>`
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
    <div class="bm-orphans"></div>`,$.forEach(a=>{var e=i.querySelector(`[data-picker="${a}"]`);q.set(a,makePicker(a,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>(async(e,t)=>{let a=S.querySelector(`[data-save="${e}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),i=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(L.blocklists[e]=t.ids)):a&&(a.innerHTML="")})(a,e)}))})}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,a,i,s){return s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(s="banned"===i,`
    <button type="button" class="bm-quiet bm-mod${(i="muted"===i)?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${i?"":"muted"}">
      <i class="fa-solid ${i?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${i?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${o(a)}" data-next="${s?"":"banned"}">
      <i class="fa-solid ${s?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,a){var i=l(e);return`
    <li class="bm-device" data-device="${o(e.id)}">
      <span class="bm-device-icon"><i class="${i.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${o(i.browser)}<span class="bm-sep"></span>${o(i.os)}<span class="bm-sep"></span>${o(i.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${o(t("subscribed","Subscribed")+" "+s(e.created_at))}<span class="bm-sep"></span>…${o(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,a)}</div>
    </li>`}function followerHTML(a){var i=String(a.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),i=["#"+a.id,t("subscribed","Subscribed")+" "+s(a.created_at),a.devices.length+" "+t("m_devices","devices"),a.unread+" "+t("m_unread","unread"),i.length?t("m_blocked","Blocked")+": "+i.join(", "):""].filter(Boolean);return`
    <li class="bm-follower${a.state?" is-"+a.state:""}" data-follower="${o(a.id)}">
      <div class="bm-follower-head">
        <img class="bm-avatar" src="${c(a.id)}" alt="" loading="lazy">
        <div class="bm-follower-main">
          <div class="bm-follower-name">
            ${o(a.name||a.login)}
            <a class="bm-login" href="https://github.com/${encodeURIComponent(a.login)}"
               target="_blank" rel="noopener">@${o(a.login)}</a>
            ${stateTag(a.state)}
          </div>
          <div class="bm-follower-meta">${i.map(e=>`<span>${o(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",a.id,a.state,a.is_admin)}
        </div>
      </div>
      ${a.devices.length?`<ul class="bm-devices">${a.devices.map(e=>deviceHTML(e,a.is_admin)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var a=S.querySelector('[data-part="followers"]'),i=a.querySelector(".bm-followers"),s=a.querySelector(".bm-foot"),n=L.followers;n.totals&&(a.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),a.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?i.innerHTML=k:n.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?i.innerHTML=n.items.map(followerHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",a.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var i=L.followers,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&n(t,!0),i.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+i.cursor));if(i.loading=!1,i.error=!e.ok,e.ok&&e.data){let a=e.data;i.items=i.items.concat(a.items||[]),i.more=null!=a.cursor,i.cursor=a.cursor||i.cursor,a.orphans&&(i.orphans=a.orphans),a.totals&&(i.totals=a.totals),a.blocklists&&(L.blocklists=a.blocklists,$.forEach(e=>{var t=q.get(e);t&&t.set(a.blocklists[e]||[])}))}paintFollowers()}function showGate(a){var i=S.querySelector(".bm-gate"),s=S.querySelector(".bm-console");"ready"===(S.dataset.phase=a)?(i.hidden=!0,s.hidden=!1,contentChanged()):(i.hidden=!1,s.hidden=!0,"loading"===a?i.innerHTML=`<div class="access-probe" role="status">
      <div class="access-probe-lock"><i class="fa-solid fa-lock-keyhole" aria-hidden="true"></i></div>
      <p class="access-probe-text">${o(t("checking","Checking your session…"))}</p>
      <div class="access-probe-bar"><span></span></div></div>`:(s={denied:["fa-lock",t("denied","This page is for the blog's administrator.")],error:["fa-plug-circle-xmark",t("unreachable","Couldn't reach the notification service.")]}[a],i.innerHTML=`<i class="fa-solid ${s[0]}" aria-hidden="true"></i>
    <p class="bm-gate-text">${o(s[1])}</p>
    <button type="button" class="bm-quiet bm-retry">
      <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      <span class="np-btn-label">${e("retry","Try again")}</span></button>`))}function wire(){S.addEventListener("click",e=>{var e=e.target,s=e.closest(".bm-retry");if(s)n(s,!0),boot(!0);else{var o,s=e.closest(".bm-seg [data-mode]");if(s)return o=s.dataset.mode,L.compose.mode=o,(s=S.querySelector('[data-part="announce"]')).querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===o)}),s.querySelector('[data-picker="audience"]').hidden="all"===o,s.querySelector(".bm-audience-hint").textContent="all"===o?t("aud_all_hint","Every follower receives this."):"users"===o?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),void syncCompose();s=e.closest(".bm-notif-filter [data-type]");if(s)setFilter(s.dataset.type);else{s=e.closest(".bm-post");if(s)send(s);else{s=e.closest(".bm-more");if(s)("followers"===s.dataset.more?loadFollowers:"vault"===s.dataset.more?loadVault:loadNotifications)({trigger:s});else{s=e.closest(".bm-vault-add");if(s)(async a=>{var i=(s=S.querySelector('[data-part="vault"]')).querySelector(".bm-vault-line"),s=s.querySelector(".bm-vault-add-state"),o=i.value.trim();if(o){let e;try{e=JSON.parse(o)}catch(e){return s.textContent=t("v_bad","That is not an activation line."),s.dataset.tone="bad"}n(a,!0);o=await api("/api/admin/vault",{method:"POST",body:{id:e.id,slug:e.slug,wrapped:e.wrapped}});n(a,!1),s.textContent=o.ok?t("v_added","Activated"):t("v_bad","That is not an activation line."),s.dataset.tone=o.ok?"ok":"bad",o.ok&&loadVault({reset:!(i.value="")})}})(s);else{s=e.closest(".bm-edit");if(s)startEdit(s.closest(".bm-notif"));else{s=e.closest(".bm-cancel");if(s)cancelEdit(s.closest(".bm-notif"));else{s=e.closest(".bm-save");if(s)(async(e,t)=>{let a=e.dataset.id,i=L.notifications.items.find(e=>e.id===a);var s,o,l,r;i&&(s=e.querySelector(".bm-e-title").value.trim(),o=e.querySelector(".bm-e-body").value.trim(),l=e.querySelector(".bm-e-url").value.trim(),s)&&(n(t,!0),r=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"PUT",body:{title:s,body:o,url:l}}),n(t,!1),r.ok?(i.title=s,i.body=o,l&&(i.url=l),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))})(s.closest(".bm-notif"),s);else{s=e.closest(".bm-del");if(s){let e=s.closest(".bm-notif");void(a(s,"del:"+e.dataset.id,"")&&(async(e,t)=>{let a=e.dataset.id;n(t,!0);var i=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"DELETE"});n(t,!1),i.ok&&(L.notifications.items=L.notifications.items.filter(e=>e.id!==a),collapseAway(e,paintNotifications))})(e,s))}else{s=e.closest(".bm-mod");if(s){let e=`mod:${s.dataset.scope}:${s.dataset.target}:`+s.dataset.next;void(a(s,e,t("confirm","Press again"))&&(async a=>{let e=a.dataset.scope,i=a.dataset.target,s=a.dataset.next;n(a,!0);var t=await api("/api/admin/moderation",{method:"PUT",body:"device"===e?{device_id:Number(i),state:s}:{github_id:Number(i),state:s}});if(n(a,!1),t.ok){a=L.followers;if("follower"===e){let e=a.items.find(e=>String(e.id)===String(i));e&&(e.state=s)}else{for(let t of a.items){let e=t.devices.find(e=>String(e.id)===String(i));e&&(e.state=s)}let e=a.orphans.find(e=>String(e.id)===String(i));e&&(e.state=s)}paintFollowers()}})(s))}else{s=e.closest(".bm-vault-revoke");if(s){let e=s.closest(".bm-vault");a(s,"vault:"+e.dataset.id,t("confirm","Press again"))&&(async(e,t)=>{let a=e.dataset.id;n(t,!0);var i=await api("/api/admin/vault/"+encodeURIComponent(a),{method:"DELETE"});n(t,!1),i.ok&&collapseAway(e,()=>{L.vault.items=L.vault.items.filter(e=>e.id!==a),q.delete("vault:"+a),paintVault()})})(e,s)}else i()}}}}}}}}}}})}async function boot(a=!1){showGate("loading"),a&&window.blogAuth&&await window.blogAuth.getSession(!0);var i,s,n,a=await api("/api/admin/notifications?cursor=0&type=");401===a.status||403===a.status?showGate("denied"):a.ok?(showGate("ready"),i={announce:S.querySelector('[data-part="announce"]'),notifications:S.querySelector('[data-part="notifications"]'),followers:S.querySelector('[data-part="followers"]'),vault:S.querySelector('[data-part="vault"]')},(s=i.announce).innerHTML=`
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

    <div class="bm-receipt" hidden></div>`,n=s.querySelector('[data-picker="audience"]'),q.set("audience",makePicker("audience",n,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),s.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose(),n=i.notifications,s=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]],n.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${s.map(([e,t])=>`<button type="button" data-type="${o(e)}"${e===L.notifications.type?' class="is-on"':""}>${o(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`,i.vault&&(i.vault.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-lock-keyhole" aria-hidden="true"></i>${e("v_title","Encrypted posts")}
      <span class="bm-count bm-vault-count"></span>
    </h2>
    <p class="bm-lede">${e("v_lede","Every encrypted post the site has published, and who may open it.")}</p>

    <div class="bm-card bm-vault-add-card">
      <h3 class="bm-sub-title">${e("v_add","Activate a post")}</h3>
      <p class="bm-hint">${e("v_add_hint","Paste one line from the build output.")}</p>
      <div class="bm-vault-add-row">
        <input type="text" class="bm-input bm-vault-line" spellcheck="false" autocomplete="off"
               placeholder='${o(t("v_paste",'{"id":"...","slug":"...","wrapped":"..."}'))}' />
        <button type="button" class="bm-primary bm-vault-add">
          <span class="np-btn-label">${e("v_activate","Activate")}</span>
        </button>
      </div>
      <p class="bm-vault-add-state" role="status"></p>
    </div>

    <ul class="bm-vault-list"></ul>
    <div class="bm-foot"></div>`),renderFollowersShell(i.followers),(n=L.notifications).items=a.data.items||[],n.more=null!=a.data.cursor,n.cursor=a.data.cursor||0,paintNotifications(),i.vault&&loadVault({reset:!0}),loadFollowers({reset:!0})):showGate("error")}function initBlogManagement(){var e=document.getElementById("blog-management");e&&(S=e,q.clear(),L.compose.mode="all",L.notifications.type="",L.notifications.loading=!1,L.followers.loading=!1,L.vault.loading=!1,T=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.theme&&window.theme.backend||{},(_=window.blogAuth?window.blogAuth.resolveApiBase():String(e.api_url||"").replace(/\/+$/,""))?(wire(),M||(M=!0,window.addEventListener("blog:auth-change",async()=>{var e;!document.getElementById("blog-management")||(e=window.blogAuth&&await window.blogAuth.getSession())&&e.token||location.replace(f()+"/")})),boot()):showGate("error"))}let M=!1;export{initBlogManagement};