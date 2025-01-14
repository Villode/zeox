const assert = require('assert');
const ThemeManager = require('../src/core/theme');
const path = require('path');
const fs = require('fs-extra');

describe('Theme Manager', function() {
    let themeManager;
    const testDir = path.join(__dirname, 'test-themes');
    
    beforeEach(async function() {
        await fs.ensureDir(testDir);
        themeManager = new ThemeManager({
            themesDir: testDir,
            customThemesDir: path.join(testDir, 'custom')
        });
    });
    
    afterEach(async function() {
        await fs.remove(testDir);
    });

    it('should initialize with default theme', async function() {
        // 创建测试主题
        const themeDir = path.join(testDir, 'default');
        await fs.ensureDir(themeDir);
        
        // 创建必需的主题文件
        await fs.writeFile(path.join(themeDir, 'layout.ejs'), '');
        await fs.writeFile(path.join(themeDir, 'post.ejs'), '');
        await fs.writeFile(path.join(themeDir, 'index.ejs'), '');
        
        const result = await themeManager.initialize();
        assert.strictEqual(result, true);
    });

    it('should list available themes', async function() {
        // 创建测试主题
        await fs.ensureDir(path.join(testDir, 'default'));
        await fs.ensureDir(path.join(testDir, 'dark'));
        
        const themes = await themeManager.listAvailableThemes();
        assert.deepStrictEqual(themes.sort(), ['dark', 'default']);
    });
}); 