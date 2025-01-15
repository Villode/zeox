const fs = require('fs-extra');
const path = require('path');
const frontMatter = require('front-matter');
const { parseMarkdown } = require('./markdown');
const TemplateManager = require('./template');
const RSSGenerator = require('./rss');
const SearchIndex = require('./search');

class BlogGenerator {
    constructor(options = {}) {
        this.baseDir = process.cwd();
        this.sourceDir = options.sourceDir || path.join(this.baseDir, 'posts');
        this.outputDir = options.outputDir || path.join(this.baseDir, 'public');
        this.config = options.config || {};
        this.templateManager = new TemplateManager(options);
        this.rssGenerator = new RSSGenerator(options);
    }

    async generate() {
        try {
            console.log('Starting site generation...');
            const startTime = process.hrtime();

            // 清理输出目录
            await fs.emptyDir(this.outputDir);

            // 读取所有文章
            const posts = await this.readPosts();

            // 生成文章页面
            await this.generatePosts(posts);

            // 生成首页
            await this.generateIndex(posts);

            // 生成归档页面
            await this.generateArchives(posts);

            // 生成标签页面
            await this.generateTags(posts);

            // 生成 RSS 订阅
            await this.generateRSS(posts);

            // 生成搜索索引
            await this.generateSearchIndex(posts);

            const [seconds, nanoseconds] = process.hrtime(startTime);
            console.log(`Site generated in ${seconds}s ${nanoseconds / 1000000}ms`);
            return true;
        } catch (error) {
            console.error('Generation failed:', error);
            throw error;
        }
    }

    async readPosts() {
        try {
            // 确保文章目录存在
            await fs.ensureDir(this.sourceDir);

            const files = await fs.readdir(this.sourceDir);
            const posts = [];

            for (const file of files) {
                if (file.endsWith('.md')) {
                    const filePath = path.join(this.sourceDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const { attributes, body } = frontMatter(content);
                    const htmlContent = parseMarkdown(body);

                    posts.push({
                        ...attributes,
                        content: htmlContent,
                        date: new Date(attributes.date || Date.now()),
                        slug: path.basename(file, '.md'),
                        tags: attributes.tags || [],
                        categories: attributes.categories || []
                    });
                }
            }

            return posts.sort((a, b) => b.date - a.date);
        } catch (error) {
            console.error('Failed to read posts:', error);
            return [];
        }
    }

    async generatePosts(posts) {
        for (const post of posts) {
            const html = await this.templateManager.renderPost(post);
            const outputPath = path.join(this.outputDir, 'posts', `${post.slug}.html`);
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, html);
            console.log(`Generated post: ${post.slug}`);
        }
    }

    async generateIndex(posts) {
        const html = await this.templateManager.renderIndex(posts);
        await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
        console.log('Generated index page');
    }

    async generateArchives(posts) {
        const html = await this.templateManager.renderArchives(posts);
        await fs.writeFile(path.join(this.outputDir, 'archives.html'), html);
        console.log('Generated archives page');
    }

    async generateTags(posts) {
        const html = await this.templateManager.renderTags(posts);
        await fs.writeFile(path.join(this.outputDir, 'tags.html'), html);
        console.log('Generated tags page');
    }

    async generateRSS(posts) {
        const feeds = this.rssGenerator.generate(posts);
        await fs.writeFile(path.join(this.outputDir, 'rss.xml'), feeds.rss);
        await fs.writeFile(path.join(this.outputDir, 'atom.xml'), feeds.atom);
        await fs.writeFile(path.join(this.outputDir, 'feed.json'), feeds.json);
        console.log('Generated RSS feeds');
    }

    async generateSearchIndex(posts) {
        const searchIndex = new SearchIndex();
        posts.forEach(post => searchIndex.addPost(post));
        await fs.writeFile(
            path.join(this.outputDir, 'search-index.json'),
            JSON.stringify(searchIndex.toJSON())
        );
        console.log('Generated search index');
    }
}

module.exports = BlogGenerator;
