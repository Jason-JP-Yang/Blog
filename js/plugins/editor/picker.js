import{escapeHTML}from"./markdown.js";import*as gitea from"./gitea.js";import{buildPreloader,siteRoot}from"./assets.js";import{pop}from"./motion.js";let ROOT="source/images",IMAGE=/\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i;function siteAddress(e){return"/"+String(e||"").replace(/^source\//,"")}let treeCache=null;async function walk(t,a,r){if(!(6<r)){let e=[];try{e=await gitea.list(t)}catch(e){return a}var s,i,d=[];for(s of e)"dir"===s.type?(a.push({path:s.path,type:"dir"}),d.push(s.path)):IMAGE.test(s.name)&&a.push({path:s.path,type:"file",size:s.size||0,sha:s.sha});for(i of d)await walk(i,a,r+1)}return a}async function loadTree(e){return treeCache=treeCache&&!e?treeCache:await walk(ROOT,[{path:ROOT,type:"dir"}],0)}function forgetTree(){treeCache=null}function createStage(){let r=[],s=new Set;return{moves:r,folders:s,get dirty(){return 0<r.length},resolve(e){let t=String(e||"");for(var a of r)t===a.from?t=a.to:t.startsWith(a.from+"/")&&(t=a.to+t.slice(a.from.length));return t},origin(e){let t=String(e||"");for(let e=r.length-1;0<=e;e--){var a=r[e];t===a.to?t=a.from:t.startsWith(a.to+"/")&&(t=a.from+t.slice(a.to.length))}return t},move(e,a){if(e&&a&&e!==a){let t=this.origin(e);e=r.find(e=>e.from===t);e?e.to=a:r.push({from:t,to:a}),s.delete(a.replace(/\/[^/]+$/,""))}},folder(e){e&&s.add(e)},clear(){r.length=0,s.clear()}}}function openSheet(e,d,n,o){let l=e.t;return new Promise(t=>{let r=document.createElement("div"),a=(r.className="ed-picker-mask",r.innerHTML=`
      <section class="ed-sheet" role="dialog" aria-modal="true">
        <header class="ed-picker-bar">
          <span class="ed-picker-name"><i class="fa-solid fa-sliders" aria-hidden="true"></i>${escapeHTML(d)}</span>
          <span class="ed-picker-acts">
            <button type="button" data-act="close" title="${escapeHTML(l("close","Close"))}"><i class="fa-solid fa-xmark"></i></button>
          </span>
        </header>
        <div class="ed-sheet-body">
          ${n.map(e=>`
            <div class="ed-sheet-group">
              <h3 class="ed-front-legend">${escapeHTML(e.label)}</h3>
              <div class="ed-front-grid">
                ${e.fields.map(e=>{var t=o[e.key];return"toggle"===e.kind?`<label class="ed-f" data-key="${escapeHTML(e.key)}">
                          <span class="ed-f-label">${escapeHTML(e.label)}</span>
                          <button type="button" class="ed-f-toggle${!1===t?"":" is-on"}"
                            data-toggle="${escapeHTML(e.key)}" role="switch"
                            aria-checked="${!1===t?"false":"true"}"></button>
                        </label>`:`<label class="ed-f${e.wide?" is-wide":""}" data-key="${escapeHTML(e.key)}">
                        <span class="ed-f-label">${escapeHTML(e.label)}</span>
                        <input class="ed-f-input" data-key="${escapeHTML(e.key)}" spellcheck="false"
                          value="${escapeHTML(null==t?"":String(t))}">
                      </label>`}).join("")}
              </div>
            </div>`).join("")}
        </div>
        <footer class="ed-picker-foot">
          <span class="ed-picker-hint">${escapeHTML(l("sheet_hint","Leave everything empty for a plain picture."))}</span>
          <button type="button" class="ed-act ed-act-primary ed-sheet-ok">
            <i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHTML(l("apply","Apply"))}</span>
          </button>
        </footer>
      </section>`,!1),s=e=>{a||(a=!0,r.remove(),document.removeEventListener("keydown",i,!0),t(e))},i=e=>{"Escape"===e.key&&(e.preventDefault(),s(null))};r.addEventListener("click",e=>{if(e.target===r||e.target.closest('[data-act="close"]'))return s(null);var t=e.target.closest("[data-toggle]");t&&(e.preventDefault(),e=!t.classList.contains("is-on"),t.classList.toggle("is-on",e),t.setAttribute("aria-checked",e?"true":"false"))}),r.querySelector(".ed-sheet-ok").addEventListener("click",()=>{var e,t,a={};for(e of r.querySelectorAll(".ed-f-input"))a[e.dataset.key]=e.value.trim();for(t of r.querySelectorAll("[data-toggle]"))a[t.dataset.toggle]=t.classList.contains("is-on");s(a)}),document.addEventListener("keydown",i,!0),document.body.appendChild(r),pop(r.querySelector(".ed-sheet"));var e=r.querySelector(".ed-f-input");e&&e.focus()})}function parentOf(e){var t=String(e).lastIndexOf("/");return t<0?"":e.slice(0,t)}function nameOf(e){return String(e).split("/").pop()}function openPicker(T,e={}){let w=T.t;return new Promise(t=>{let a=document.createElement("div"),r=(a.className="ed-picker-mask",a.innerHTML=`
      <section class="ed-picker" role="dialog" aria-modal="true">
        <header class="ed-picker-bar">
          <span class="ed-picker-name"><i class="fa-solid fa-images" aria-hidden="true"></i>${escapeHTML(w("pick_title","Pictures"))}</span>
          <span class="ed-picker-acts">
            <button type="button" data-act="upload" title="${escapeHTML(w("pick_upload","Add a picture"))}"><i class="fa-solid fa-arrow-up-from-bracket"></i></button>
            <button type="button" data-act="mkdir" title="${escapeHTML(w("pick_mkdir","New folder"))}"><i class="fa-solid fa-folder-plus"></i></button>
            <button type="button" data-act="rename" title="${escapeHTML(w("pick_rename","Rename"))}"><i class="fa-solid fa-i-cursor"></i></button>
            <button type="button" data-act="close" title="${escapeHTML(w("close","Close"))}"><i class="fa-solid fa-xmark"></i></button>
          </span>
        </header>
        <div class="ed-picker-body">
          <div class="ed-picker-side">
            <label class="ed-picker-find">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <input class="ed-picker-search" spellcheck="false" placeholder="${escapeHTML(w("pick_search","Search every folder"))}">
            </label>
            <div class="ed-picker-tree" role="tree"></div>
          </div>
          <div class="ed-picker-view">
            <div class="ed-picker-shot"></div>
            <div class="ed-picker-meta"></div>
          </div>
        </div>
        <footer class="ed-picker-foot">
          <code class="ed-picker-path"></code>
          <button type="button" class="ed-act ed-act-primary ed-picker-ok" disabled>
            <i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHTML(w("pick_use","Use this picture"))}</span>
          </button>
        </footer>
      </section>`,a.querySelector(".ed-picker-tree")),s=a.querySelector(".ed-picker-shot"),i=a.querySelector(".ed-picker-meta"),d=a.querySelector(".ed-picker-path"),n=a.querySelector(".ed-picker-ok"),o=a.querySelector(".ed-picker-search"),l=new Set([ROOT]),c=[],p=e.current?String(e.current).replace(/^\//,"source/"):"",f="",u=!1;function h(){var e=(()=>{var e,t,a,r=new Map;for(e of c){var s=T.stage.resolve(e.path);r.set(s,Object.assign({},e,{path:s}))}for(t of T.stage.folders)r.has(t)||r.set(t,{path:t,type:"dir",fresh:!0});for(a of T.pending||[]){var i=T.stage.resolve(a.path);r.has(i)||r.set(i,{path:i,type:"file",staged:!0,size:a.bytes?a.bytes.byteLength:0})}return Array.from(r.values()).sort((e,t)=>e.type!==t.type?"dir"===e.type?-1:1:e.path.localeCompare(t.path))})();if(f){let t=f.toLowerCase();return e.filter(e=>"file"===e.type&&e.path.toLowerCase().includes(t)).slice(0,400)}return e.filter(e=>e.path!==ROOT&&(e=parentOf(e.path),l.has(e)))}function m(){var e;d.textContent=p?siteAddress(p):"",n.disabled=!p||!IMAGE.test(p),s.innerHTML="",i.textContent="",p&&IMAGE.test(p)?(s.appendChild(buildPreloader(siteAddress(p),"",T.pending)),T.observeImages&&T.observeImages(),e=T.stage.origin(p),i.textContent=e===p?p:e+"  →  "+p):i.textContent=w("pick_hint","Choose a picture, or drag one onto a folder to move it.")}function v(){var e;e=h(),r.innerHTML=e.length?e.map(e=>{var t=f?0:e.path.split("/").length-ROOT.split("/").length-1,a="dir"===e.type?l.has(e.path)?"fa-folder-open":"fa-folder":"fa-image",r=f?e.path.replace(ROOT+"/",""):nameOf(e.path);return`<div class="ed-picker-row" role="treeitem" draggable="true"
                        data-path="${escapeHTML(e.path)}" data-type="${e.type}"
                        data-on="${e.path===p?"1":"0"}"
                        style="padding-left:${8+14*t}px">
                        <i class="fa-solid ${a}" aria-hidden="true"></i>
                        <span>${escapeHTML(r)}</span>
                        ${e.staged?`<em class="ed-picker-flag">${escapeHTML(w("pick_new","new"))}</em>`:""}
                        ${e.fresh?`<em class="ed-picker-flag">${escapeHTML(w("pick_unsaved","unsaved"))}</em>`:""}
                      </div>`}).join(""):`<p class="ed-picker-empty">${escapeHTML(w("pick_none","Nothing here yet"))}</p>`,m()}async function g(e,t){e=window.prompt(w("ask_"+e,"mkdir"===e?"Folder name":"New name"),t||"");return null==e?null:e.trim()}async function k(e){if("close"===e)return y(null);if("upload"===e)return(t=await new Promise(t=>{let a=document.createElement("input");a.type="file",a.accept="image/*",a.hidden=!0,document.body.appendChild(a),a.addEventListener("change",()=>{var e=a.files&&a.files[0];a.remove(),t(e||null)}),a.click()}))&&(t=await T.upload(t,p&&!IMAGE.test(p)?p:parentOf(p)||ROOT))?(p=T.stage.resolve(t.path),v()):void 0;if("mkdir"===e)return t=p&&!IMAGE.test(p)?p:parentOf(p)||ROOT,(a=await g("mkdir",""))?(T.stage.folder(t+"/"+a.replace(/[/\\]/g,"-")),l.add(t),v()):void 0;if("rename"===e&&p&&p!==ROOT){var t,a=await g("rename",nameOf(p));if(a&&a!==nameOf(p))return t=parentOf(p)+"/"+a.replace(/[/\\]/g,"-"),T.stage.move(p,t),p=t,v()}}function y(e){u||(u=!0,a.remove(),document.removeEventListener("keydown",b,!0),t(e))}function b(e){"Escape"===e.key&&(e.preventDefault(),y(null))}a.addEventListener("click",e=>{var t;return e.target===a?y(null):(t=e.target.closest("[data-act]"))?(e.preventDefault(),void k(t.dataset.act)):(t=e.target.closest(".ed-picker-row"))?(e.preventDefault(),e=t.dataset.path,"dir"===t.dataset.type&&(l.has(e)?l.delete(e):l.add(e)),p=e,v()):void 0}),a.addEventListener("dblclick",e=>{e=e.target.closest(".ed-picker-row");e&&"file"===e.dataset.type&&y({path:e.dataset.path,site:siteAddress(e.dataset.path)})}),n.addEventListener("click",()=>{p&&IMAGE.test(p)&&y({path:p,site:siteAddress(p)})}),o.addEventListener("input",()=>{f=o.value.trim(),v()});let L="";r.addEventListener("dragstart",e=>{var t=e.target.closest(".ed-picker-row");t&&(L=t.dataset.path,e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",L))}),r.addEventListener("dragover",e=>{var t=e.target.closest('.ed-picker-row[data-type="dir"]');t&&L&&t.dataset.path!==L&&(e.preventDefault(),e.dataTransfer.dropEffect="move",t.dataset.drop="1")}),r.addEventListener("dragleave",e=>{e=e.target.closest(".ed-picker-row");e&&delete e.dataset.drop}),r.addEventListener("drop",e=>{var t=e.target.closest('.ed-picker-row[data-type="dir"]');t&&L&&(e.preventDefault(),delete t.dataset.drop,(t.dataset.path+"/").startsWith(L+"/")||(e=t.dataset.path+"/"+nameOf(L),T.stage.move(L,e),p===L&&(p=e)),L="",l.add(t.dataset.path),v())}),r.addEventListener("dragend",()=>{L="";for(var e of r.querySelectorAll("[data-drop]"))delete e.dataset.drop}),document.addEventListener("keydown",b,!0),document.body.appendChild(a),pop(a.querySelector(".ed-picker")),r.innerHTML=`<p class="ed-picker-empty">${escapeHTML(w("pick_loading","Reading the repository…"))}</p>`,m(),loadTree().then(e=>{c=e;let t=parentOf(p);for(;t&&t.startsWith(ROOT);)l.add(t),t=parentOf(t);v(),o.focus()})})}export{siteAddress,loadTree,forgetTree,createStage,openSheet,openPicker};