# Multi-stage Build

> **注意**：這功能要 Docker 17.05+ Daemon 和 Client 才有支援。

建置 Docker Image 時，一般來說，會有兩種應用情境，一個是大家所熟知的 *run time*，也就是運行環境。另一個則是 *build time*（這裡的 `Build` 指的是 Continuous Integration 所提到的 Build），建置環境。通常執行完 Build 後，會產生 Artifacts，如佈署軟體包或是測試報告等。其中佈署軟體包，通常會被設計成可以直接放到運行環境上直接執行。上述情境所構建出來的依賴鏈如下：

```
運行環境 <- 佈署軟體包 <- 建置環境
```

因此，要建置*運行環境*的 Docker Image 時會依賴*建置環境*，而這兩個環境所需要的依賴或環境通常差異很大，在沒有 multi-stage build 這個功能前，通常都是寫兩個 Dockerfile 分別建置兩種不同的環境。

但分成兩個 Dockerfile 最大的問題在於：Artifacts 如何從建置環境的 container，交付給 host，再由 host 使用 Artifacts 建置運行環境的 image？

[官網說明](https://docs.docker.com/develop/develop-images/multistage-build/#before-multi-stage-builds)是使用下列兩個檔案，加一個建置腳本 `build.sh` 處理上述問題，來達成目的：

* `Dockerfile`
* `Dockerfile.build`

而 Rancher 則是另外寫了一個工具 [Dapper](https://github.com/rancher/dapper) 來處理這個問題。它的檔案則如下：

* `Dockerfile`
* `Dockerfile.dapper`

現在這些做法，都可以改用 **Multi-stage Build** 來實現。

## 範例

* [docker-vue-demo](https://github.com/VdustR/docker-multi-stage-vue-demo) | @VdustR
* [Create-React-App With Docker](https://github.com/Joseph7451797/cra-docker-example) | @Joseph7451797

### Laravel Eloquent Generator

[Laravel Eloquent Generator](https://github.com/104corp/laravel-eloquent-generator) 是一個 CLI 應用程式，它可以依既有的資料庫來產生 Eloquent ORM Model 檔。原本 [`Dockerfile`](https://github.com/104corp/laravel-eloquent-generator/blob/14479a607317c8806180eb7c450d94332c94a829/Dockerfile) 的寫法如下：

```dockerfile
FROM php:5.5-alpine

RUN docker-php-ext-install -j $(getconf _NPROCESSORS_ONLN) pdo_mysql

COPY ./eloquent-generator.phar /usr/local/bin/

WORKDIR /source

ENTRYPOINT ["php", "/usr/local/bin/eloquent-generator.phar"]
CMD ["--"]
```

而它原本是使用 Dapper 產生 Artifacts，[`Dockerfile.dapper`](https://github.com/104corp/laravel-eloquent-generator/blob/14479a607317c8806180eb7c450d94332c94a829/Dockerfile.dapper) 如下：

```dockerfile
FROM 104corp/php-testing:5.5

ENV SOURCE_ROOT /source

# Set directory
RUN mkdir -p ${SOURCE_ROOT}
WORKDIR ${SOURCE_ROOT}

# Copy composer.json
COPY composer.json .

# Install packages without cache
RUN set -xe && \
        php -n ${COMPOSER_PATH} install && \
        composer clear-cache

# Dapper env
ENV DAPPER_SOURCE ${SOURCE_ROOT}
ENV DAPPER_OUTPUT ./build ./vendor ./composer.lock

ENTRYPOINT ["./scripts/entry"]
CMD ["ci"]
```

這個專案改寫成 multi-stage build 並不困難，原則上 Dapper 的環境即上面所定義的，而 Dapper container 上做的事在 scripts 裡都能找得到，因此移植到新的 Dockerfile 上是容易的，下面是[最後的結果](https://github.com/104corp/laravel-eloquent-generator/blob/e6258b177b91176bd631682e940e3e4c0f1adb4e/Dockerfile)：

```dockerfile
FROM 104corp/php-testing:7.1 AS builder

ARG VERSION=dev-master

RUN apk add --no-cache make

RUN mkdir -p /source
WORKDIR /source

COPY composer.json .
RUN composer install

COPY src .

RUN php vendor/bin/phpcs
RUN php vendor/bin/phpunit

RUN make eloquent-generator.phar VERSION=${VERSION}

FROM php:7.1-alpine

RUN docker-php-ext-install -j $(getconf _NPROCESSORS_ONLN) pdo_mysql

COPY --from=builder /source/eloquent-generator.phar /usr/local/bin/

WORKDIR /source

ENTRYPOINT ["php", "/usr/local/bin/eloquent-generator.phar"]
CMD ["--"]
```  

## References

* [Use multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/) | Docker Documentation
* [應用 Docker 到 CI 世界](https://docs.google.com/presentation/d/1L60Upsi1JscrcIPHBVGbaIUjmROFBxG2_B31Ri4rS10) | [MilesChou](https://github.com/mileschou)
