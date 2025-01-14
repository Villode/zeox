const DevServer = require('../core/server');

async function serveProject(options = {}) {
    const server = new DevServer(options);
    return server.start();
}

module.exports = {
    serveProject
}; 