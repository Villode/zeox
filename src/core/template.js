const ejs = require('ejs');
const path = require('path');
const fs = require('fs-extra');

class TemplateManager {
    constructor(options = {}) {
        this.baseDir = process.cwd();
        this.themeDir = path.join(this.baseDir, 'themes', options.theme || 'default');
    }

    async renderPost(post) {
        const template = await this.getTemplate('post');
        return template({ post });
    }

    async renderIndex(posts) {
        const template = await this.getTemplate('index');
        return template({ posts });
    }

    async renderArchives(posts) {
        const template = await this.getTemplate('archives');
        // 按年份分组文章
        const archives = posts.reduce((acc, post) => {
            const year = new Date(post.date).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(post);
            return acc;
        }, {});
        return template({ archives });
    }

    async renderTags(posts) {
        const template = await this.getTemplate('tags');
        // 收集所有标签和对应的文章
        const tags = posts.reduce((acc, post) => {
            (post.tags || []).forEach(tag => {
                if (!acc[tag]) acc[tag] = [];
                acc[tag].push(post);
            });
            return acc;
        }, {});
        return template({ tags });
    }

    async getTemplate(name) {
        const templatePath = path.join(this.themeDir, 'layouts', `${name}.ejs`);
        if (!await fs.pathExists(templatePath)) {
            return this.getDefaultTemplate(name);
        }
        return ejs.compile(await fs.readFile(templatePath, 'utf-8'));
    }

    getDefaultTemplate(name) {
        const header = `
        <header class="site-header">
            <div class="container">
                <a href="/" class="site-title">My Blog</a>
                <nav class="site-nav">
                    <a href="/" class="nav-link">首页</a>
                    <a href="/archives.html" class="nav-link">归档</a>
                    <a href="/tags.html" class="nav-link">标签</a>
                    <a href="/pages/about.html" class="nav-link">关于</a>
                </nav>
            </div>
        </header>`;

        const footer = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-content">
                    <p>&copy; ${new Date().getFullYear()} My Blog. Powered by Zeox.</p>
                    <nav class="footer-nav">
                        <a href="/pages/about.html">关于</a>
                        <a href="/pages/links.html">友链</a>
                        <a href="/rss.xml">RSS</a>
                    </nav>
                </div>
            </div>
        </footer>`;

        const styles = `
        <style>
            :root {
                --primary-color: #4a9eff;
                --text-color: #333;
                --bg-color: #f5f5f5;
                --card-bg: #fff;
            }

            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background: var(--bg-color);
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
            }

            .site-header {
                background: var(--card-bg);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 100;
            }

            .site-header .container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 60px;
            }

            .site-title {
                font-size: 1.5em;
                font-weight: bold;
                color: var(--primary-color);
                text-decoration: none;
            }

            .site-nav {
                display: flex;
                gap: 20px;
            }

            .nav-link {
                color: var(--text-color);
                text-decoration: none;
                padding: 5px 10px;
                border-radius: 4px;
            }

            .nav-link:hover {
                background: var(--bg-color);
            }

            main {
                min-height: calc(100vh - 120px);
                padding: 40px 0;
            }

            article {
                background: var(--card-bg);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }

            .post-meta {
                color: #666;
                font-size: 0.9em;
                margin-bottom: 20px;
            }

            .tags {
                margin-top: 10px;
            }

            .tag {
                display: inline-block;
                padding: 2px 8px;
                background: var(--bg-color);
                border-radius: 4px;
                font-size: 0.9em;
                color: #666;
                margin-right: 5px;
            }

            .site-footer {
                background: var(--card-bg);
                padding: 20px 0;
                margin-top: 40px;
                border-top: 1px solid #eee;
            }

            .footer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .footer-nav a {
                color: #666;
                text-decoration: none;
                margin-left: 20px;
            }

            @media (max-width: 600px) {
                .site-header .container {
                    flex-direction: column;
                    height: auto;
                    padding: 10px;
                }

                .site-nav {
                    margin-top: 10px;
                }

                .footer-content {
                    flex-direction: column;
                    text-align: center;
                }

                .footer-nav {
                    margin-top: 10px;
                }

                .footer-nav a {
                    margin: 0 10px;
                }
            }
        </style>`;

        const templates = {
            post: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= post.title %></title>
    ${styles}
</head>
<body>
    ${header}
    <main class="container">
        <article>
            <h1><%= post.title %></h1>
            <div class="post-meta">
                <time><%= post.date.toISOString().split('T')[0] %></time>
                <% if (post.tags && post.tags.length) { %>
                    · <div class="tags">
                        <% post.tags.forEach(function(tag) { %>
                            <span class="tag"><%= tag %></span>
                        <% }); %>
                    </div>
                <% } %>
            </div>
            <%- post.content %>
        </article>
    </main>
    ${footer}
</body>
</html>`,
            index: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Index</title>
    ${styles}
