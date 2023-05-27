import{_ as s,o as a,c as e,O as n}from"./chunks/framework.1b1a3dad.js";const A=JSON.parse('{"title":"Multi-stage Build","description":"","frontmatter":{},"headers":[],"relativePath":"multi-stage-build.md","filePath":"multi-stage-build.md"}'),l={name:"multi-stage-build.md"},p=n(`<h1 id="multi-stage-build" tabindex="-1">Multi-stage Build <a class="header-anchor" href="#multi-stage-build" aria-label="Permalink to &quot;Multi-stage Build&quot;">​</a></h1><blockquote><p><strong>注意</strong>：這功能要 Docker 17.05+ Daemon 和 Client 才有支援。</p></blockquote><p>建置 Docker Image 時，一般來說，會有兩種應用情境，一個是大家所熟知的 <em>run time</em>，也就是運行環境。另一個則是 <em>build time</em>（這裡的 <code>Build</code> 指的是 Continuous Integration 所提到的 Build），建置環境。通常執行完 Build 後，會產生 Artifacts，如佈署軟體包或是測試報告等。其中佈署軟體包，通常會被設計成可以直接放到運行環境上直接執行。上述情境所構建出來的依賴鏈如下：</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">運行環境 &lt;- 佈署軟體包 &lt;- 建置環境</span></span></code></pre></div><p>因此，要建置<em>運行環境</em>的 Docker Image 時會依賴<em>建置環境</em>，而這兩個環境所需要的依賴或環境通常差異很大，在沒有 multi-stage build 這個功能前，通常都是寫兩個 Dockerfile 分別建置兩種不同的環境。</p><p>但分成兩個 Dockerfile 最大的問題在於：Artifacts 如何從建置環境的 container，交付給 host，再由 host 使用 Artifacts 建置運行環境的 image？</p><p><a href="https://docs.docker.com/develop/develop-images/multistage-build/#before-multi-stage-builds" target="_blank" rel="noreferrer">官網說明</a>是使用下列兩個檔案，加一個建置腳本 <code>build.sh</code> 處理上述問題，來達成目的：</p><ul><li><code>Dockerfile</code></li><li><code>Dockerfile.build</code></li></ul><p>而 Rancher 則是另外寫了一個工具 <a href="https://github.com/rancher/dapper" target="_blank" rel="noreferrer">Dapper</a> 來處理這個問題。它的檔案則如下：</p><ul><li><code>Dockerfile</code></li><li><code>Dockerfile.dapper</code></li></ul><p>現在這些做法，都可以改用 <strong>Multi-stage Build</strong> 來實現。</p><h2 id="範例" tabindex="-1">範例 <a class="header-anchor" href="#範例" aria-label="Permalink to &quot;範例&quot;">​</a></h2><ul><li><a href="https://github.com/VdustR/docker-multi-stage-vue-demo" target="_blank" rel="noreferrer">docker-vue-demo</a> | @VdustR</li><li><a href="https://github.com/Joseph7451797/cra-docker-example" target="_blank" rel="noreferrer">Create-React-App With Docker</a> | @Joseph7451797</li></ul><h3 id="laravel-eloquent-generator" tabindex="-1">Laravel Eloquent Generator <a class="header-anchor" href="#laravel-eloquent-generator" aria-label="Permalink to &quot;Laravel Eloquent Generator&quot;">​</a></h3><p><a href="https://github.com/104corp/laravel-eloquent-generator" target="_blank" rel="noreferrer">Laravel Eloquent Generator</a> 是一個 CLI 應用程式，它可以依既有的資料庫來產生 Eloquent ORM Model 檔。原本 <a href="https://github.com/104corp/laravel-eloquent-generator/blob/14479a607317c8806180eb7c450d94332c94a829/Dockerfile" target="_blank" rel="noreferrer"><code>Dockerfile</code></a> 的寫法如下：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> php:5.5-alpine</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> docker-php-ext-install -j $(getconf _NPROCESSORS_ONLN) pdo_mysql</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">COPY</span><span style="color:#A6ACCD;"> ./eloquent-generator.phar /usr/local/bin/</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">WORKDIR</span><span style="color:#A6ACCD;"> /source</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">ENTRYPOINT</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;php&quot;</span><span style="color:#A6ACCD;">, </span><span style="color:#C3E88D;">&quot;/usr/local/bin/eloquent-generator.phar&quot;</span><span style="color:#A6ACCD;">]</span></span>
<span class="line"><span style="color:#F78C6C;">CMD</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;--&quot;</span><span style="color:#A6ACCD;">]</span></span></code></pre></div><p>而它原本是使用 Dapper 產生 Artifacts，<a href="https://github.com/104corp/laravel-eloquent-generator/blob/14479a607317c8806180eb7c450d94332c94a829/Dockerfile.dapper" target="_blank" rel="noreferrer"><code>Dockerfile.dapper</code></a> 如下：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> 104corp/php-testing:5.5</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">ENV</span><span style="color:#A6ACCD;"> SOURCE_ROOT /source</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># Set directory</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> mkdir -p \${SOURCE_ROOT}</span></span>
<span class="line"><span style="color:#F78C6C;">WORKDIR</span><span style="color:#A6ACCD;"> \${SOURCE_ROOT}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># Copy composer.json</span></span>
<span class="line"><span style="color:#F78C6C;">COPY</span><span style="color:#A6ACCD;"> composer.json .</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># Install packages without cache</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> set -xe &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">        php -n \${COMPOSER_PATH} install &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">        composer clear-cache</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># Dapper env</span></span>
<span class="line"><span style="color:#F78C6C;">ENV</span><span style="color:#A6ACCD;"> DAPPER_SOURCE \${SOURCE_ROOT}</span></span>
<span class="line"><span style="color:#F78C6C;">ENV</span><span style="color:#A6ACCD;"> DAPPER_OUTPUT ./build ./vendor ./composer.lock</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">ENTRYPOINT</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;./scripts/entry&quot;</span><span style="color:#A6ACCD;">]</span></span>
<span class="line"><span style="color:#F78C6C;">CMD</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;ci&quot;</span><span style="color:#A6ACCD;">]</span></span></code></pre></div><p>這個專案改寫成 multi-stage build 並不困難，原則上 Dapper 的環境即上面所定義的，而 Dapper container 上做的事在 scripts 裡都能找得到，因此移植到新的 Dockerfile 上是容易的，下面是<a href="https://github.com/104corp/laravel-eloquent-generator/blob/e6258b177b91176bd631682e940e3e4c0f1adb4e/Dockerfile" target="_blank" rel="noreferrer">最後的結果</a>：</p><div class="language-dockerfile"><button title="Copy Code" class="copy"></button><span class="lang">dockerfile</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> 104corp/php-testing:7.1 </span><span style="color:#F78C6C;">AS</span><span style="color:#A6ACCD;"> builder</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">ARG</span><span style="color:#A6ACCD;"> VERSION=dev-master</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> apk add --no-cache make</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> mkdir -p /source</span></span>
<span class="line"><span style="color:#F78C6C;">WORKDIR</span><span style="color:#A6ACCD;"> /source</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">COPY</span><span style="color:#A6ACCD;"> composer.json .</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> composer install</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">COPY</span><span style="color:#A6ACCD;"> src .</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> php vendor/bin/phpcs</span></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> php vendor/bin/phpunit</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> make eloquent-generator.phar VERSION=\${VERSION}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">FROM</span><span style="color:#A6ACCD;"> php:7.1-alpine</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">RUN</span><span style="color:#A6ACCD;"> docker-php-ext-install -j $(getconf _NPROCESSORS_ONLN) pdo_mysql</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">COPY</span><span style="color:#A6ACCD;"> --from=builder /source/eloquent-generator.phar /usr/local/bin/</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">WORKDIR</span><span style="color:#A6ACCD;"> /source</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F78C6C;">ENTRYPOINT</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;php&quot;</span><span style="color:#A6ACCD;">, </span><span style="color:#C3E88D;">&quot;/usr/local/bin/eloquent-generator.phar&quot;</span><span style="color:#A6ACCD;">]</span></span>
<span class="line"><span style="color:#F78C6C;">CMD</span><span style="color:#A6ACCD;"> [</span><span style="color:#C3E88D;">&quot;--&quot;</span><span style="color:#A6ACCD;">]</span></span></code></pre></div><h2 id="references" tabindex="-1">References <a class="header-anchor" href="#references" aria-label="Permalink to &quot;References&quot;">​</a></h2><ul><li><a href="https://docs.docker.com/develop/develop-images/multistage-build/" target="_blank" rel="noreferrer">Use multi-stage builds</a> | Docker Documentation</li><li><a href="https://docs.google.com/presentation/d/1L60Upsi1JscrcIPHBVGbaIUjmROFBxG2_B31Ri4rS10" target="_blank" rel="noreferrer">應用 Docker 到 CI 世界</a> | <a href="https://github.com/mileschou" target="_blank" rel="noreferrer">MilesChou</a></li></ul>`,22),o=[p];function t(r,c,i,C,u,d){return a(),e("div",null,o)}const h=s(l,[["render",t]]);export{A as __pageData,h as default};
