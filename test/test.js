const assert = require('assert');
const MarkdownParser = require('../src/core/markdown');
const path = require('path');
const fs = require('fs-extra');

describe('Markdown Parser', function() {
    let parser;

    before(function() {
        parser = new MarkdownParser();
    });

    it('should parse markdown content with front-matter', function() {
        const content = `---
title: Test Post
date: 2024-01-01
tags: [test]
---

# Hello World

This is a test post.`;

        const result = parser.parse(content, 'test-post');

        console.log('Parsed HTML:', result.content);

        assert.strictEqual(result.title, 'Test Post');
        assert.strictEqual(result.slug, 'test-post');
        assert.deepStrictEqual(result.tags, ['test']);
        assert(result.content.includes('<h1 id="hello-world">Hello World</h1>'));
    });

    it('should generate excerpt correctly', function() {
        const markdown = `# Title

This is a long paragraph that should be truncated for the excerpt.
It contains multiple sentences and should be shortened to the specified length.`;

        const result = parser.generateExcerpt(markdown, 50);
        assert(result.length <= 53); // 50 + '...'
        assert(result.endsWith('...'));
    });
});
