const assert = require('assert');
const ConfigManager = require('../src/core/config');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');

describe('Config Manager', function() {
    let configManager;
    const testDir = path.join(__dirname, 'test-config');
    const configPath = path.join(testDir, 'config.yml');
    
    beforeEach(async function() {
        await fs.ensureDir(testDir);
        configManager = new ConfigManager({
            configPath: configPath
        });
    });
    
    afterEach(async function() {
        await fs.remove(testDir);
    });

    it('should load default config when no config file exists', async function() {
        const config = await configManager.load();
        assert.strictEqual(config.title, 'Zeox Blog');
        assert.strictEqual(config.theme, 'default');
    });

    it('should merge user config with default config', async function() {
        const userConfig = {
            title: 'My Blog',
            theme: 'dark'
        };
        
        await fs.writeFile(configPath, yaml.dump(userConfig));
        
        const config = await configManager.load();
        assert.strictEqual(config.title, 'My Blog');
        assert.strictEqual(config.theme, 'dark');
        assert.strictEqual(config.language, 'en'); // from default config
    });

    it('should validate config correctly', function() {
        const validConfig = {
            title: 'My Blog',
            url: 'https://example.com',
            posts: {
                perPage: 10,
                sortBy: 'date',
                order: 'desc'
            }
        };
        
        const errors = configManager.validate(validConfig);
        assert.strictEqual(errors.length, 0);
    });
}); 