const assert = require('assert');
const DevServer = require('../src/core/server');
const path = require('path');
const fs = require('fs-extra');
const WebSocket = require('ws');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

describe('Development Server', function() {
    let server;
    const testDir = path.join(__dirname, 'test-site');

    beforeEach(async function() {
        await fs.ensureDir(testDir);
        server = new DevServer({
            sourceDir: path.join(testDir, 'content'),
            outputDir: path.join(testDir, 'public'),
            port: 3001
        });
    });

    afterEach(async function() {
        if (server) {
            server.stop();
        }
        await fs.remove(testDir);
    });

    it('should start server successfully', async function() {
        const result = await server.start();
        assert.strictEqual(result, true);

        // 测试服务器是否响应
        const response = await fetch('http://localhost:3001');
        assert.strictEqual(response.status, 200);
    });

    it('should handle WebSocket connections', function(done) {
        server.start().then(() => {
            const ws = new WebSocket('ws://localhost:3002');

            ws.on('open', function() {
                ws.close();
                done();
            });

            ws.on('error', function(error) {
                done(error);
            });
        });
    });
});
