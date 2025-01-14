const ejs = require('ejs');
const fs = require('fs-extra');
const path = require('path');

class TemplateManager {
    constructor(options = {}) {
        this.themeName = options.theme || 'default';
        this.templatesDir = path.join(__dirname, '../templates', this.themeName);
    }

    async render(template, data) {
        try {
            const templatePath = path.join(this.templatesDir, `${template}.ejs`);
            const templateContent = await fs.readFile(templatePath, 'utf-8');
            return ejs.render(templateContent, {
                ...data,
                filename: templatePath
            });
        } catch (error) {
            console.error(`Template rendering failed: ${error.message}`);
            throw error;
        }
    }

    async renderPost(post) {
        return this.render('post', {
            post,
            title: post.title,
            content: post.content,
            date: post.date
        });
    }

    async renderIndex(posts) {
        return this.render('index', {
            posts,
            title: 'Blog Home'
        });
    }
}

module.exports = TemplateManager; 