---
title: "服务器与域名基础知识整理"
description: "搭建个人网站过程中学到的域名、DNS、HTTPS、Nginx 基础知识，从零开始理解网站是怎么跑起来的。"
pubDate: 2026-04-29
tags: ["服务器", "域名", "Nginx", "运维"]
category: "学习"
---

最近在搭个人网站，顺便把服务器相关的知识系统整理了一遍。这篇文章覆盖了从域名到网站可访问的完整链路。

---

## 域名：网站的地址

域名说白了就是给 IP 地址起个好记的名字。比如 `gjinggg.art` 比一串数字容易记多了。

一个域名从左到右分成子域名、主域名、顶级域名：

```
blog.gjinggg.art
 ├─    ├─     └─ .art（顶级域名）
 │      └─ gjinggg（主域名）
 └─ blog（子域名）
```

**子域名可以无限创建**，不额外收费，在 DNS 控制台加条 A 记录就行。一个域名就能挂博客、工具、API 等多个服务。

域名注册推荐腾讯云/阿里云（国内）或 Cloudflare（海外）。需要注意的是，国内服务器必须 **ICP 备案**才能解析域名，审核周期 7-20 天。

---

## DNS 解析：域名到 IP 的翻译

用户输入域名后，DNS 服务器负责把它翻译成服务器的 IP 地址。核心就两种记录：

- **A 记录**：域名 → IP（如 `@` → `1.2.3.4`，`@` 代表主域名本身）
- **CNAME 记录**：域名 → 另一个域名（如 `blog` → `gjinggg.art`）

配置示例：

| 主机记录 | 记录类型 | 记录值 | 效果 |
|---------|---------|--------|------|
| `@` | A | VPS 公网 IP | `gjinggg.art` |
| `www` | A | VPS 公网 IP | `www.gjinggg.art` |
| `blog` | A | VPS 公网 IP | `blog.gjinggg.art` |

---

## HTTPS：让浏览器不再报「不安全」

没有 HTTPS 的网站会被浏览器标记为不安全，搜索引擎也不待见。用 **Let's Encrypt + Certbot** 可以免费搞定：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 一条命令申请证书并自动配置 Nginx
sudo certbot --nginx -d gjinggg.art -d www.gjinggg.art
```

证书有效期 90 天，Certbot 会自动续期，基本不用管。HTTP 自动跳转 HTTPS 在配置时选 `2` 就行。

---

## Nginx：门口的前台

Nginx 是 Web 服务器，负责接收用户请求并返回网页内容。常用命令：

```bash
sudo systemctl start nginx      # 启动
sudo systemctl enable nginx     # 开机自启
sudo nginx -t                   # 检查配置语法
sudo systemctl reload nginx     # 改完配置后重载
```

**反向代理**是 Nginx 最常用的功能之一——根据域名把请求转发到不同的本地端口：

```nginx
server {
    listen 443 ssl;
    server_name app.gjinggg.art;
    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

这样一台服务器就能跑多个项目，每个用不同子域名访问。

---

## 防火墙：端口开了不代表能访问

服务器本地端口开放 ≠ 外部可访问。腾讯云轻量服务器需要在**控制台**单独放行端口（SSH 22、HTTP 80、HTTPS 443 等）。

---

## 串联起来：从输入域名到看到页面

```
用户输入域名 → DNS 解析出 IP → 请求到服务器 443 端口
→ Nginx 接收 → 返回网页内容 → 用户看到页面
```

对于静态站点，流程更简单：本地构建 HTML/CSS/JS → 上传到服务器 Nginx 目录 → 用户通过域名访问。没有数据库，没有后端，纯文件服务。
