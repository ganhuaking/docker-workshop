# Optimizing Dockerfile

最佳化 Dockerfile 通常指幾種面向：

1.  最佳化 build 的過程
    *   過程越快越好
    *   有錯越早讓開發者知道越好
2.  最佳化最終 image 的結果
    *   容量越小越好
    *   層數（layer）越少越好
3.  最佳化 Dockerfile 的內容，也就是 coding style

> 官網文件也有一篇在講 [Dockerfile 的最佳實踐](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)，也可以參考看看

這個文件會拿幾個修改範例來讓大家知道，如何最佳化 Dockerfile。

## 多個 RUN 指令合併

下面是一個不好的範例：

```dockerfile
FROM alpine

RUN apk update
RUN apk add python
RUN apk add make
RUN apk add g++
```

原因有兩個：第一，這些 run 指令可以合併成一層；第二 update 或 add 的安裝檔，有時會被 cache 下來，這會增加無用的容量。

比較好的範例如下：

```dockerfile
FROM alpine

RUN apk add --no-cache python make g++
```

> apk 提供 `--no-cache` 參數將不會使用任何快取功能。

接著考慮可維護性，會改成如下：

```dockerfile
FROM alpine

RUN apk add --no-cache \
        python \
        make \
        g++
```
