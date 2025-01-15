const fs = require('fs-extra');
const path = require('path');

class NewCommand {
    constructor(options = {}) {
        this.options = options;
        this.baseDir = process.cwd();
    }

    async execute(layout = 'post', title) {
        if (!title && layout) {
            title = layout;
            layout = 'post';
        }

        if (!title) {
            throw new Error('标题是必需的');
        }

        try {
            // 检查是否在 Zeox 项目目录中
            if (!await fs.pathExists(path.join(this.baseDir, 'config.yml'))) {
                throw new Error('不在 Zeox 博客目录中。请在博客根目录下运行此命令。');
            }

            // 确定文章路径
            const targetDir = this.options.path ||
                (layout === 'page' ? 'pages' : 'posts');

            // 生成文章别名
            const slug = this.options.slug ||
                title
                    .toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                    .replace(/^-+|-+$/g, '');

            // 创建文件路径
            const filePath = path.join(
                this.baseDir,
                targetDir,
                `${slug || 'untitled'}.md`
            );

            // 检查文件是否存在
            if (await fs.pathExists(filePath) && !this.options.replace) {
                throw new Error(`文件已存在: ${filePath}`);
            }

            // 创建文章内容
            const content = `---
title: ${title}
date: ${new Date().toISOString()}
layout: ${layout}
tags: []
categories: []
---

# ${title}

Write your content here...
`;

            // 确保目录存在
            await fs.ensureDir(path.dirname(filePath));

            // 写入文件
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`Created ${layout}: ${filePath}`);
            return true;
        } catch (error) {
            console.error('Failed to create content:', error.message);
            return false;
        }
    }
}

module.exports = NewCommand;
