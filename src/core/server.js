const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const { BlogGenerator } = require('./generator');
const fs = require('fs');

class DevServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.sourceDir = options.sourceDir || 'content';
        this.outputDir = options.outputDir || 'public';
        this.generator = new BlogGenerator(options);
        
        this.app = express();
    }

    setupExpress() {
        // 静态文件服务
        this.app.use(express.static(this.outputDir));
        
        // 处理 favicon.ico 请求
        this.app.get('/favicon.ico', (req, res) => {
            res.status(204).end(); // 返回空响应
        });
        
        // 处理其他路由，返回对应的HTML文件
        this.app.get('*', (req, res) => {
            // 忽略非HTML请求
            if (!req.accepts('html')) {
                return res.status(404).end();
            }
            
            const requestPath = req.path === '/' ? '/index.html' : `${req.path}.html`;
            const filePath = path.join(this.outputDir, requestPath);
            
            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                // 返回 404 页面或默认页面
                res.status(404).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Page Not Found</title>
                    </head>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you are looking for does not exist.</p>
                        <a href="/">Go back to home</a>
                    </body>
                    </html>
                `);
            }
        });
    }

    setupWebSocket() {
        // 创建 WebSocket 服务器
        this.wss = new WebSocket.Server({ port: this.port + 1 });
        
        // 注入客户端重载脚本
        const originalStatic = express.static(this.outputDir);
        this.app.use((req, res, next) => {
            if (req.path.endsWith('.html')) {
                res.header('Content-Type', 'text/html');
                originalStatic(req, res, (err) => {
                    if (err) return next(err);
                    
                    // 读取响应内容
                    const originalSend = res.send;
                    res.send = function(html) {
                        // 注入重载脚本
                        const injectedHtml = html.toString().replace(
                            '</body>',
                            `
                            <script>
                                (function() {
                                    const ws = new WebSocket('ws://localhost:${this.port + 1}');
                                    ws.onmessage = function(event) {
                                        if (event.data === 'reload') window.location.reload();
                                    };
                                })();
                            </script>
                            </body>
                            `
                        );
                        originalSend.call(this, injectedHtml);
                    };
                    next();
                });
            } else {
                originalStatic(req, res, next);
            }
        });
    }

    setupWatcher() {
        // 监听源文件变化
        const watcher = chokidar.watch([
            path.join(this.sourceDir, '**/*'),
            path.join('src/templates', '**/*')
        ], {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        watcher.on('change', async (path) => {
            console.log(`File ${path} has been changed`);
            try {
                await this.generator.generate();
                this.notifyClients();
            } catch (error) {
                console.error('Error regenerating site:', error);
            }
        });
    }

    notifyClients() {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('reload');
            }
        });
    }

    async start() {
        try {
            // 首次生成站点
            console.log('Generating site...');
            await this.generator.generate();
            
            // 设置 Express
            this.setupExpress();
            
            // 设置 WebSocket
            this.setupWebSocket();
            
            // 设置文件监听
            this.setupWatcher();
            
            // 启动服务器
            return new Promise((resolve) => {
                this.server = this.app.listen(this.port, () => {
                    console.log(`Development server running at http://localhost:${this.port}`);
                    console.log(`WebSocket server running at ws://localhost:${this.port + 1}`);
                    resolve(true);
                });
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
        if (this.wss) {
            this.wss.close();
        }
    }
}

module.exports = {
    DevServer
}; 