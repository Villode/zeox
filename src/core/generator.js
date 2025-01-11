const fs = require('fs-extra');
const path = require('path');
const TemplateManager = require('./template');
const MarkdownParser = require('./markdown');
const ThemeManager = require('./theme');
const ConfigManager = require('./config');

class BlogGenerator {
    constructor(options = {}) {
        this.sourceDir = options.sourceDir || 'source';
        this.outputDir = options.outputDir || 'public';
        this.config = options.config || {};
        this.templateManager = new TemplateManager(options);
        this.markdownParser = new MarkdownParser(options);
        this.themeManager = new ThemeManager(options);
        this.configManager = new ConfigManager(options);
    }

    async generate() {
        try {
            console.log('Starting site generation...');
            
            // 确保输出目录存在
            await fs.ensureDir(this.outputDir);
            await fs.ensureDir(path.join(this.outputDir, 'posts'));
            
            // 读取所有文章
            const posts = await this.readPosts();
            console.log(`Found ${posts.length} posts`);

            // 生成文章页面
            await this.generatePosts(posts);
            
            // 生成首页
            await this.generateIndex(posts);
            
            console.log('Site generation completed!');
            return true;
        } catch (error) {
            console.error('Generation failed:', error);
            return false;
        }
    }

    async readPosts() {
        const postsDir = path.join(this.sourceDir, 'posts');
        await fs.ensureDir(postsDir);
        
        const files = await fs.readdir(postsDir);
        const posts = [];

        for (const file of files) {
            if (file.endsWith('.md')) {
                const filePath = path.join(postsDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const post = this.markdownParser.parse(content, path.basename(file, '.md'));
                posts.push(post);
            }
        }

        // 按日期排序
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async generatePosts(posts) {
        for (const post of posts) {
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${post.title}</title>
                    <style>
                        body {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <nav><a href="/">Home</a></nav>
                    <article>
                        <h1>${post.title}</h1>
                        <div class="meta">
                            <time>${new Date(post.date).toLocaleDateString()}</time>
                            ${post.tags ? `<div class="tags">Tags: ${post.tags.join(', ')}</div>` : ''}
                        </div>
                        ${post.content}
                    </article>
                </body>
                </html>
            `;

            const outputPath = path.join(this.outputDir, 'posts', `${post.slug}.html`);
            await fs.writeFile(outputPath, html);
            console.log(`Generated post: ${post.slug}`);
        }
    }

    async generateIndex(posts) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>My Blog</title>
                <style>
                    body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                    }
                    .post-preview {
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #eee;
                    }
                </style>
            </head>
            <body>
                <h1>My Blog</h1>
                <div class="posts">
                    ${posts.map(post => `
                        <div class="post-preview">
                            <h2><a href="/posts/${post.slug}.html">${post.title}</a></h2>
                            <div class="meta">
                                <time>${new Date(post.date).toLocaleDateString()}</time>
                                ${post.tags ? `<div class="tags">Tags: ${post.tags.join(', ')}</div>` : ''}
                            </div>
                            <p>${post.excerpt || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;

        await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
        console.log('Generated index page');
    }
}

module.exports = {
    BlogGenerator
}; 