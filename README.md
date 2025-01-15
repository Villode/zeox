# Zeox

一个轻量级且可定制的静态博客生成器。

## 特性

- 🚀 快速生成静态博客
- 🎨 支持自定义主题
- 📝 Markdown 支持
- 🔄 实时预览
- 📱 响应式设计
- 🏷️ 标签和归档
- 📰 RSS 订阅
- 🔍 全文搜索
- ⚡ 文件监听和自动重新生成

## 安装

```bash
npm install -g zeox
```

## 快速开始

### 初始化博客

```bash
# 在当前目录初始化
zeox init

# 或指定目录
zeox init my-blog
```

### 创建新文章

```bash
# 创建文章
zeox new "文章标题"

# 创建页面
zeox new page "关于我"
```

### 开发预览

```bash
# 启动开发服务器
zeox serve
```

### 生成静态文件

```bash
# 生成静态文件
zeox generate
```

## 目录结构

```
my-blog/
├── posts/          # 文章目录
├── pages/          # 页面目录
├── themes/         # 主题目录
│   └── default/    # 默认主题
├── public/         # 生成的静态文件
└── config.yml      # 配置文件
```

## 配置说明

在 `config.yml` 中配置你的博客：

```yaml
# 基本配置
title: My Blog
description: A new blog powered by Zeox
author: Your Name
theme: default
url: http://localhost:3000
language: zh-CN
timezone: Asia/Shanghai

# 文章配置
posts:
  perPage: 10
  sortBy: date
  order: desc

# RSS 配置
rss:
  enabled: true
  count: 20
  description: RSS Feed

# 搜索配置
search:
  enabled: true
```

## 更新日志

### [0.1.0] - 2024-01-15

#### 新增
- 完整的博客系统
- 响应式默认主题
- 标签和归档页面
- RSS 订阅功能
- 全文搜索功能
- 文件监听和自动重新生成
- 完善的文档

## 许可证

[GPL-3.0](LICENSE)
