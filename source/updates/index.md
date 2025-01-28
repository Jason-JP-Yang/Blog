---
title: "Jason Yang's Blog Updates Log"
cover: images/cover-img/Blog_mutidevice.png
thumbnail: images/cover-img/Blog_mutidevice.png
excerpt: "English Vocabulary Collecting" 
date: 2024/7/7 8:38:00
updated: 2024/7/7 16:20:00
---
# Jason Yang's Blog Updates Log
![](images/cover-img/Blog_mutidevice.png)

<style>
/* Timeline Container */
.timeline {
  margin: 20px auto;
  padding: 20px;
}

/* timelineCARD container */
.timelineCARD {
  position: relative;
}

/* setting padding based on even or odd */
.timelineCARD:nth-child(odd) {
  padding: 30px 0 30px 30px;
}
.timelineCARD:nth-child(even) {
  padding: 30px 30px 30px 0;
}
/* Global ::before */
.timelineCARD::before {
  content: "";
  position: absolute;
  width: 50%;
  border: solid orangered;
}

/* Setting the border of top, bottom, left */
.timelineCARD:nth-child(odd)::before {
  left: 0px;
  top: -4.5px;
  bottom: -4.5px;
  border-width: 5px 0 5px 5px;
  border-radius: 50px 0 0 50px;
}

/* Setting the border of top, bottom, right */
.timelineCARD:nth-child(even)::before {
  right: 0;
  top: 0;
  bottom: 0;
  border-width: 5px 5px 5px 0;
  border-radius: 0 50px 50px 0;
}

/* Removing the border if it is the first timelineCARD */
.timelineCARD:first-child::before {
  border-top: 0;
  border-top-left-radius: 0;
}

/* Removing the border if it is the last timelineCARD  and it's odd */
.timelineCARD:last-child:nth-child(odd)::before {
  border-bottom: 0;
  border-bottom-left-radius: 0;
}

/* Removing the border if it is the last timelineCARD  and it's even */
.timelineCARD:last-child:nth-child(even)::before {
  border-bottom: 0;
  border-bottom-right-radius: 0;
}

/* Information about the timeline */
.info {
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  color: gray;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0px 0px 8px var(--default-text-color);
}

/* Title of the timelineCARD */
.title {
  color: orangered;
  position: relative;
}

/* Timeline dot  */
.title::before {
  content: "";
  box-sizing: initial;
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 999px;
  border: 3px solid orangered;
}

/* text right if the timelineCARD is even  */
.timelineCARD:nth-child(even) > .info > .title {
  text-align: right;
}

/* setting dot to the left if the timelineCARD is odd */
.timelineCARD:nth-child(odd) > .info > .title::before {
  left: -45px;
}

/* setting dot to the right if the timelineCARD is odd */
.timelineCARD:nth-child(even) > .info > .title::before {
  right: -45px;
}
</style>

