const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class InitCommand {
    constructor(options = {}) {
        this.targetDir = options.targetDir || process.cwd();
    }

    async execute() {
        try {
            console.log('Initializing new Zeox blog...');

            // 创建必要的目录结构
            await this.createDirectories();

            // 创建配置文件
            await this.createConfig();

            // 创建示例文章
            await this.createExamplePost();

            // 创建基础主题
            await this.createBaseTheme();

            console.log('Blog initialized successfully!');
            return true;
        } catch (error) {
            console.error('Failed to initialize blog:', error.message);
            return false;
        }
    }

    async createDirectories() {
        const dirs = [
            'posts',
            'pages',
            'themes',
            'public'
        ];

        for (const dir of dirs) {
            await fs.ensureDir(path.join(this.targetDir, dir));
            console.log(`Created directory: ${dir}`);
        }
    }

    async createConfig() {
        const config = {
            title: 'My Zeox Blog',
            description: 'A new blog powered by Zeox',
            author: 'Your Name',
            theme: 'default',
            url: 'http://localhost:3000',
            language: 'zh-CN',
            timezone: 'Asia/Shanghai',
            posts: {
                perPage: 10,
                sortBy: 'date',
                order: 'desc'
            }
        };

        await fs.writeFile(
            path.join(this.targetDir, 'config.yml'),
            yaml.dump(config),
            'utf-8'
        );
        console.log('Created config.yml');
    }

    async createExamplePost() {
        const post = `---
title: Welcome to Zeox
date: ${new Date().toISOString()}
tags: [zeox, blog]
---

# Welcome to Your New Blog

This is your first blog post. Edit or delete it, then start blogging!
`;

        await fs.writeFile(
            path.join(this.targetDir, 'posts/hello-world.md'),
            post,
            'utf-8'
        );
        console.log('Created example post');
    }

    async createBaseTheme() {
        const themeDir = path.join(this.targetDir, 'themes/default');
        await fs.ensureDir(themeDir);
        await fs.ensureDir(path.join(themeDir, 'layouts'));
        await fs.ensureDir(path.join(themeDir, 'assets'));

        // 创建基本布局文件
        const layoutContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><%= title %></title>
</head>
<body>
    <%- content %>
</body>
</html>`;

        await fs.writeFile(
            path.join(themeDir, 'layouts/default.ejs'),
            layoutContent,
            'utf-8'
        );
        console.log('Created default theme');
    }
}

module.exports = InitCommand;
