import{_ as a,o as e,c as s,O as l}from"./chunks/framework.1b1a3dad.js";const f=JSON.parse('{"title":"Optimizing Dockerfile","description":"","frontmatter":{},"headers":[],"relativePath":"optimizing-dockerfile.md","filePath":"optimizing-dockerfile.md"}'),n={name:"optimizing-dockerfile.md"},p=l(`<h1 id="optimizing-dockerfile" tabindex="-1">Optimizing Dockerfile <a class="header-anchor" href="#optimizing-dockerfile" aria-label="Permalink to &quot;Optimizing Dockerfile&quot;">​</a></h1><p>最佳化 Dockerfile 通常指幾種面向：</p><ol><li>最佳化 build 的過程 <ul><li>過程越快越好</li><li>有錯越早讓開發者知道越好</li></ul></li><li>最佳化最終 image 的結果 <ul><li>容量越小越好</li><li>層數（layer）越少越好</li></ul></li><li>最佳化 Dockerfile 的內容，也就是 coding style</li></ol><blockquote><p>官網文件也有一篇在講 <a href="https://docs.docker.com/develop/develop-images/dockerfile_best-practices/" target="_blank" rel="noreferrer">Dockerfile 的最佳實踐</a>，也可以參考看看</p></blockquote><p>這個文件會拿幾個修改範例來讓大家知道，如何最佳化 Dockerfile。</p><h2 id="多個-run-指令合併" tabindex="-1">多個 RUN 指令合併 <a class="header-anchor" href="#多個-run-指令合併" aria-label="Permalink to &quot;多個 RUN 指令合併&quot;">​</a></h2><p>下面是一個不好的範例：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> alpine</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk update</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add python</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add make</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add g++</span></span></code></pre></div><p>原因有兩個：第一，這些 run 指令可以合併成一層；第二 update 或 add 的安裝檔，有時會被 cache 下來，這會增加無用的容量。</p><p>比較好的範例如下：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> alpine</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add --no-cache python make g++</span></span></code></pre></div><blockquote><p>apk 提供 <code>--no-cache</code> 參數將不會使用任何快取功能。</p></blockquote><p>接著考慮可維護性，會改成如下：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> alpine</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add --no-cache \\</span></span>
<span class="line"><span style="color:#A6ACCD;">        python \\</span></span>
<span class="line"><span style="color:#A6ACCD;">        make \\</span></span>
<span class="line"><span style="color:#A6ACCD;">        g++</span></span></code></pre></div>`,14),o=[p];function i(c,t,r,d,C,k){return e(),s("div",null,o)}const m=a(n,[["render",i]]);export{f as __pageData,m as default};
