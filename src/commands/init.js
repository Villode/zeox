const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');

async function initProject(targetDir = '.') {
    try {
        const targetPath = path.resolve(targetDir);
        console.log(`Initializing new blog in ${targetPath}`);

        // 创建必要的目录结构
        const dirs = [
            'source/posts',
            'source/pages',
            'source/assets',
            'public'
        ];

        for (const dir of dirs) {
            await fs.ensureDir(path.join(targetPath, dir));
        }

        // 创建配置文件
        const configContent = `# Site Information
title: My Zeox Blog
description: A beautiful blog powered by Zeox
author: Your Name
url: http://localhost:3000
language: en
timezone: UTC

# Theme
theme: default
highlight: true
prismjs: true

# Directory
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories`;

        await fs.writeFile(path.join(targetPath, 'config.yml'), configContent);

        // 创建示例文章
        const postContent = `---
title: Welcome to My Blog
date: ${new Date().toISOString().split('T')[0]}
tags: [hello, blog]
categories: [getting-started]
---

# Welcome to My Blog

This is your first blog post using Zeox. Feel free to edit this post and create new ones!

## Quick Start

1. Edit this post in \`source/posts/welcome.md\`
2. Create new posts using \`zeox new "My Post Title"\`
3. Start the development server with \`zeox serve\`
4. Build your site using \`zeox generate\`

Enjoy blogging with Zeox!`;

        await fs.writeFile(path.join(targetPath, 'source/posts/welcome.md'), postContent);

        console.log('\n✨ Blog initialized successfully!');
        console.log('\nNext steps:');
        console.log('1. cd', targetDir !== '.' ? targetDir : '');
        console.log('2. zeox serve    (start development server)');
        console.log('3. Edit source/posts/welcome.md');
        console.log('\nHappy blogging! 🎉\n');

        return true;
    } catch (error) {
        console.error('Failed to initialize blog:', error);
        return false;
    }
}

module.exports = initProject; 