<div class="timeline">
  <div class="outer">
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2025/1/28 Hexo Redefine V282更新</h3>
        <p>Hexo Redefine 迎来了一次超大的更新！🎉 版本号直接跳到了 <span style="background:rgba(240, 107, 5, 0.2)">2.8.2</span>，这次更新可是有不少亮点哦~</p>
        <p>首先，动效变得更丝滑了，简直像吃了德芙一样顺滑！🍫 另外，现在你可以自定义 Opengraph 图片了，只需要在配置文件的 `globals.open_graph` 里动动手脚就行。还有，Markdown 里的删除线（del）也变得更酷了，加了个遮罩效果，感谢 @QSlotus 的贡献！🎨（配置项在 `articles.delete_mask` 里，想用就开~）</p>
        <p>最后，清理了一下“历史遗留问题”，删掉了没啥用的 Discussion 讨论区，顺便修了几篇烂尾的文章😂。总之，这次更新就是为了让你用得更爽！😉</p>
      </div>
    </div>
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2024/7/16 常规更新</h3>
        <p>添加了新的文章 —— 人物传记：<a href="/2024/07/16/闻一多：宁鸣而死,不默而生">闻一多:宁鸣而死，不默而生</a></p>
        <p><strong>以后将不会记录常规更新的内容！！！只记录特殊更新的内容。常规更新已经处于稳定阶段，不再需要关注。</strong></p>
      </div>
    </div>
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2024/7/15 常规更新</h3>
        <ol>
        <li>重新整理了<strong>Categories &amp; Tags 分类与标签页面</strong>，更加简洁，文章更好寻找了！！！</li>
        <li>为更多页面添加了评论功能</li>
        <li>新的博客：<strong><a href="/2024/07/15/好词好句摘录%2001%20-%2010">好词好句摘录 01-10</a></strong>
        </ol>
      </div>
    </div>
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2024/7/14 Special Updates</h3>
        <p><em><strong>网站从Redefine版本2.6.0升级到了<span style="background:#fff88f">Redefine版本2.6.4</span></strong></em></p>
        <h3 id="修复了网页已经存在的BUG"><a href="#修复了网页已经存在的BUG" class="headerlink" title="修复了网页已经存在的BUG"></a>修复了网页已经存在的BUG</h3><p>因为在此之前本网站custom domain使用Cloudflare DNS服务，Cloudflare默认自动开启CDN缓存服务且禁用网页中的preloader项目，导致遇到如下问题：<br><code>A preload for &#39;&lt;URL&gt;&#39; is found, but is not used because the request credentials mode does not match. Consider taking a look at crossorigin attribute.</code><br><code>The resource &lt;URL&gt; was preloaded using link preload but not used within a few seconds from the window&#39;s load event. Please make sure it has an appropriate &quot;as&quot; value and it is preloaded intentionally.</code><br>具体体现状况如下：博客上线的时间看不到、Giscus不能在新进入一个页面的时候load出来一点要reload一次网页才行<br><b><span style="background:#b1ffff">解决方案</span></b>：弃用Cloudflare DNS提供的域名托管服务，改用原域名提供商NamesiloDNS的方案，采用Let’s Encrypt提供的HTTPS (SSL)加密认证。在更换DNS提供商的过程中网站遇到了21小时的掉线，深感抱歉。</p>
        <h3 id="添加了新的功能"><a href="#添加了新的功能" class="headerlink" title="添加了新的功能"></a>添加了新的功能</h3><p><strong>本网站现在支持评论功能</strong>，该项功能于2024&#x2F;7&#x2F;15完成基本测试已经进入稳定状态，由Giscus提供服务。<span style="background:#fff88f">各位可以在开启评论功能的博客文章下各抒己见</span>，支持Markdown书写。评论前需登录Github并授权Giscus OAth App使用你的账户发表Discussion，本网站不会获取到任何有关你账户的隐私信息，有关于授权Giscus OAth App的隐私条款，将在登录前提前告知。</p>
      </div>
    </div>
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2024/7/7 常规更新</h3>
        <ol>
        <li><span style="background:#fff88f">更新了Updates Log</span>：让本网站的更新记录一目了然（从2024&#x2F;7&#x2F;6开始记录）</li>
        <li><span style="background:#fff88f">常规更新内容</span>：<ol>
        <li>Masonry <a href="/masonry/masonry-links">贵州天文访问团 DAY3 探访中国天眼</a> 菲林相机照片</li>
        <li>Blog 贵州天文访问团 DAY4-5 学习经历及感受</li>
        </ol>
        </li>
        </ol>
      </div>
    </div>
    <div class="timelineCARD">
      <div class="info">
        <h3 class="title">2024/7/6 Jason Yang's Blog 博客Issue解决报告</h3>
        <p><strong>​Issue for solw loading of mansory</strong> <em><strong>#001</strong></em><br>​<span style="background:#fff88f">该问题将不会解决（六个月内）</span><br>​根据本人的调查：Masonry访问界面慢的原因主要在于包含太多高画质照片<br>​预想解决方案：<br>​1. <span style="background:#fff88f">LazyLoad</span>：根据调查在DOM content Loading架构下不适用<br>​2. <span style="background:#fff88f">Progressive Decode</span>：已经被谷歌浏览器被除 在不受支持的浏览器上展示性更差 反而会失去原图带有的高色彩范围效果<br>​3. <span style="background:#fff88f">IMGminifier</span>：会展示给观众更好的观看效果包括图片的色彩范围、清晰度以及亮度范围，在受支持的设备上下载后可以以HDR 10+形式查看，本人不愿意压缩图片<br>​4. <span style="background:#fff88f">缩略图展示</span>：要达成这种展示效果需要重构那和本人实在不想（在贵州试过一次，脑袋爆炸，编程界有句古话：改别人的不如自己重写来的快）<br>​总结目前的情况：<br>​在各类情况下进行测试，平均加载该页面需要两至三分钟，传输数据180至200MB，建议各位在良好的WiFi环境下访问。本问题将在至少六个月内不作出任何更改和调查<br>​如各位有任何其他意见欢迎在GitHub或者直接在评论区提出<br>​<span style="background:#b1ffff">为保证本网站的良好发展，将出台以下常规更新规则： 日常168个小时更新一次，假期96个小时更新一次，考试周及其前两周不更新。</span></p>
      </div>
    </div>
  </div>
</div>
<div class="comment-container px-2 sm:px-6 md:px-8 pb-8">
                <div class="comments-container mt-10 w-full ">
    <div id="comment-anchor" class="w-full h-2.5"></div>
    <div class="comment-area-title w-full my-1.5 md:my-2.5 text-xl md:text-3xl font-bold">
        Comments 评论
    </div>     
    <div id="giscus-container"></div>
    <script data-swup-reload-script defer>
        async function loadGiscus() {
            const giscusConfig = {
                'src': 'https://giscus.app/client.js',
                'data-repo': 'Jason-JP-Yang/Blog',
                'data-repo-id': 'R_kgDOLICk3w',
                'data-category': 'General',
                'data-category-id': 'DIC_kwDOLICk384Cgwf1',
                'data-mapping': 'url',
                'data-strict': '1',
                'data-reactions-enabled': '1',
                'data-emit-metadata': '1',
                'data-theme': 'preferred_color_scheme',
                'data-lang': 'en',
                'data-input-position': 'top',
                'data-loading': 'lazy',
                'crossorigin': 'anonymous',
                'async': true
            }
            const giscusScript = document.createElement('script');
            for (const key in giscusConfig) {
                giscusScript.setAttribute(key, giscusConfig[key]);
            }
            document.getElementById('giscus-container').appendChild(giscusScript);
        }
        if ('true') {
            let loadGiscusTimeout = setTimeout(() => {
                loadGiscus();
                clearTimeout(loadGiscusTimeout);
            }, 1000);
        } else {
            document.addEventListener('DOMContentLoaded', loadGiscus);
        }
    </script>
</div>
</div>