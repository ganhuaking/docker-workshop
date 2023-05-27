# Portainer

## 安裝

```bash
$ docker volume create portainer_data
$ docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```
如果想避開 host 的 9000 port，可以改用 `-p 9001:9000 `，之後開啟 `http://localhost:9001/#/home`

## 快速瀏覽功能

### 開始使用
- 註冊，首次使用需要註冊管理員帳號，之後可以再新增其他權限的 user 與 team
- 選擇 Endpoints

### Host
- Host details
- Engine details

### Events, Volumes, Network

### Images
Build image
- Web editor
- Upload
- URL

### Containers
- Container details
- Logs
- Inspect
- Console

### Stacks
- Docker Compose

### Users & Team
- Create user and team
- Endpoints - manage access
