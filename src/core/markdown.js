const { marked } = require('marked');
const frontMatter = require('front-matter');
const fs = require('fs-extra');
const path = require('path');

class MarkdownParser {
    constructor(options = {}) {
        // 配置 marked 选项
        this.options = {
            gfm: true,
            breaks: true,
            headerIds: true,
            mangle: false,
            headerPrefix: '',
            ...options.marked
        };
        marked.setOptions(this.options);
    }

    async parseFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return this.parse(content, path.basename(filePath, '.md'));
        } catch (error) {
            console.error(`Failed to parse markdown file: ${filePath}`, error);
            throw error;
        }
    }

    parse(content, slug) {
        // 解析 front-matter
        const { attributes, body } = frontMatter(content);

        // 解析 Markdown 内容
        const htmlContent = marked(body.trim());

        // 生成摘要
        const excerpt = this.generateExcerpt(body);

        return {
            slug,
            content: htmlContent,
            excerpt,
            ...attributes,
            date: attributes.date ? new Date(attributes.date) : new Date(),
            tags: attributes.tags || [],
            categories: attributes.categories || []
        };
    }

    generateExcerpt(markdown, length = 200) {
        // 移除 Markdown 标记
        const text = markdown.replace(/[#*`~]/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 处理链接
            .replace(/\n+/g, ' ').trim();

        return text.length > length ? text.slice(0, length) + '...' : text;
    }

    // 添加自定义插件支持
    use(plugin) {
        if (typeof plugin === 'function') {
            marked.use(plugin);
        }
    }
}

module.exports = MarkdownParser;
