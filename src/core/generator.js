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
            const html = await this.templateManager.renderPost(post);
            const outputPath = path.join(this.outputDir, 'posts', `${post.slug}.html`);
            await fs.writeFile(outputPath, html);
            console.log(`Generated post: ${post.slug}`);
        }
    }

    async generateIndex(posts) {
        const html = await this.templateManager.renderIndex(posts);
        await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
        console.log('Generated index page');
    }
}

module.exports = BlogGenerator;
