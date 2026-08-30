import{setBusy,confirmStep,disarmConfirm,timeAgo,escapeHTML,describeDevice}from"./notifications-inbox.js";import{Picker,avatarOf}from"../tools/chipPicker.js";import{b64urlToBytes,importAesKey,openJSON,fetchSealed,vaultPrefix,siteRoot}from"../tools/vaultCrypto.js";let FADE_MS=130,MORPH_MS=280,MORPH_EASE="cubic-bezier(0.32, 0.72, 0, 1)",FADE_BLUR="blur(3px)",TOPICS=["posts","notes","announcements"],TYPE_ICONS={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},SPINNER_ROW='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>',MODERATION_DOCS="https://docs.github.com/en/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account";function contentChanged(){try{window.dispatchEvent(new CustomEvent("redefine:content-resized"))}catch{}}function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,a){return escapeHTML(t(e,a))}let root=null,base="",reduced=!1,state={compose:{mode:"all"},notifications:{type:"",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},vault:{items:[],offset:0,more:!1,error:!1,loading:!1,keys:null},blocklists:{posts:[],notes:[],announcements:[]}},pickers=new Map;async function token(){if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}}async function api(e,t={},a=!0){var i=await token();if(!i)return{ok:!1,status:401,data:null};i={method:t.method||"GET",headers:{Authorization:"Bearer "+i}};void 0!==t.body&&(i.headers["Content-Type"]="application/json",i.body=JSON.stringify(t.body));let s;try{s=await fetch(base+e,i)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&a&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if(reduced)t();else{let i=e.getBoundingClientRect().height;e.style.transition=`opacity ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`,e.style.opacity="0",e.style.filter=FADE_BLUR,setTimeout(()=>{if(s.isConnected){let a=t()||s.firstElementChild;if(a){a.style.transition="none",a.style.opacity="0",a.style.filter=FADE_BLUR;var e=a.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=i+"px",s.style.transition=`height ${MORPH_MS}ms `+MORPH_EASE,s.style.height=e+"px",a.style.transition=`opacity ${.7*MORPH_MS}ms ease, filter ${.7*MORPH_MS}ms ease`,a.style.opacity="1",a.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",a.style.transition="",a.style.filter="",contentChanged())};s.addEventListener("transitionend",t)}}},FADE_MS)}}async function lookupIdentity(e){e=await api("/api/admin/lookup",{method:"POST",body:{ids:[e]}});return{ok:e.ok,matched:e.data&&e.data.matched||[]}}function makePicker(e,a,i){return new Picker(e,a,{...i,lookup:lookupIdentity,t:t})}function renderCompose(a){a.innerHTML=`
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

    <div class="bm-receipt" hidden></div>`;var i=a.querySelector('[data-picker="audience"]');pickers.set("audience",makePicker("audience",i,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),a.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose()}function composeMode(a){state.compose.mode=a;var e=root.querySelector('[data-part="announce"]');e.querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===a)}),e.querySelector('[data-picker="audience"]').hidden="all"===a,e.querySelector(".bm-audience-hint").textContent="all"===a?t("aud_all_hint","Every follower receives this."):"users"===a?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),syncCompose()}function syncCompose(){var e,t,a,i,s,n=root.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),a=n.querySelector(".bm-c-url"),i=n.querySelector(".bm-post"),s=pickers.get("audience"),e)&&i&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==state.compose.mode)||s&&s.settled&&0<s.ids.length,i.disabled=!e.value.trim()||!a.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(e){var t=root.querySelector('[data-part="announce"]'),a=t.querySelector(".bm-c-title").value.trim(),i=t.querySelector(".bm-c-body").value.trim(),s=t.querySelector(".bm-c-url").value.trim(),n=state.compose.mode,o=pickers.get("audience"),l=(setBusy(e,!0),"all"===n?{kind:"all"}:{kind:n,users:o?o.ids:[]}),a=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(a),type:"announcement",topic:"announcements",title:a,body:i,url:s,tag:"announcements",audience:l}});setBusy(e,!1),renderReceipt(t.querySelector(".bm-receipt"),a,{mode:n,audience:l}),a.ok&&(t.querySelector(".bm-c-title").value="",t.querySelector(".bm-c-body").value="",t.querySelector(".bm-c-url").value="",o&&o.clear(),syncCompose(),setFilter(""))}function renderReceipt(a,i,{mode:s,audience:n}){var o,l,r,c;a.hidden=!1,i.ok?(c=((o=i.data||{}).counts||[])[0]||{},l=o.audience&&o.audience.matched||[],r=o.audience&&o.audience.unknown||[],c=[[t("r_id","Id"),o.ingested&&o.ingested[0]],[t("r_recipients","Inboxes written"),c.recipients],[t("r_devices","Push devices"),c.devices],[t("r_messages","Queue messages"),c.messages],[t("r_audience","Audience"),"all"===s?t("aud_all","Everyone"):`${"users"===s?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]],l.length&&c.push([t("r_matched","Matched"),l.map(e=>e.login+" #"+e.id).join(", ")]),r.length&&c.push([t("r_ignored","Ignored"),r.join(", ")]),(o.skipped||[]).length&&c.push([t("r_skipped","Already sent"),o.skipped.join(", ")]),o.absorbed&&c.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),a.className="bm-receipt is-good",a.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${c.map(([e,t])=>`<dt>${escapeHTML(e)}</dt><dd>${escapeHTML(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`):(s=i.data&&(i.data.error||i.data.message)||(i.status?"HTTP "+i.status:t("offline","The Worker did not answer.")),a.className="bm-receipt is-bad",a.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${escapeHTML(s)}</p>`)}function renderNotificationsShell(a){var i=[["",t("f_all","All")],["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")]];a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${i.map(([e,t])=>`<button type="button" data-type="${escapeHTML(e)}"${e===state.notifications.type?' class="is-on"':""}>${escapeHTML(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`}function notifInnerHTML(a){let i="";try{var s=JSON.parse(a.audience_json||"{}");i="users"===s.kind?t("aud_only","Only these")+" "+(s.users||[]).length:"except"===s.kind?t("aud_except","Everyone except")+" "+(s.users||[]).length:"all"===s.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}s=[a.id,a.type,a.topic,a.source,a.recipients+" "+t("m_inboxes","inboxes"),a.devices+" "+t("m_devices","devices"),i,timeAgo(a.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${TYPE_ICONS[a.type]||"fa-bell"}" aria-hidden="true"></i>
        </span>
        <div class="bm-notif-main">
          <div class="bm-notif-title">${escapeHTML(a.title)}</div>
          ${a.body?`<p class="bm-notif-body">${escapeHTML(a.body)}</p>`:""}
          <a class="bm-notif-url" href="${escapeHTML(a.url)}" target="_blank" rel="noopener">
            ${escapeHTML(a.url)}</a>
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
    </div>`}function paintNotifications(){var t=root.querySelector('[data-part="notifications"]'),a=t.querySelector(".bm-notifs"),i=t.querySelector(".bm-foot"),s=state.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?a.innerHTML=SPINNER_ROW:s.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?a.innerHTML=s.items.map(notificationHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,i.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",contentChanged()}function setFilter(t){state.notifications.type=t,root.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var a=state.notifications,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&setBusy(t,!0),a.loading=!0,paintNotifications(),`?type=${encodeURIComponent(a.type)}&cursor=`+a.cursor),t=await api("/api/admin/notifications"+e);a.loading=!1,a.error=!t.ok,t.ok&&t.data&&(a.items=a.items.concat(t.data.items||[]),a.more=null!=t.data.cursor,a.cursor=t.data.cursor||a.cursor),paintNotifications()}function startEdit(t){let a=state.notifications.items.find(e=>e.id===t.dataset.id);a&&!t.querySelector(".is-editing")&&morph(t,t.firstElementChild,()=>{t.innerHTML=editorHTML(a);var e=t.querySelector(".bm-e-title");return e&&e.focus(),t.firstElementChild})}function cancelEdit(t){let e=state.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function saveEdit(e,t){let a=e.dataset.id;var i,s,n,o,l=state.notifications.items.find(e=>e.id===a);l&&(i=e.querySelector(".bm-e-title").value.trim(),s=e.querySelector(".bm-e-body").value.trim(),n=e.querySelector(".bm-e-url").value.trim(),i)&&(setBusy(t,!0),o=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"PUT",body:{title:i,body:s,url:n}}),setBusy(t,!1),o.ok?(l.title=i,l.body=s,n&&(l.url=n),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))}async function deleteNotification(e,t){let a=e.dataset.id;setBusy(t,!0);var i=await api("/api/admin/notifications/"+encodeURIComponent(a),{method:"DELETE"});setBusy(t,!1),i.ok&&(state.notifications.items=state.notifications.items.filter(e=>e.id!==a),collapseAway(e,paintNotifications))}function collapseAway(e,t){var a;reduced?t():(a=e.getBoundingClientRect().height,e.style.overflow="hidden",e.style.height=a+"px",e.style.transition=`height ${MORPH_MS}ms ${MORPH_EASE}, opacity ${FADE_MS}ms ease`,e.style.opacity="0",e.style.height="0px",setTimeout(t,MORPH_MS))}function renderVaultShell(a){a.innerHTML=`
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
               placeholder='${escapeHTML(t("v_paste",'{"id":"...","slug":"...","wrapped":"..."}'))}' />
        <button type="button" class="bm-primary bm-vault-add">
          <span class="np-btn-label">${e("v_activate","Activate")}</span>
        </button>
      </div>
      <p class="bm-vault-add-state" role="status"></p>
    </div>

    <ul class="bm-vault-list"></ul>
    <div class="bm-foot"></div>`}async function hydrateVaultMeta(e){await Promise.all(e.map(async e=>{if(!e.meta){e.meta={};try{var t,a,i=await importAesKey(b64urlToBytes(e.key)),s=await fetchSealed(`${vaultPrefix()}/${e.slug}/c.bin`);s&&(a="album"===(t=(await openJSON(i,s)).meta||{}).kind,e.meta={album:a,title:(a?t.name:t.title)||t.title||"",date:t.date||"",category:a?t.category||"":(t.categories||[]).map(e=>e.name).join(" / "),tags:(t.tags||[]).map(e=>e.name),excerpt:((a?t.description:t.excerpt)||"").slice(0,150)})}catch(e){}}}))}function vaultRowHTML(a){var i=a.meta||{},s=i.date?new Date(i.date):null,n=a.audience.length;return`
    <li class="bm-vault" data-id="${escapeHTML(a.id)}">
      <div class="bm-vault-main">
        <div class="bm-vault-title">
          <i class="fa-solid ${i.album?"fa-images":"fa-lock-keyhole"}" aria-hidden="true"></i>
          <a href="${escapeHTML(vaultPrefix()+"/"+a.slug+"/")}" target="_blank" rel="noopener">
            ${escapeHTML(i.title||t("v_unreadable","Unreadable — key does not match"))}
          </a>
        </div>
        <div class="bm-vault-meta">
          ${s?`<span><i class="fa-solid fa-calendars"></i>${s.toISOString().slice(0,10)}</span>`:""}
          ${i.category?`<span><i class="fa-solid fa-folders"></i>${escapeHTML(i.category)}</span>`:""}
          ${(i.tags||[]).length?`<span><i class="fa-solid fa-tags"></i>${i.tags.map(escapeHTML).join(", ")}</span>`:""}
          <span class="bm-vault-slug"><i class="fa-solid fa-link"></i>${escapeHTML(a.slug)}</span>
        </div>
        ${i.excerpt?`<p class="bm-vault-excerpt">${escapeHTML(i.excerpt)}…</p>`:""}
      </div>

      <div class="bm-vault-side">
        <div class="bm-vault-readers" data-empty="${n?"0":"1"}">
          <i class="fa-solid fa-user-lock" aria-hidden="true"></i>
          <strong>${n}</strong>
          <span>${escapeHTML(t(1===n?"v_reader":"v_readers","readers"))}</span>
        </div>
        <button type="button" class="bm-quiet bm-danger bm-vault-revoke" title="${escapeHTML(t("v_revoke_hint",""))}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
          <span class="np-btn-label">${e("v_revoke","Revoke")}</span>
        </button>
      </div>

      <div class="bm-vault-audience">
        <label class="bm-blocklist-label">
          ${e("v_audience","Who can read this")}
          <span class="bm-save-state" data-save="vault:${escapeHTML(a.id)}"></span>
        </label>
        <div class="bm-picker-host" data-picker="vault:${escapeHTML(a.id)}"></div>
      </div>
    </li>`}function paintVault(){var i=root.querySelector('[data-part="vault"]');if(i){var a=i.querySelector(".bm-vault-list"),s=i.querySelector(".bm-foot"),n=state.vault;i.querySelector(".bm-vault-count").textContent=n.items.length||"",i.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?a.innerHTML=SPINNER_ROW:n.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the service.")}</li>`:n.items.length?a.innerHTML=n.items.map(vaultRowHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("v_empty","No encrypted post has been activated yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="vault">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"";for(let a of n.items){var o="vault:"+a.id,l=i.querySelector(`[data-picker="${CSS.escape(o)}"]`);l&&((l=makePicker(o,l,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveVaultAudience(a.id,e)})).set(a.audience),pickers.set(o,l))}contentChanged()}}async function loadVault({reset:e=!1,trigger:t=null}={}){let a=state.vault;e&&(a.items=[],a.offset=0,a.more=!1,a.keys=null),t&&setBusy(t,!0),a.loading=!0,paintVault();var[e,t]=await Promise.all([api("/api/admin/vault?offset="+a.offset),a.keys?Promise.resolve(null):api("/api/vault/keys",{method:"POST",body:{}})]);a.loading=!1,a.error=!e.ok,t&&t.ok&&t.data&&(a.keys=new Map((t.data.posts||[]).map(e=>[e.id,e.key]))),e.ok&&e.data&&(await hydrateVaultMeta((t=(e.data.posts||[]).map(e=>({...e,key:a.keys?.get(e.id)}))).filter(e=>e.key)),a.items=a.items.concat(t),a.more=!!e.data.more,a.offset=a.items.length),paintVault()}async function activateVault(a){var i=root.querySelector('[data-part="vault"]'),s=i.querySelector(".bm-vault-line"),i=i.querySelector(".bm-vault-add-state"),n=s.value.trim();if(n){let e;try{e=JSON.parse(n)}catch(e){return i.textContent=t("v_bad","That is not an activation line."),void(i.dataset.tone="bad")}setBusy(a,!0);n=await api("/api/admin/vault",{method:"POST",body:{id:e.id,slug:e.slug,wrapped:e.wrapped}});setBusy(a,!1),i.textContent=n.ok?t("v_added","Activated"):t("v_bad","That is not an activation line."),i.dataset.tone=n.ok?"ok":"bad",n.ok&&loadVault({reset:!(s.value="")})}}async function saveVaultAudience(t,e){let a=root.querySelector(`[data-save="${CSS.escape("vault:"+t)}"]`);var i;e.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),e=e.entries,i=await api(`/api/admin/vault/${encodeURIComponent(t)}/audience`,{method:"PUT",body:{audience:e}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(i=state.vault.items.find(e=>e.id===t))&&(i.audience=e,i=root.querySelector(`.bm-vault[data-id="${CSS.escape(t)}"] .bm-vault-readers`))&&(i.querySelector("strong").textContent=e.length,i.dataset.empty=e.length?"0":"1")):a&&(a.innerHTML="")}async function revokeVault(e,t){let a=e.dataset.id;setBusy(t,!0);var i=await api("/api/admin/vault/"+encodeURIComponent(a),{method:"DELETE"});setBusy(t,!1),i.ok&&collapseAway(e,()=>{state.vault.items=state.vault.items.filter(e=>e.id!==a),pickers.delete("vault:"+a),paintVault()})}function renderFollowersShell(i){i.innerHTML=`
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
    <div class="bm-orphans"></div>`,TOPICS.forEach(a=>{var e=i.querySelector(`[data-picker="${a}"]`);pickers.set(a,makePicker(a,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>saveBlocklist(a,e)}))})}async function saveBlocklist(e,t){let a=root.querySelector(`[data-save="${e}"]`);var i;t.settled?(a&&(a.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),i=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),a&&(a.innerHTML=i.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',i.ok)&&setTimeout(()=>a.innerHTML="",1800),i.ok&&(state.blocklists[e]=t.ids)):a&&(a.innerHTML="")}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,a,i,s){return s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(s="banned"===i,`
    <button type="button" class="bm-quiet bm-mod${(i="muted"===i)?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(a)}" data-next="${i?"":"muted"}">
      <i class="fa-solid ${i?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${i?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${escapeHTML(a)}" data-next="${s?"":"banned"}">
      <i class="fa-solid ${s?"fa-lock-open":"fa-ban"}" aria-hidden="true"></i>
      <span class="np-btn-label">${s?e("unban","Unblock"):e("ban","Ban")}</span>
    </button>`)}function deviceHTML(e,a){var i=describeDevice(e);return`
    <li class="bm-device" data-device="${escapeHTML(e.id)}">
      <span class="bm-device-icon"><i class="${i.icon}" aria-hidden="true"></i></span>
      <div class="bm-device-main">
        <div class="bm-device-title">${escapeHTML(i.browser)}<span class="bm-sep"></span>${escapeHTML(i.os)}<span class="bm-sep"></span>${escapeHTML(i.kind)}${stateTag(e.state)}</div>
        <div class="bm-device-meta">${escapeHTML(t("subscribed","Subscribed")+" "+timeAgo(e.created_at))}<span class="bm-sep"></span>…${escapeHTML(e.tail||"")}</div>
      </div>
      <div class="bm-device-actions">${moderationButtons("device",e.id,e.state,a)}</div>
    </li>`}function followerHTML(a){var i=String(a.blocked||"").split(",").filter(Boolean).map(e=>t("topic_"+e,e)),i=["#"+a.id,t("subscribed","Subscribed")+" "+timeAgo(a.created_at),a.devices.length+" "+t("m_devices","devices"),a.unread+" "+t("m_unread","unread"),i.length?t("m_blocked","Blocked")+": "+i.join(", "):""].filter(Boolean);return`
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
          <div class="bm-follower-meta">${i.map(e=>`<span>${escapeHTML(e)}</span>`).join('<span class="bm-sep"></span>')}</div>
        </div>
        <div class="bm-follower-actions">
          ${moderationButtons("follower",a.id,a.state,a.is_admin)}
        </div>
      </div>
      ${a.devices.length?`<ul class="bm-devices">${a.devices.map(e=>deviceHTML(e,a.is_admin)).join("")}</ul>`:`<p class="bm-blank bm-no-devices">${e("no_devices","No push device registered.")}</p>`}
    </li>`}function paintFollowers(){var a=root.querySelector('[data-part="followers"]'),i=a.querySelector(".bm-followers"),s=a.querySelector(".bm-foot"),n=state.followers;n.totals&&(a.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),a.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?i.innerHTML=SPINNER_ROW:n.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?i.innerHTML=n.items.map(followerHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",a.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:"",contentChanged()}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var i=state.followers,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&setBusy(t,!0),i.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+i.cursor));if(i.loading=!1,i.error=!e.ok,e.ok&&e.data){let a=e.data;i.items=i.items.concat(a.items||[]),i.more=null!=a.cursor,i.cursor=a.cursor||i.cursor,a.orphans&&(i.orphans=a.orphans),a.totals&&(i.totals=a.totals),a.blocklists&&(state.blocklists=a.blocklists,TOPICS.forEach(e=>{var t=pickers.get(e);t&&t.set(a.blocklists[e]||[])}))}paintFollowers()}async function moderate(e){var t=e.dataset.scope;let a=e.dataset.target;var i=e.dataset.next,s=(setBusy(e,!0),await api("/api/admin/moderation",{method:"PUT",body:"device"===t?{device_id:Number(a),state:i}:{github_id:Number(a),state:i}}));if(setBusy(e,!1),s.ok){e=state.followers;if("follower"===t){s=e.items.find(e=>String(e.id)===String(a));s&&(s.state=i)}else{for(var n of e.items){n=n.devices.find(e=>String(e.id)===String(a));n&&(n.state=i)}t=e.orphans.find(e=>String(e.id)===String(a));t&&(t.state=i)}paintFollowers()}}function showGate(a){var i=root.querySelector(".bm-gate"),s=root.querySelector(".bm-console");"ready"===(root.dataset.phase=a)?(i.hidden=!0,s.hidden=!1,contentChanged()):(i.hidden=!1,s.hidden=!0,"loading"===a?i.innerHTML=`<div class="access-probe" role="status">
      <div class="access-probe-lock"><i class="fa-solid fa-lock-keyhole" aria-hidden="true"></i></div>
      <p class="access-probe-text">${escapeHTML(t("checking","Checking your session…"))}</p>
      <div class="access-probe-bar"><span></span></div></div>`:(s={denied:["fa-lock",t("denied","This page is for the blog's administrator.")],error:["fa-plug-circle-xmark",t("unreachable","Couldn't reach the notification service.")]}[a],i.innerHTML=`<i class="fa-solid ${s[0]}" aria-hidden="true"></i>
    <p class="bm-gate-text">${escapeHTML(s[1])}</p>
    <button type="button" class="bm-quiet bm-retry">
      <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      <span class="np-btn-label">${e("retry","Try again")}</span></button>`))}function wire(){root.addEventListener("click",e=>{var a,e=e.target,i=e.closest(".bm-retry");i?(setBusy(i,!0),boot(!0)):(i=e.closest(".bm-seg [data-mode]"))?composeMode(i.dataset.mode):(i=e.closest(".bm-notif-filter [data-type]"))?setFilter(i.dataset.type):(i=e.closest(".bm-post"))?send(i):(i=e.closest(".bm-more"))?("followers"===i.dataset.more?loadFollowers:"vault"===i.dataset.more?loadVault:loadNotifications)({trigger:i}):(i=e.closest(".bm-vault-add"))?activateVault(i):(i=e.closest(".bm-edit"))?startEdit(i.closest(".bm-notif")):(i=e.closest(".bm-cancel"))?cancelEdit(i.closest(".bm-notif")):(i=e.closest(".bm-save"))?saveEdit(i.closest(".bm-notif"),i):(i=e.closest(".bm-del"))?(a=i.closest(".bm-notif"),confirmStep(i,"del:"+a.dataset.id,"")&&deleteNotification(a,i)):(a=e.closest(".bm-mod"))?(i=`mod:${a.dataset.scope}:${a.dataset.target}:`+a.dataset.next,confirmStep(a,i,t("confirm","Press again"))&&moderate(a)):(i=e.closest(".bm-vault-revoke"))?(a=i.closest(".bm-vault"),confirmStep(i,"vault:"+a.dataset.id,t("confirm","Press again"))&&revokeVault(a,i)):disarmConfirm()})}async function boot(e=!1){showGate("loading"),e&&window.blogAuth&&await window.blogAuth.getSession(!0);var t,a,e=await api("/api/admin/notifications?cursor=0&type=");401===e.status||403===e.status?showGate("denied"):e.ok?(showGate("ready"),renderCompose((t={announce:root.querySelector('[data-part="announce"]'),notifications:root.querySelector('[data-part="notifications"]'),followers:root.querySelector('[data-part="followers"]'),vault:root.querySelector('[data-part="vault"]')}).announce),renderNotificationsShell(t.notifications),t.vault&&renderVaultShell(t.vault),renderFollowersShell(t.followers),(a=state.notifications).items=e.data.items||[],a.more=null!=e.data.cursor,a.cursor=e.data.cursor||0,paintNotifications(),t.vault&&loadVault({reset:!0}),loadFollowers({reset:!0})):showGate("error")}function initBlogManagement(){var e=document.getElementById("blog-management");e&&(root=e,pickers.clear(),state.compose.mode="all",state.notifications.type="",state.notifications.loading=!1,state.followers.loading=!1,state.vault.loading=!1,reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.theme&&window.theme.backend||{},(base=window.blogAuth?window.blogAuth.resolveApiBase():String(e.api_url||"").replace(/\/+$/,""))?(wire(),wireSignOut(),boot()):showGate("error"))}let signOutWired=!1;function wireSignOut(){signOutWired||(signOutWired=!0,window.addEventListener("blog:auth-change",async()=>{var e;!document.getElementById("blog-management")||(e=window.blogAuth&&await window.blogAuth.getSession())&&e.token||location.replace(siteRoot()+"/")}))}export{initBlogManagement};