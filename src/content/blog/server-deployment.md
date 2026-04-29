---
title: "服务器部署与运维实操笔记"
description: "从选购服务器到日常运维，记录实际项目部署过程中积累的经验，包括多项目部署、systemd 服务管理、排错方法。"
pubDate: 2026-04-22
tags: ["服务器", "部署", "运维", "Linux"]
category: "学习"
---

在实际项目部署的过程中踩了不少坑，把经验记录下来，方便以后查阅。

---

## 服务器怎么选

云服务器就是一台远程电脑，7x24 小时运行，通过公网 IP 随时访问。腾讯云的轻量应用服务器对个人和小团队来说性价比最高：

| 对比 | 轻量应用服务器 | CVM 云服务器 |
|------|--------------|------------|
| 定位 | 简单易用，适合小项目 | 灵活可控，适合企业级 |
| 带宽 | 包含固定带宽 | 按量或按带宽计费 |
| 价格 | 活动价年付几百块 | 按月付费，较贵 |

镜像建议选**纯净 Ubuntu Server**，需要什么自己装，比预装面板更灵活。配置不够可以随时在控制台在线升级，停机几分钟就好，数据不丢。

---

## 一台服务器跑多个项目

完全可以。每个项目监听不同端口，Nginx 按域名分发：

```
Nginx（80/443）
  ├── erp.example.com    → localhost:8000
  ├── ai.example.com     → localhost:8001
  └── tool.example.com   → localhost:8002
```

每个项目用 systemd 管理成独立服务，互不干扰。

---

## systemd 服务管理

把项目注册为 systemd 服务后，可以开机自启、崩溃自动重启。日常最常用的就这几条命令：

```bash
sudo systemctl start myapp      # 启动
sudo systemctl stop myapp       # 停止
sudo systemctl restart myapp    # 重启
sudo systemctl status myapp     # 看状态
sudo journalctl -u myapp -f     # 看实时日志
```

---

## 部署流程

**首次部署**：`git clone` → 安装依赖 → 创建配置文件 → 启动服务

**日常更新**三步走：

```bash
cd /home/ubuntu/project && git pull && sudo systemctl restart myapp
```

如果有本地配置文件冲突，用 `git stash` 暂存再恢复。

---

## 排错经验

| 现象 | 排查方向 |
|------|---------|
| 页面打不开 | `systemctl status` 看服务是否在跑 |
| 能打开但报错 | `journalctl -n 100` 看日志，通常是 Token 过期或 API 异常 |
| 请求卡住无响应 | 进程可能挂了，重启服务 |
| git pull 冲突 | `git stash && git pull && git stash pop` |

**关键经验**：config 等敏感文件一定加入 `.gitignore`，不要进版本控制。

---

## 什么时候需要 Docker

现阶段不需要。几个项目直接跑就行，Docker 多一层抽象反而增加排查难度。等项目超过 10 个、或需要严格环境一致时再考虑。

---

## 扩展路径

| 阶段 | 做的事 | 不需要提前做 |
|------|--------|------------|
| 现在 | IP+端口直接访问 | 不需要域名、Nginx |
| 加第二个项目 | 装 Nginx 分流 | 不需要 Docker |
| 想更专业 | 域名 + HTTPS | 不需要 Docker |
| 项目超过 10 个 | 考虑 Docker | 不需要 K8s |