</head>
<body>
    ${header}
    <main class="container">
        <h1>最新文章</h1>
        <% posts.forEach(function(post) { %>
            <article>
                <h2><a href="/posts/<%= post.slug %>.html"><%= post.title %></a></h2>
                <div class="post-meta">
                    <time><%= post.date.toISOString().split('T')[0] %></time>
                    <% if (post.tags && post.tags.length) { %>
                        <div class="tags">
                            <% post.tags.forEach(function(tag) { %>
                                <span class="tag"><%= tag %></span>
                            <% }); %>
                        </div>
                    <% } %>
                </div>
                <% if (post.excerpt) { %>
                    <div class="post-excerpt">
                        <%= post.excerpt %>
                        <a href="/posts/<%= post.slug %>.html">阅读更多...</a>
                    </div>
                <% } %>
            </article>
        <% }); %>
    </main>
    ${footer}
</body>
</html>`,
            archives: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章归档</title>
    ${styles}
</head>
<body>
    ${header}
    <main class="container">
        <h1>文章归档</h1>
        <% Object.keys(archives).sort((a, b) => b - a).forEach(function(year) { %>
            <section class="archive-year">
                <h2><%= year %></h2>
                <% archives[year].forEach(function(post) { %>
                    <article class="archive-item">
                        <time><%= post.date.toISOString().split('T')[0] %></time>
                        <a href="/posts/<%= post.slug %>.html"><%= post.title %></a>
                        <% if (post.tags && post.tags.length) { %>
                            <div class="tags">
                                <% post.tags.forEach(function(tag) { %>
                                    <span class="tag"><%= tag %></span>
                                <% }); %>
                            </div>
                        <% } %>
                    </article>
                <% }); %>
            </section>
        <% }); %>
    </main>
    ${footer}
</body>
</html>`,
            tags: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>标签云</title>
    ${styles}
    <style>
        .tag-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 40px;
        }
        .tag-cloud .tag {
            font-size: 1.1em;
            padding: 5px 15px;
        }
        .tag-section {
            margin-bottom: 40px;
        }
    </style>
</head>
<body>
    ${header}
    <main class="container">
        <h1>标签云</h1>
        <div class="tag-cloud">
            <% Object.keys(tags).sort().forEach(function(tag) { %>
                <a href="#tag-<%= tag %>" class="tag"><%= tag %> (<%= tags[tag].length %>)</a>
            <% }); %>
        </div>
        <% Object.keys(tags).sort().forEach(function(tag) { %>
            <section id="tag-<%= tag %>" class="tag-section">
                <h2><%= tag %></h2>
                <% tags[tag].forEach(function(post) { %>
                    <article class="archive-item">
                        <time><%= post.date.toISOString().split('T')[0] %></time>
                        <a href="/posts/<%= post.slug %>.html"><%= post.title %></a>
                    </article>
                <% }); %>
            </section>
        <% }); %>
    </main>
    ${footer}
</body>
</html>`
        };
        return ejs.compile(templates[name]);
    }
}

module.exports = TemplateManager;
