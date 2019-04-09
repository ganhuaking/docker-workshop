# Docker 基本知識

## Docker 的原理

## Docker 與虛擬機（VM）比較

## 概念

* *Image* - 映像檔
* *Container* - 容器
* *Repository* - 倉庫

## 基本指令

| 指令 | 功能 |
| --- | --- |
| docker pull | 下載映像檔 |
| docker images | 看目前有哪些映像檔 |
| docker rmi | 刪除映像檔 |
| docker run | 建立容器並執行指令 |
| docker start/stop/restart | 操作容器 |
| docker ps | 看目前有啟動哪些容器 |
| docker rm | 刪除容器 |

### Hello world

```
$ docker run -d nginx
$ docker images
$ docker ps
$ docker stop
$ docker rm
```

### Port Forwarding

從本機的 port 轉到把 container 上

### Run Command

在 container 的環境裡，執行指令

### Volume Mapping

把 host 的資料夾，映射到 container 裡

### Environment

環境變數

### Link

連結 container
