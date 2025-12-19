# Release v1.0.0

*发布时间: 2025/12/19 22:06:05*

## ✨ 新功能

- 添加 Docker 构建参数支持
- 使用 Harbor 私有镜像仓库
- 添加 Dockerfile 支持

## 🐛 问题修复

- 清理 Dockerfile 中的所有调试输出
- 移除所有调试信息和测试文件
- 添加 absolute_redirect off 避免重定向循环
- 修复环境变量注入问题
- 使用国内镜像源解决 Docker Hub 连接问题
- 修复 Nginx 配置文件格式
- 安装所有依赖以支持构建
- 修复 Dockerfile 中 robots.txt 复制问题
- 移除 nixpkgs-archive 配置并注释掉 setup 阶段

## 🔧 构建和工具

- 清理所有 nixpacks 相关配置

## 📝 其他更改

- debug: 添加环境变量测试页面
- debug: 在 index.html 中添加调试脚本
- debug: 添加环境变量调试页面
- debug: 检查构建后的 JS 文件中的环境变量
- debug: 添加环境变量调试打印
- revert: 恢复使用官方 Docker 镜像
- build: 添加构建时间戳以强制重新构建

---

📊 本版本包含 **20** 次提交
👥 贡献者: luwei
🚀 部署环境已更新