const { marked } = require('marked');

marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false
});

function parseMarkdown(content) {
    return marked(content);
}

module.exports = {
    parseMarkdown
};
