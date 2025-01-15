#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const pkg = require('../package.json');
const InitCommand = require('../src/commands/init');
const NewCommand = require('../src/commands/new');
const DevServer = require('../src/core/server');
const fs = require('fs-extra');

program
    .version(pkg.version, '-v, --version', '显示版本号')
    .description('A lightweight and customizable static blog generator')
    .option('--debug', '启用调试模式')
    .option('--safe', '安全模式，不加载插件')
    .option('--silent', '静默模式')
    .option('--config <path>', '指定配置文件路径');

program
    .command('new [layout] [title]')
    .alias('n')
    .description('Create new content')
    .option('-p, --path <path>', '指定文章路径')
    .option('-r, --replace', '替换已存在的文章')
    .option('-s, --slug <slug>', '指定文章别名')
    .action(async (layout, title, options) => {
        try {
            const creator = new NewCommand(options);
            await creator.execute(layout, title);
        } catch (error) {
            console.error('Failed to create content:', error.message);
            process.exit(1);
        }
    });

program
    .command('serve')
    .aliases(['s', 'dev'])
    .description('Start development server')
    .option('-p, --port <port>', 'port to use', '3000')
    .option('-s, --static', '只使用静态文件')
    .option('-l, --log', '启用日志')
    .action(async (options) => {
        try {
            // 检查是否在有效的 Zeox 博客目录中
            if (!await fs.pathExists(path.join(process.cwd(), 'config.yml'))) {
                throw new Error(
                    '当前目录不是有效的 Zeox 博客目录。\n' +
                    '请在博客根目录下运行此命令，或先使用 `zeox init` 创建新博客。'
                );
            }

            const server = new DevServer({
                port: parseInt(options.port),
                sourceDir: path.join(process.cwd(), 'posts'),
                outputDir: path.join(process.cwd(), 'public'),
                static: options.static,
                log: options.log
            });

            console.log('Starting development server...');
            await server.start();
        } catch (error) {
            console.error('Failed to start server:', error.message);
            process.exit(1);
        }
    });

program
    .command('init [dir]')
    .description('Initialize a new Zeox blog')
    .action(async (dir) => {
        try {
            const targetDir = dir ? path.resolve(dir) : process.cwd();
            const init = new InitCommand({ targetDir });
            await init.execute();
        } catch (error) {
            console.error('Failed to initialize blog:', error.message);
            process.exit(1);
        }
    });

// 确保解析命令行参数
if (process.argv.length === 2) {
    program.help();
}

program.parse(process.argv);
