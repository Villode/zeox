const fs = require('fs-extra');
const path = require('path');

class ThemeManager {
    constructor(options = {}) {
        this.themesDir = options.themesDir || path.join(__dirname, '../templates');
        this.currentTheme = options.theme || 'default';
        this.customThemesDir = options.customThemesDir || 'themes';
    }

    async initialize() {
        try {
            // 确保主题目录存在
            await fs.ensureDir(this.themesDir);
            await fs.ensureDir(this.customThemesDir);
            
            // 验证当前主题是否存在
            await this.validateTheme(this.currentTheme);
            
            return true;
        } catch (error) {
            console.error('Theme initialization failed:', error);
            return false;
        }
    }

    async validateTheme(themeName) {
        const themeDir = await this.getThemeDir(themeName);
        const requiredFiles = ['layout.ejs', 'post.ejs', 'index.ejs'];
        
        for (const file of requiredFiles) {
            const filePath = path.join(themeDir, file);
            if (!await fs.pathExists(filePath)) {
                throw new Error(`Required theme file missing: ${file} in theme ${themeName}`);
            }
        }
    }

    async getThemeDir(themeName) {
        // 首先检查自定义主题目录
        const customThemePath = path.join(this.customThemesDir, themeName);
        if (await fs.pathExists(customThemePath)) {
            return customThemePath;
        }
        
        // 然后检查内置主题目录
        const builtinThemePath = path.join(this.themesDir, themeName);
        if (await fs.pathExists(builtinThemePath)) {
            return builtinThemePath;
        }
        
        throw new Error(`Theme not found: ${themeName}`);
    }

    async getThemeAssets(themeName) {
        const themeDir = await this.getThemeDir(themeName);
        const assetsDir = path.join(themeDir, 'assets');
        
        if (await fs.pathExists(assetsDir)) {
            return {
                path: assetsDir,
                files: await fs.readdir(assetsDir)
            };
        }
        
        return null;
    }

    async getThemeConfig(themeName) {
        const themeDir = await this.getThemeDir(themeName);
        const configPath = path.join(themeDir, 'config.json');
        
        if (await fs.pathExists(configPath)) {
            return fs.readJson(configPath);
        }
        
        return {};
    }

    async listAvailableThemes() {
        const themes = new Set();
        
        // 获取内置主题
        const builtinThemes = await fs.readdir(this.themesDir);
        builtinThemes.forEach(theme => themes.add(theme));
        
        // 获取自定义主题
        if (await fs.pathExists(this.customThemesDir)) {
            const customThemes = await fs.readdir(this.customThemesDir);
            customThemes.forEach(theme => themes.add(theme));
        }
        
        return Array.from(themes);
    }
}

module.exports = ThemeManager; 