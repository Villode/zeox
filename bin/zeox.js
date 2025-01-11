#!/usr/bin/env node

const { program } = require('commander');
const { DevServer } = require('../src/core/server');
const { initProject } = require('../src/commands/init');
const path = require('path');

program
    .version(require('../package.json').version)
    .description('Zeox static blog generator');

program
    .command('init [dir]')
    .description('Initialize a new blog')
    .action(async (dir = '.') => {
        try {
            const success = await initProject(dir);
            if (!success) {
                process.exit(1);
            }
        } catch (error) {
            console.error('Failed to initialize blog:', error);
            process.exit(1);
        }
    });

program
    .command('serve')
    .description('Start development server')
    .option('-p, --port <port>', 'port to use', '3000')
    .action(async (options) => {
        try {
            const server = new DevServer({
                port: parseInt(options.port),
                sourceDir: path.join(process.cwd(), 'source'),
                outputDir: path.join(process.cwd(), 'public')
            });

            console.log('Starting development server...');
            await server.start();
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });

program.parse(process.argv); 