const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

class ConfigManager {
    constructor(options = {}) {
        this.configPath = options.configPath || 'config.yml';
        this.defaultConfig = {
            title: 'Zeox Blog',
            description: 'A static blog powered by Zeox',
            author: 'Anonymous',
            theme: 'default',
            url: 'http://localhost:3000',
            language: 'en',
            timezone: 'UTC',
            posts: {
                perPage: 10,
                sortBy: 'date',
                order: 'desc'
            },
            markdown: {
                gfm: true,
                breaks: true,
                sanitize: false,
                smartLists: true,
                smartypants: true,
                xhtml: false
            },
            plugins: [],
            deploy: {
                type: 'git',
                repo: '',
                branch: 'gh-pages',
                message: 'Site updated: {{ now("YYYY-MM-DD HH:mm:ss") }}'
            }
        };
    }

    async load() {
        try {
            let config = {};
            
            // 检查配置文件是否存在
            if (await fs.pathExists(this.configPath)) {
                const content = await fs.readFile(this.configPath, 'utf-8');
                config = yaml.load(content);
            }
            
            // 合并默认配置和用户配置
            return this.mergeConfig(this.defaultConfig, config);
        } catch (error) {
            console.error('Failed to load config:', error);
            return this.defaultConfig;
        }
    }

    async save(config) {
        try {
            const yamlStr = yaml.dump(config);
            await fs.writeFile(this.configPath, yamlStr, 'utf-8');
            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    }

    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        
        for (const key in userConfig) {
            if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
                merged[key] = this.mergeConfig(defaultConfig[key] || {}, userConfig[key]);
            } else {
                merged[key] = userConfig[key];
            }
        }
        
        return merged;
    }

    validate(config) {
        // 基本验证规则
        const rules = {
            title: (value) => typeof value === 'string',
            description: (value) => typeof value === 'string',
            url: (value) => typeof value === 'string' && /^https?:\/\//.test(value),
            posts: {
                perPage: (value) => Number.isInteger(value) && value > 0,
                sortBy: (value) => ['date', 'title', 'updated'].includes(value),
                order: (value) => ['asc', 'desc'].includes(value)
            }
        };

        const errors = [];
        
        for (const [key, rule] of Object.entries(rules)) {
            if (typeof rule === 'function') {
                if (!rule(config[key])) {
                    errors.push(`Invalid value for ${key}`);
                }
            } else if (typeof rule === 'object') {
                for (const [subKey, subRule] of Object.entries(rule)) {
                    if (!subRule(config[key]?.[subKey])) {
                        errors.push(`Invalid value for ${key}.${subKey}`);
                    }
                }
            }
        }
        
        return errors;
    }
}

module.exports = ConfigManager; 