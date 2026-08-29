import{setBusy as n,confirmStep as i,disarmConfirm as s,timeAgo as a,escapeHTML as o,describeDevice as l}from"./notifications-inbox.js";let r=130,c=280,d="cubic-bezier(0.32, 0.72, 0, 1)",u="blur(3px)",m=["posts","notes","announcements"],p={announcement:"fa-bullhorn",post:"fa-file-lines",note:"fa-comment-dots"},b='<li class="bm-blank"><i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i></li>';function t(e,t){return(window.theme&&window.theme.management_i18n||{})[e]||t}function e(e,i){return o(t(e,i))}let h=null,f="",g=!1,y={compose:{mode:"all"},notifications:{type:"announcement",items:[],cursor:0,more:!1,error:!1,loading:!1},followers:{items:[],cursor:0,more:!1,orphans:[],totals:null,error:!1,loading:!1},blocklists:{posts:[],notes:[],announcements:[]}},v=new Map;async function api(e,t={},i=!0){var a=await(async()=>{if(!window.blogAuth)return null;try{return await window.blogAuth.getSessionToken()}catch{return null}})();if(!a)return{ok:!1,status:401,data:null};a={method:t.method||"GET",headers:{Authorization:"Bearer "+a}};let s;void 0!==t.body&&(a.headers["Content-Type"]="application/json",a.body=JSON.stringify(t.body));try{s=await fetch(f+e,a)}catch{return{ok:!1,status:0,data:null}}if((401===s.status||403===s.status)&&i&&window.blogAuth)return await window.blogAuth.getSession(!0),api(e,t,!1);let n=null;try{n=await s.json()}catch{}return{ok:s.ok,status:s.status,data:n}}function morph(s,e,t){if(g)t();else{let a=e.getBoundingClientRect().height;e.style.transition="opacity 130ms ease, filter 130ms ease",e.style.opacity="0",e.style.filter=u,setTimeout(()=>{if(s.isConnected){let i=t()||s.firstElementChild;if(i){i.style.transition="none",i.style.opacity="0",i.style.filter=u;var e=i.getBoundingClientRect().height;s.style.overflow="hidden",s.style.height=a+"px",s.style.transition="height 280ms "+d,s.style.height=e+"px",i.style.transition="opacity 196ms ease, filter 196ms ease",i.style.opacity="1",i.style.filter="none";let t=e=>{"height"===e.propertyName&&(s.removeEventListener("transitionend",t),s.style.transition="",s.style.height="",s.style.overflow="",i.style.transition="",i.style.filter="")};s.addEventListener("transitionend",t)}}},r)}}class Picker{constructor(e,t,{onCommit:i,placeholder:a}){this.key=e,this.host=t,this.onCommit=i||(()=>{}),this.chips=[],this.busy=0,t.className="bm-picker",t.innerHTML=`<div class="bm-chips"><input class="bm-chip-input" type="text"
      spellcheck="false" autocomplete="off" placeholder="${o(a)}"></div>`,this.list=t.querySelector(".bm-chips"),this.input=t.querySelector(".bm-chip-input"),this.input.addEventListener("keydown",e=>{"Enter"===e.key||","===e.key||" "===e.key?(e.preventDefault(),this.commit()):"Backspace"===e.key&&!this.input.value&&this.chips.length&&this.remove(this.chips[this.chips.length-1].raw)}),this.input.addEventListener("blur",()=>this.commit()),this.input.addEventListener("paste",e=>{var t=(e.clipboardData||window.clipboardData).getData("text");/[\s,]/.test(t)&&(e.preventDefault(),t.split(/[\s,]+/).forEach(e=>this.add(e)))}),t.addEventListener("click",e=>{var t=e.target.closest(".bm-chip-x");t?this.remove(t.dataset.raw):e.target.closest(".bm-chip")||this.input.focus()})}get ids(){return this.chips.filter(e=>"ok"===e.status).map(e=>e.id)}get settled(){return 0===this.busy&&this.chips.every(e=>"ok"===e.status)}set(e){this.chips=(e||[]).map(e=>({raw:String(e.login||e.id),id:e.id,login:e.login||"",name:e.name||"",status:"ok"})),this.paint()}clear(){this.chips=[],this.paint()}commit(){var e=this.input.value.trim();this.input.value="",e&&this.add(e)}add(e){let t=String(e).replace(/^@/,"").trim();t&&!this.chips.some(e=>e.raw.toLowerCase()===t.toLowerCase())&&(this.chips.push({raw:t,id:null,login:"",name:"",status:"checking"}),this.paint(),this.resolve(t))}remove(t){var e=this.chips.length;this.chips=this.chips.filter(e=>e.raw!==t),this.chips.length!==e&&(this.paint(),this.onCommit(this))}async resolve(t){this.busy++;var e,i=await api("/api/admin/lookup",{method:"POST",body:{ids:[t]}}),a=(this.busy--,this.chips.find(e=>e.raw===t));a&&((e=i.ok&&i.data&&(i.data.matched||[])[0])?(a.id=e.id,a.login=e.login,a.name=e.name||"",a.status="ok"):a.status=i.ok?"unknown":"error",this.paint(),this.onCommit(this))}paint(){this.list.querySelectorAll(".bm-chip").forEach(e=>e.remove());var i=this.chips.map(i=>{return"checking"===(i=i).status?`<span class="bm-chip is-checking">
      <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
      <span class="bm-chip-name">${o(i.raw)}</span></span>`:"ok"!==i.status?(a="error"===i.status?t("chip_error","Lookup failed"):t("chip_unknown","Not a known reader"),`<span class="bm-chip is-unknown" title="${o(a)}">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <span class="bm-chip-name">${o(i.raw)}</span>
      <button type="button" class="bm-chip-x" data-raw="${o(i.raw)}"
              aria-label="${e("remove","Remove")}">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>`):`<span class="bm-chip is-ok">
    <img class="bm-chip-avatar" src="${avatarOf(i.id)}" alt="" loading="lazy">
    <span class="bm-chip-name">${o(i.name||i.login)}</span>
    <span class="bm-chip-id">#${o(i.id)}</span>
    <button type="button" class="bm-chip-x" data-raw="${o(i.raw)}"
            aria-label="${e("remove","Remove")}">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>`;var a}).join("");this.input.insertAdjacentHTML("beforebegin",i),this.host.classList.toggle("has-unknown",this.chips.some(e=>"ok"!==e.status))}}function avatarOf(e){return`https://avatars.githubusercontent.com/u/${encodeURIComponent(e)}?s=64&v=4`}function syncCompose(){var e,t,i,a,s,n=h.querySelector('[data-part="announce"]');n&&(e=n.querySelector(".bm-c-title"),t=n.querySelector(".bm-c-body"),i=n.querySelector(".bm-c-url"),a=n.querySelector(".bm-post"),s=v.get("audience"),e)&&a&&(n.querySelector(".bm-c-count").textContent=String(t.value.length),n=!("all"!==y.compose.mode)||s&&s.settled&&0<s.ids.length,a.disabled=!e.value.trim()||!i.value.trim()||!n)}function announcementId(e){e=String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,48);return`announce:${(new Date).toISOString().slice(0,10)}-${e||"untitled"}-`+Date.now().toString(36).slice(-4)}async function send(i){var a=h.querySelector('[data-part="announce"]'),s=a.querySelector(".bm-c-title").value.trim(),l=a.querySelector(".bm-c-body").value.trim(),r=a.querySelector(".bm-c-url").value.trim(),c=y.compose.mode,d=v.get("audience"),u=(n(i,!0),"all"===c?{kind:"all"}:{kind:c,users:d?d.ids:[]}),s=await api("/api/admin/notifications",{method:"POST",body:{id:announcementId(s),type:"announcement",topic:"announcements",title:s,body:l,url:r,tag:"announcements",audience:u}});n(i,!1),((a,s,{mode:i,audience:n})=>{if(a.hidden=!1,!s.ok){let i=s.data&&(s.data.error||s.data.message)||(s.status?"HTTP "+s.status:t("offline","The Worker did not answer."));return a.className="bm-receipt is-bad",a.innerHTML=`<div class="bm-receipt-head">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        <span>${e("send_failed","Not sent")}</span></div>
      <p class="bm-receipt-note">${o(i)}</p>`}var l=((s=s.data||{}).counts||[])[0]||{},r=s.audience&&s.audience.matched||[],c=s.audience&&s.audience.unknown||[],l=[[t("r_id","Id"),s.ingested&&s.ingested[0]],[t("r_recipients","Inboxes written"),l.recipients],[t("r_devices","Push devices"),l.devices],[t("r_messages","Queue messages"),l.messages],[t("r_audience","Audience"),"all"===i?t("aud_all","Everyone"):`${"users"===i?t("aud_only","Only these"):t("aud_except","Everyone except")} · `+(n.users||[]).length]];r.length&&l.push([t("r_matched","Matched"),r.map(e=>e.login+" #"+e.id).join(", ")]),c.length&&l.push([t("r_ignored","Ignored"),c.join(", ")]),(s.skipped||[]).length&&l.push([t("r_skipped","Already sent"),s.skipped.join(", ")]),s.absorbed&&l.push([t("r_absorbed","Absorbed"),t("r_absorbed_v","recorded, not delivered")]),a.className="bm-receipt is-good",a.innerHTML=`<div class="bm-receipt-head">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      <span>${e("send_ok","Sent")}</span></div>
    <dl class="bm-receipt-grid">${l.map(([e,t])=>`<dt>${o(e)}</dt><dd>${o(null==t||""===t?"—":t)}</dd>`).join("")}</dl>`})(a.querySelector(".bm-receipt"),s,{mode:c,audience:u}),s.ok&&(a.querySelector(".bm-c-title").value="",a.querySelector(".bm-c-body").value="",a.querySelector(".bm-c-url").value="",d&&d.clear(),syncCompose(),setFilter("announcement"))}function notifInnerHTML(i){let s="";try{let e=JSON.parse(i.audience_json||"{}");s="users"===e.kind?t("aud_only","Only these")+" "+(e.users||[]).length:"except"===e.kind?t("aud_except","Everyone except")+" "+(e.users||[]).length:"all"===e.kind?t("aud_all","Everyone"):t("aud_topic","By topic")}catch{}let n=[i.id,i.type,i.topic,i.source,i.recipients+" "+t("m_inboxes","inboxes"),i.devices+" "+t("m_devices","devices"),s,a(i.published_at)].filter(Boolean);return`
      <div class="bm-notif-inner">
        <span class="bm-notif-icon">
          <i class="fa-solid ${p[i.type]||"fa-bell"}" aria-hidden="true"></i>
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
      </div>`}function notificationHTML(e){return`<li class="bm-notif" data-id="${o(e.id)}">${notifInnerHTML(e)}</li>`}function paintNotifications(){var t=h.querySelector('[data-part="notifications"]'),i=t.querySelector(".bm-notifs"),a=t.querySelector(".bm-foot"),s=y.notifications;t.querySelector(".bm-notif-count").textContent=s.items.length?String(s.items.length):"",t.classList.toggle("is-loading",s.loading),s.loading&&!s.items.length?i.innerHTML=b:s.error?i.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:s.items.length?i.innerHTML=s.items.map(notificationHTML).join(""):i.innerHTML=`<li class="bm-blank">${e("no_notifications","Nothing in the database for this filter.")}</li>`,a.innerHTML=s.more?`<button type="button" class="bm-quiet bm-more" data-more="notifications">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:""}function setFilter(t){y.notifications.type=t,h.querySelectorAll(".bm-notif-filter button").forEach(e=>{e.classList.toggle("is-on",e.dataset.type===t)}),loadNotifications({reset:!0})}async function loadNotifications({reset:e=!1,trigger:t=null}={}){var i=y.notifications,e=(e&&(i.items=[],i.cursor=0,i.more=!1),t&&n(t,!0),i.loading=!0,paintNotifications(),`?type=${encodeURIComponent(i.type)}&cursor=`+i.cursor),t=await api("/api/admin/notifications"+e);i.loading=!1,i.error=!t.ok,t.ok&&t.data&&(i.items=i.items.concat(t.data.items||[]),i.more=null!=t.data.cursor,i.cursor=t.data.cursor||i.cursor),paintNotifications()}function startEdit(i){let a=y.notifications.items.find(e=>e.id===i.dataset.id);a&&!i.querySelector(".is-editing")&&morph(i,i.firstElementChild,()=>{i.innerHTML=(t=a,`
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
    </div>`);var t=i.querySelector(".bm-e-title");return t&&t.focus(),i.firstElementChild})}function cancelEdit(t){let e=y.notifications.items.find(e=>e.id===t.dataset.id);e&&morph(t,t.firstElementChild,()=>(t.innerHTML=notifInnerHTML(e),t.firstElementChild))}async function deleteNotification(e,t){let i=e.dataset.id;n(t,!0);var a=await api("/api/admin/notifications/"+encodeURIComponent(i),{method:"DELETE"});n(t,!1),a.ok&&(y.notifications.items=y.notifications.items.filter(e=>e.id!==i),t=e,a=paintNotifications,g?a():(e=t.getBoundingClientRect().height,t.style.overflow="hidden",t.style.height=e+"px",t.style.transition=`height 280ms ${d}, opacity 130ms ease`,t.style.opacity="0",t.style.height="0px",setTimeout(a,c)))}function renderFollowersShell(a){a.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-users" aria-hidden="true"></i>${e("followers","Followers")}
      <span class="bm-count bm-follower-count"></span>
    </h2>

    <div class="bm-card bm-blocklists">
      <h3 class="bm-sub-title">${e("blocklists","Global blocklists")}</h3>
      <p class="bm-hint">${e("blocklists_hint","Anyone listed here is skipped for that kind of notification, silently and everywhere. Saved as soon as an entry resolves.")}</p>
      ${m.map(e=>`
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
      <span>${e("moderation_notice","Muting or banning here only affects notifications. It does not stop anyone commenting on the blog — comments are GitHub Discussions, so blocking a commenter is done in your GitHub account settings under Moderation.")}
      <a href="https://docs.github.com/en/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-personal-account" target="_blank" rel="noopener">${e("moderation_docs","GitHub docs")}</a></span>
    </p>

    <ul class="bm-followers"></ul>
    <div class="bm-foot"></div>
    <div class="bm-orphans"></div>`,m.forEach(i=>{var e=a.querySelector(`[data-picker="${i}"]`);v.set(i,new Picker(i,e,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:e=>(async(e,t)=>{let i=h.querySelector(`[data-save="${e}"]`);var a;t.settled?(i&&(i.innerHTML='<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'),a=await api("/api/admin/blocklists",{method:"PUT",body:{topic:e,users:t.ids}}),i&&(i.innerHTML=a.ok?'<i class="fa-solid fa-check" aria-hidden="true"></i>':'<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>',a.ok)&&setTimeout(()=>i.innerHTML="",1800),a.ok&&(y.blocklists[e]=t.ids)):i&&(i.innerHTML="")})(i,e)}))})}function stateTag(t){return"banned"===t?`<span class="bm-tag is-banned">${e("banned","Banned")}</span>`:"muted"===t?`<span class="bm-tag is-muted">${e("muted","Muted")}</span>`:""}function moderationButtons(t,i,a,s){return s?`<span class="bm-tag is-admin">${e("admin","Admin")}</span>`:(s="banned"===a,`
    <button type="button" class="bm-quiet bm-mod${(a="muted"===a)?" is-on":""}"
            data-scope="${t}" data-target="${o(i)}" data-next="${a?"":"muted"}">
      <i class="fa-solid ${a?"fa-volume-high":"fa-volume-xmark"}" aria-hidden="true"></i>
      <span class="np-btn-label">${a?e("unmute","Unmute"):e("mute","Mute")}</span>
    </button>
    <button type="button" class="bm-quiet bm-mod${s?" is-on":""}"
            data-scope="${t}" data-target="${o(i)}" data-next="${s?"":"banned"}">
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
        <img class="bm-avatar" src="${avatarOf(i.id)}" alt="" loading="lazy">
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
    </li>`}function paintFollowers(){var i=h.querySelector('[data-part="followers"]'),a=i.querySelector(".bm-followers"),s=i.querySelector(".bm-foot"),n=y.followers;n.totals&&(i.querySelector(".bm-follower-count").textContent=`${n.totals.followers} · ${n.totals.devices} `+t("m_devices","devices")),i.classList.toggle("is-loading",n.loading),n.loading&&!n.items.length?a.innerHTML=b:n.error?a.innerHTML=`<li class="bm-blank">${e("unreachable","Couldn't reach the notification service.")}</li>`:n.items.length?a.innerHTML=n.items.map(followerHTML).join(""):a.innerHTML=`<li class="bm-blank">${e("no_followers","Nobody follows the blog yet.")}</li>`,s.innerHTML=n.more?`<button type="button" class="bm-quiet bm-more" data-more="followers">
         <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
         <span class="np-btn-label">${e("load_more","Load more")}</span></button>`:"",i.querySelector(".bm-orphans").innerHTML=n.orphans.length?`<h3 class="bm-sub-title">${e("orphans","Unowned devices")}
         <span class="bm-count">${n.orphans.length}</span></h3>
       <p class="bm-hint">${e("orphans_hint","Subscriptions whose owner unfollowed. Only banned ones are kept — the daily sweep removes the rest.")}</p>
       <ul class="bm-devices">${n.orphans.map(e=>deviceHTML(e,!1)).join("")}</ul>`:""}async function loadFollowers({reset:e=!1,trigger:t=null}={}){var a=y.followers,e=(e&&(a.items=[],a.cursor=0,a.more=!1),t&&n(t,!0),a.loading=!0,paintFollowers(),await api("/api/admin/followers?cursor="+a.cursor));if(a.loading=!1,a.error=!e.ok,e.ok&&e.data){let i=e.data;a.items=a.items.concat(i.items||[]),a.more=null!=i.cursor,a.cursor=i.cursor||a.cursor,i.orphans&&(a.orphans=i.orphans),i.totals&&(a.totals=i.totals),i.blocklists&&(y.blocklists=i.blocklists,m.forEach(e=>{var t=v.get(e);t&&t.set(i.blocklists[e]||[])}))}paintFollowers()}function showGate(i){var a=h.querySelector(".bm-gate"),s=h.querySelector(".bm-console");"ready"===(h.dataset.phase=i)?(a.hidden=!0,s.hidden=!1):(a.hidden=!1,s.hidden=!0,s={loading:["fa-circle-notch fa-spin",t("checking","Checking your session…")],denied:["fa-lock",t("denied","This page is for the blog's administrator.")],error:["fa-plug-circle-xmark",t("unreachable","Couldn't reach the notification service.")]}[i],a.innerHTML=`<i class="fa-solid ${s[0]}" aria-hidden="true"></i>
    <p class="bm-gate-text">${o(s[1])}</p>
    `+("loading"===i?"":`<button type="button" class="bm-quiet bm-retry">
             <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
             <span class="np-btn-label">${e("retry","Try again")}</span></button>`))}function wire(){h.addEventListener("click",e=>{var e=e.target,a=e.closest(".bm-retry");if(a)n(a,!0),boot(!0);else{var o,a=e.closest(".bm-seg [data-mode]");if(a)return o=a.dataset.mode,y.compose.mode=o,(a=h.querySelector('[data-part="announce"]')).querySelectorAll(".bm-seg button").forEach(e=>{e.classList.toggle("is-on",e.dataset.mode===o)}),a.querySelector('[data-picker="audience"]').hidden="all"===o,a.querySelector(".bm-audience-hint").textContent="all"===o?t("aud_all_hint","Every follower receives this."):"users"===o?t("aud_only_hint","Only the readers listed here receive this."):t("aud_except_hint","Every follower except the readers listed here."),void syncCompose();a=e.closest(".bm-notif-filter [data-type]");if(a)setFilter(a.dataset.type);else{a=e.closest(".bm-post");if(a)send(a);else{a=e.closest(".bm-more");if(a)("followers"===a.dataset.more?loadFollowers:loadNotifications)({trigger:a});else{a=e.closest(".bm-edit");if(a)startEdit(a.closest(".bm-notif"));else{a=e.closest(".bm-cancel");if(a)cancelEdit(a.closest(".bm-notif"));else{a=e.closest(".bm-save");if(a)(async(e,t)=>{let i=e.dataset.id,a=y.notifications.items.find(e=>e.id===i);var s,o,l,r;a&&(s=e.querySelector(".bm-e-title").value.trim(),o=e.querySelector(".bm-e-body").value.trim(),l=e.querySelector(".bm-e-url").value.trim(),s)&&(n(t,!0),r=await api("/api/admin/notifications/"+encodeURIComponent(i),{method:"PUT",body:{title:s,body:o,url:l}}),n(t,!1),r.ok?(a.title=s,a.body=o,l&&(a.url=l),cancelEdit(e)):(e.classList.add("is-bad"),setTimeout(()=>e.classList.remove("is-bad"),1200)))})(a.closest(".bm-notif"),a);else{a=e.closest(".bm-del");if(a){let e=a.closest(".bm-notif");void(i(a,"del:"+e.dataset.id,"")&&deleteNotification(e,a))}else{a=e.closest(".bm-mod");if(a){let e=`mod:${a.dataset.scope}:${a.dataset.target}:`+a.dataset.next;i(a,e,t("confirm","Press again"))&&(async i=>{let e=i.dataset.scope,a=i.dataset.target,s=i.dataset.next;n(i,!0);var t=await api("/api/admin/moderation",{method:"PUT",body:"device"===e?{device_id:Number(a),state:s}:{github_id:Number(a),state:s}});if(n(i,!1),t.ok){i=y.followers;if("follower"===e){let e=i.items.find(e=>String(e.id)===String(a));e&&(e.state=s)}else{for(let t of i.items){let e=t.devices.find(e=>String(e.id)===String(a));e&&(e.state=s)}let e=i.orphans.find(e=>String(e.id)===String(a));e&&(e.state=s)}paintFollowers()}})(a)}else s()}}}}}}}}})}async function boot(i=!1){showGate("loading"),i&&window.blogAuth&&await window.blogAuth.getSession(!0);var a,s,n,i=await api("/api/admin/notifications?cursor=0&type=announcement");401===i.status||403===i.status?showGate("denied"):i.ok?(showGate("ready"),a={announce:h.querySelector('[data-part="announce"]'),notifications:h.querySelector('[data-part="notifications"]'),followers:h.querySelector('[data-part="followers"]')},(s=a.announce).innerHTML=`
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

    <div class="bm-receipt" hidden></div>`,n=s.querySelector('[data-picker="audience"]'),v.set("audience",new Picker("audience",n,{placeholder:t("aud_placeholder","GitHub login or numeric id, then Enter"),onCommit:()=>syncCompose()})),s.querySelectorAll(".bm-field").forEach(e=>{e.addEventListener("input",syncCompose)}),syncCompose(),n=a.notifications,s=[["announcement",t("f_announcements","Announcements")],["post",t("f_posts","Posts")],["note",t("f_notes","Notes")],["",t("f_all","All")]],n.innerHTML=`
    <h2 class="bm-section-title">
      <i class="fa-solid fa-list-ul" aria-hidden="true"></i>${e("notifications","Notification list")}
      <span class="bm-count bm-notif-count"></span>
    </h2>
    <div class="bm-seg bm-notif-filter" role="group">
      ${s.map(([e,t])=>`<button type="button" data-type="${o(e)}"${e===y.notifications.type?' class="is-on"':""}>${o(t)}</button>`).join("")}
    </div>
    <ul class="bm-notifs"></ul>
    <div class="bm-foot"></div>`,renderFollowersShell(a.followers),(n=y.notifications).items=i.data.items||[],n.more=null!=i.data.cursor,n.cursor=i.data.cursor||0,paintNotifications(),loadFollowers({reset:!0})):showGate("error")}function initBlogManagement(){var e=document.getElementById("blog-management");e&&(h=e,v.clear(),y.compose.mode="all",y.notifications.type="announcement",y.notifications.loading=!1,y.followers.loading=!1,g=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.theme&&window.theme.notifications||{},(f=window.blogAuth?window.blogAuth.resolveApiBase(e.api_url):String(e.api_url||"").replace(/\/+$/,""))?(wire(),boot()):showGate("error"))}export{initBlogManagement};