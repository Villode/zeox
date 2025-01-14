const { generateBlog } = require('./core/generator');
const { initProject } = require('./commands/init');
const { buildProject } = require('./commands/build');
const { serveProject } = require('./commands/serve');

module.exports = {
    generateBlog,
    initProject,
    buildProject,
    serveProject
};
