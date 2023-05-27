# Docker Build

## Docker Image Concept

* 採用 [Union 檔案系統](https://philipzheng.gitbooks.io/docker_practice/content/underly/ufs.html)
* 由 initial commit 開始，一層一層堆疊檔案系統
* 每一層的 commit 都視同是 Image
* 使用 `docker run` 可由 Image 產生 Container
* 使用 `docker commit` 可由 Container 產生 Image
* 使用 `docker build` 可由 Dockerfile 產生 Image

Build 的過程，就是不斷的 `docker run` 與 `docker commit`

## Docker Build Workshop

寫一個 Dockerfile 的順序如下：

1.  一開始準備一個可以成功 build 的 Dockerfile
2.  懶人可以利用一下 Makefile 和 Docker Compose
3.  撰寫 Dockerfile 三循環
    1.  新增 Dockerfile 指令，包括安裝服務、修改服務設定、設定 Docker 參數等
    2.  執行 Build ，並產生 Container 驗證是否正確
    3.  優化 Dockerfile

以下會用上面的方法，來描述寫 Dockerfile 的過程。

### Example

什麼是一定會成功執行的 Dockerfile？其實只要 FROM 存在的 image 即可。

如 Golang 專案我們可以這樣寫：

```dockerfile
FROM golang:alpine
```

接著可以使用 `docker build` 與 `docker run` 確定該 image 是可以正常執行，且內容是如我們所想的

```
docker build -t example .
docker run -it --rm example sh
/go #
```

> build 與 run 的過程，可以使用 [Makefile](https://gist.github.com/MilesChou/c278f180b2c14af44bc752cdb437ab24) 來簡化

#### 調整路徑

一開始這個路徑可能不是我們所想要，所以調整如下：

```dockerfile
RUN mkdir -p /source
WORKDIR /source
```

執行結果如下：

```
docker run -it --rm example sh
/source #
```

#### 確認環境參數

因現有專案使用 `go mod` 管理依賴，因此要確認環境變數是否有正確設定。預設 golang image 是沒有打開的，所以要額外設定：

```dockerfile
ENV GO111MODULE on
```

#### 複製專案程式與建置

接著就可以把程式複製進 `/source` 裡。範例如下：

```dockerfile
COPY src .
RUN go mod download
```

這裡執行會遇到一個問題：沒有 git，因為 `go mod download` 需要 git，因此我們得先為環境安裝 git 之後再安裝依賴。

```dockerfile
RUN apk add --no-cache git
COPY . .
RUN go mod download
```

#### 設定 ENTRYPOINT

最後設定執行程式的 `ENTRYPOINT` 即可：

```dockerfile
ENTRYPOINT ["go", "run", "main.go"]
```

#### 整理 Dockerfile

Dockerfile 在描述環境是如何建置的，所以在撰寫時，也是要有一定的順序，才會讓閱讀的人好理解；另一個考量則是，越不容易變動的描述放越上面，這樣才能有效利用 cache 來加速建置：

```dockerfile
FROM golang:alpine

# 環境設定會放最一開始
ENV GO111MODULE on

# 安裝建置依賴程式
RUN apk add --no-cache git

# 準備環境
RUN mkdir -p /source
WORKDIR /source

# 複製程式與建置
COPY . .
RUN go mod download

ENTRYPOINT ["go", "run", "main.go"]
```

## References

* [Docker Build](https://docs.google.com/presentation/d/1OrcP6FKFpLwmzPhmFH8-O9SHJEyu-_K69tPw2gqqsHs) | Miles
* [管理貨櫃的碼頭工人－－ Docker （ 2/3 ）](https://ithelp.ithome.com.tw/articles/10186279) |  CI 從入門到入坑
