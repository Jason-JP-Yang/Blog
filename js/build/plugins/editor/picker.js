import{escapeHTML as e}from"./markdown.js";import*as t from"./gitea.js";import{buildPreloader as a,siteRoot as n}from"./assets.js";import{pop as s}from"./motion.js";let r="source/images",i=/\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i;function siteAddress(e){return"/"+String(e||"").replace(/^source\//,"")}let o=null;async function walk(e,r,s){if(!(6<s)){let a=[];try{a=await t.list(e)}catch(e){return r}var d=[];for(let e of a)"dir"===e.type?(r.push({path:e.path,type:"dir"}),d.push(e.path)):i.test(e.name)&&r.push({path:e.path,type:"file",size:e.size||0,sha:e.sha});for(let e of d)await walk(e,r,s+1)}return r}async function loadTree(e){return o=o&&!e?o:await walk(r,[{path:r,type:"dir"}],0)}function forgetTree(){o=null}function createStage(){let s=[],i=new Set;return{moves:s,folders:i,get dirty(){return 0<s.length},resolve(e){let t=String(e||"");for(let e of s)t===e.from?t=e.to:t.startsWith(e.from+"/")&&(t=e.to+t.slice(e.from.length));return t},origin(e){let t=String(e||"");for(let e=s.length-1;0<=e;e--){var a=s[e];t===a.to?t=a.from:t.startsWith(a.to+"/")&&(t=a.from+t.slice(a.to.length))}return t},move(a,r){if(a&&r&&a!==r){let t=this.origin(a),e=s.find(e=>e.from===t);e?e.to=r:s.push({from:t,to:r}),i.delete(r.replace(/\/[^/]+$/,""))}},folder(e){e&&i.add(e)},clear(){s.length=0,i.clear()}}}function openSheet(t,l,o,c){let p=t.t;return new Promise(t=>{let r=document.createElement("div"),a=(r.className="ed-picker-mask",r.innerHTML=`
      <section class="ed-sheet" role="dialog" aria-modal="true">
        <header class="ed-picker-bar">
          <span class="ed-picker-name"><i class="fa-solid fa-sliders" aria-hidden="true"></i>${e(l)}</span>
          <span class="ed-picker-acts">
            <button type="button" data-act="close" title="${e(p("close","Close"))}"><i class="fa-solid fa-xmark"></i></button>
          </span>
        </header>
        <div class="ed-sheet-body">
          ${o.map(t=>`
            <div class="ed-sheet-group">
              <h3 class="ed-front-legend">${e(t.label)}</h3>
              <div class="ed-front-grid">
                ${t.fields.map(t=>{var a=c[t.key];return"toggle"===t.kind?`<label class="ed-f" data-key="${e(t.key)}">
                          <span class="ed-f-label">${e(t.label)}</span>
                          <button type="button" class="ed-f-toggle${!1===a?"":" is-on"}"
                            data-toggle="${e(t.key)}" role="switch"
                            aria-checked="${!1===a?"false":"true"}"></button>
                        </label>`:`<label class="ed-f${t.wide?" is-wide":""}" data-key="${e(t.key)}">
                        <span class="ed-f-label">${e(t.label)}</span>
                        <input class="ed-f-input" data-key="${e(t.key)}" spellcheck="false"
                          value="${e(null==a?"":String(a))}">
                      </label>`}).join("")}
              </div>
            </div>`).join("")}
        </div>
        <footer class="ed-picker-foot">
          <span class="ed-picker-hint">${e(p("sheet_hint","Leave everything empty for a plain picture."))}</span>
          <button type="button" class="ed-act ed-act-primary ed-sheet-ok">
            <i class="fa-solid fa-check" aria-hidden="true"></i><span>${e(p("apply","Apply"))}</span>
          </button>
        </footer>
      </section>`,!1),i=e=>{a||(a=!0,r.remove(),document.removeEventListener("keydown",d,!0),t(e))},d=e=>{"Escape"===e.key&&(e.preventDefault(),i(null))};r.addEventListener("click",e=>{if(e.target===r||e.target.closest('[data-act="close"]'))return i(null);var t=e.target.closest("[data-toggle]");t&&(e.preventDefault(),e=!t.classList.contains("is-on"),t.classList.toggle("is-on",e),t.setAttribute("aria-checked",e?"true":"false"))}),r.querySelector(".ed-sheet-ok").addEventListener("click",()=>{var e,t,a={};for(e of r.querySelectorAll(".ed-f-input"))a[e.dataset.key]=e.value.trim();for(t of r.querySelectorAll("[data-toggle]"))a[t.dataset.toggle]=t.classList.contains("is-on");i(a)}),document.addEventListener("keydown",d,!0),document.body.appendChild(r),s(r.querySelector(".ed-sheet"));var n=r.querySelector(".ed-f-input");n&&n.focus()})}function parentOf(e){var t=String(e).lastIndexOf("/");return t<0?"":e.slice(0,t)}function nameOf(e){return String(e).split("/").pop()}function openPicker(E,A={}){let C=E.t;return new Promise(t=>{let d=document.createElement("div"),n=(d.className="ed-picker-mask",d.innerHTML=`
      <section class="ed-picker" role="dialog" aria-modal="true">
        <header class="ed-picker-bar">
          <span class="ed-picker-name"><i class="fa-solid fa-images" aria-hidden="true"></i>${e(C("pick_title","Pictures"))}</span>
          <span class="ed-picker-acts">
            <button type="button" data-act="upload" title="${e(C("pick_upload","Add a picture"))}"><i class="fa-solid fa-arrow-up-from-bracket"></i></button>
            <button type="button" data-act="mkdir" title="${e(C("pick_mkdir","New folder"))}"><i class="fa-solid fa-folder-plus"></i></button>
            <button type="button" data-act="rename" title="${e(C("pick_rename","Rename"))}"><i class="fa-solid fa-i-cursor"></i></button>
            <button type="button" data-act="close" title="${e(C("close","Close"))}"><i class="fa-solid fa-xmark"></i></button>
          </span>
        </header>
        <div class="ed-picker-body">
          <div class="ed-picker-side">
            <label class="ed-picker-find">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <input class="ed-picker-search" spellcheck="false" placeholder="${e(C("pick_search","Search every folder"))}">
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
            <i class="fa-solid fa-check" aria-hidden="true"></i><span>${e(C("pick_use","Use this picture"))}</span>
          </button>
        </footer>
      </section>`,d.querySelector(".ed-picker-tree")),l=d.querySelector(".ed-picker-shot"),o=d.querySelector(".ed-picker-meta"),c=d.querySelector(".ed-picker-path"),p=d.querySelector(".ed-picker-ok"),f=d.querySelector(".ed-picker-search"),u=new Set([r]),h=[],m=A.current?String(A.current).replace(/^\//,"source/"):"",v="",k=!1;function g(){var e=(()=>{var e,t,a,r=new Map;for(e of h){var s=E.stage.resolve(e.path);r.set(s,Object.assign({},e,{path:s}))}for(t of E.stage.folders)r.has(t)||r.set(t,{path:t,type:"dir",fresh:!0});for(a of E.pending||[]){var i=E.stage.resolve(a.path);r.has(i)||r.set(i,{path:i,type:"file",staged:!0,size:a.bytes?a.bytes.byteLength:0})}return Array.from(r.values()).sort((e,t)=>e.type!==t.type?"dir"===e.type?-1:1:e.path.localeCompare(t.path))})();if(v){let t=v.toLowerCase();return e.filter(e=>"file"===e.type&&e.path.toLowerCase().includes(t)).slice(0,400)}return e.filter(e=>e.path!==r&&(e=parentOf(e.path),u.has(e)))}function y(){if(c.textContent=m?siteAddress(m):"",p.disabled=!m||!i.test(m),l.innerHTML="",o.textContent="",!m||!i.test(m))return o.textContent=C("pick_hint","Choose a picture, or drag one onto a folder to move it.");l.appendChild(a(siteAddress(m),"",E.pending)),E.observeImages&&E.observeImages();var e=E.stage.origin(m);o.textContent=e===m?m:e+"  →  "+m}function b(){var t;t=g(),n.innerHTML=t.length?t.map(t=>{var a=v?0:t.path.split("/").length-r.split("/").length-1,s="dir"===t.type?u.has(t.path)?"fa-folder-open":"fa-folder":"fa-image",i=v?t.path.replace(r+"/",""):nameOf(t.path);return`<div class="ed-picker-row" role="treeitem" draggable="true"
                        data-path="${e(t.path)}" data-type="${t.type}"
                        data-on="${t.path===m?"1":"0"}"
                        style="padding-left:${8+14*a}px">
                        <i class="fa-solid ${s}" aria-hidden="true"></i>
                        <span>${e(i)}</span>
                        ${t.staged?`<em class="ed-picker-flag">${e(C("pick_new","new"))}</em>`:""}
                        ${t.fresh?`<em class="ed-picker-flag">${e(C("pick_unsaved","unsaved"))}</em>`:""}
                      </div>`}).join(""):`<p class="ed-picker-empty">${e(C("pick_none","Nothing here yet"))}</p>`,y()}async function w(e,t){e=window.prompt(C("ask_"+e,"mkdir"===e?"Folder name":"New name"),t||"");return null==e?null:e.trim()}function $(e){k||(k=!0,d.remove(),document.removeEventListener("keydown",L,!0),t(e))}function L(e){"Escape"===e.key&&(e.preventDefault(),$(null))}d.addEventListener("click",t=>{if(t.target===d)return $(null);let e=t.target.closest("[data-act]");if(e)t.preventDefault(),(async e=>{if("close"===e)return $(null);if("upload"===e){let e=await new Promise(t=>{let a=document.createElement("input");a.type="file",a.accept="image/*",a.hidden=!0,document.body.appendChild(a),a.addEventListener("change",()=>{var e=a.files&&a.files[0];a.remove(),t(e||null)}),a.click()});return e?(t=await E.upload(e,m&&!i.test(m)?m:parentOf(m)||r))?(m=E.stage.resolve(t.path),b()):void 0:void 0}if("mkdir"===e){let e=m&&!i.test(m)?m:parentOf(m)||r,t=await w("mkdir","");return t?(E.stage.folder(e+"/"+t.replace(/[/\\]/g,"-")),u.add(e),b()):void 0}if("rename"===e&&m&&m!==r){let e=await w("rename",nameOf(m));var t;if(e&&e!==nameOf(m))return t=parentOf(m)+"/"+e.replace(/[/\\]/g,"-"),E.stage.move(m,t),m=t,b()}})(e.dataset.act);else{var a=t.target.closest(".ed-picker-row");if(a){t.preventDefault();let e=a.dataset.path;return"dir"===a.dataset.type&&(u.has(e)?u.delete(e):u.add(e)),m=e,b()}}}),d.addEventListener("dblclick",e=>{e=e.target.closest(".ed-picker-row");e&&"file"===e.dataset.type&&$({path:e.dataset.path,site:siteAddress(e.dataset.path)})}),p.addEventListener("click",()=>{m&&i.test(m)&&$({path:m,site:siteAddress(m)})}),f.addEventListener("input",()=>{v=f.value.trim(),b()});let S="";n.addEventListener("dragstart",e=>{var t=e.target.closest(".ed-picker-row");t&&(S=t.dataset.path,e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",S))}),n.addEventListener("dragover",e=>{var t=e.target.closest('.ed-picker-row[data-type="dir"]');t&&S&&t.dataset.path!==S&&(e.preventDefault(),e.dataTransfer.dropEffect="move",t.dataset.drop="1")}),n.addEventListener("dragleave",e=>{e=e.target.closest(".ed-picker-row");e&&delete e.dataset.drop}),n.addEventListener("drop",e=>{var t=e.target.closest('.ed-picker-row[data-type="dir"]');if(t&&S){if(e.preventDefault(),delete t.dataset.drop,!(t.dataset.path+"/").startsWith(S+"/")){let e=t.dataset.path+"/"+nameOf(S);E.stage.move(S,e),m===S&&(m=e)}S="",u.add(t.dataset.path),b()}}),n.addEventListener("dragend",()=>{S="";for(var e of n.querySelectorAll("[data-drop]"))delete e.dataset.drop}),document.addEventListener("keydown",L,!0),document.body.appendChild(d),s(d.querySelector(".ed-picker")),n.innerHTML=`<p class="ed-picker-empty">${e(C("pick_loading","Reading the repository…"))}</p>`,y(),loadTree().then(e=>{h=e;let t=parentOf(m);for(;t&&t.startsWith(r);)u.add(t),t=parentOf(t);b(),f.focus()})})}export{siteAddress,loadTree,forgetTree,createStage,openSheet,openPicker};