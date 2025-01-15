const { Feed } = require('feed');
const fs = require('fs-extra');
const path = require('path');

class RSSGenerator {
    constructor(options = {}) {
        this.config = options.config || {};
        this.baseUrl = this.config.url || 'http://localhost:3000';
    }

    generate(posts) {
        const feed = new Feed({
            title: this.config.title || 'My Blog',
            description: this.config.description || '',
            id: this.baseUrl,
            link: this.baseUrl,
            language: this.config.language || 'zh-CN',
            image: `${this.baseUrl}/images/logo.png`,
            favicon: `${this.baseUrl}/favicon.ico`,
            copyright: `All rights reserved ${new Date().getFullYear()}`,
            author: {
                name: this.config.author || 'Anonymous',
                email: this.config.email || '',
                link: this.config.authorUrl || ''
            }
        });

        posts.forEach(post => {
            feed.addItem({
                title: post.title,
                id: `${this.baseUrl}/posts/${post.slug}.html`,
                link: `${this.baseUrl}/posts/${post.slug}.html`,
                description: post.excerpt || '',
                content: post.content,
                author: [
                    {
                        name: post.author || this.config.author || 'Anonymous'
                    }
                ],
                date: post.date,
                image: post.image,
                category: post.tags.map(tag => ({ name: tag }))
            });
        });

        return {
            rss: feed.rss2(),
            atom: feed.atom1(),
            json: feed.json1()
        };
    }
}

module.exports = RSSGenerator;
