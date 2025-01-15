const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const BlogGenerator = require('./generator');
const chokidar = require('chokidar');

class DevServer {
    constructor(options = {}) {
        this.app = express();
        this.port = options.port || 3000;
        this.sourceDir = options.sourceDir;
        this.outputDir = options.outputDir;
        this.static = options.static;
        this.log = options.log;
        this.generator = new BlogGenerator(options);
    }

    async start() {
        try {
            // 先生成站点
            console.log('Generating site...');
            await this.generator.generate();

            // 基本中间件
            this.app.set('trust proxy', 1);

            // 静态文件服务
            this.app.use(express.static(this.outputDir));

            // 启动服务器
            this.app.listen(this.port, () => {
                console.log(`Development server running at http://localhost:${this.port}`);
            });

            // 监听文件变化（如果不是静态模式）
            if (!this.static) {
                this.watchFiles();
            }
        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    watchFiles() {
        const watcher = chokidar.watch([
            path.join(this.sourceDir, 'posts/**/*.md'),
            path.join(this.sourceDir, 'pages/**/*.md'),
            path.join(this.sourceDir, 'themes/**/*')
        ], {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        watcher.on('change', async (filepath) => {
            console.log(`File ${filepath} has been changed`);
            try {
                await this.generator.generate();
                console.log('Site regenerated');
            } catch (error) {
                console.error('Failed to regenerate site:', error);
            }
        });

        console.log('Watching for file changes...');
    }
}

module.exports = DevServer;
