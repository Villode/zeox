# Changelog

## [0.0.13] - 2024-01-14

### Changed
- 更新了依赖版本
  - marked 降级到 4.0.12 以修复标题解析问题
  - node-fetch 降级到 2.6.9 以支持 CommonJS
  - chokidar 降级到 3.5.3 以提高稳定性

### Fixed
- 修复了 Markdown 解析中的标题 ID 生成问题
- 修复了 WebSocket 连接和实时预览功能

### Development
- 添加了 VS Code 配置文件，统一了开发环境设置
- 添加了 npm registry 配置，优化了包安装速度
- 完善了单元测试覆盖率

## [0.0.12] - 2024-01-11

### Added
- 基本的博客生成功能
- Markdown 解析支持
- 主题系统
- 开发服务器
- 实时预览功能
- 配置文件支持
- 文章管理系统

### Changed
- 优化了文件生成逻辑
- 改进了错误处理
- 更新了依赖版本
  - marked 降级到 4.0.12 以修复标题解析问题
  - node-fetch 降级到 2.6.9 以支持 CommonJS
  - chokidar 降级到 3.5.3 以提高稳定性

### Fixed
- 修复了路径处理问题
- 修复了静态文件服务问题
- 修复了 Markdown 解析中的标题 ID 生成问题
- 修复了 WebSocket 连接和实时预览功能

### Development
- 添加了 VS Code 配置文件，统一了开发环境设置
- 添加了 npm registry 配置，优化了包安装速度
- 完善了单元测试覆盖率
