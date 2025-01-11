const { marked } = require('marked');
const frontMatter = require('front-matter');
const fs = require('fs-extra');
const path = require('path');

class MarkdownParser {
    constructor(options = {}) {
        // 配置 marked 选项
        marked.setOptions({
            gfm: true, // GitHub Flavored Markdown
            breaks: true, // 转换换行符为 <br>
            headerIds: true, // 为标题添加 id
            mangle: false, // 不转义标题中的字符
            ...options.marked
        });

        this.options = options;
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
        const htmlContent = marked(body);
        
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
        // 移除 Markdown 语法
        const plainText = markdown
            .replace(/#+\s+/g, '') // 移除标题
            .replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/g, '$1') // 移除加粗、斜体和链接
            .replace(/\n/g, ' ') // 将换行转换为空格
            .trim();

        // 截取指定长度
        return plainText.length > length 
            ? plainText.slice(0, length) + '...'
            : plainText;
    }

    // 添加自定义插件支持
    use(plugin) {
        if (typeof plugin === 'function') {
            marked.use(plugin);
        }
    }
}

module.exports = MarkdownParser; 