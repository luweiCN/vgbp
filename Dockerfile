# 使用 Harbor 代理的 Node.js 22 镜像
FROM www.luwei.space:4008/proxy-docker-hub/library/node:22-alpine AS builder
# 构建时间: 2024-12-19 14:00 (支持构建参数)

# 定义构建参数（这些将由 Dokploy 的 Build-time Arguments 提供）
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖（包括开发依赖，因为需要 vite 进行构建）
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 运行自定义 i18n 脚本
RUN echo "=== 准备国际化文件 ===" && \
    node scripts/copy-i18n.mjs

# 设置环境变量（构建时使用）
ENV NODE_ENV=production
# ARG 传递给 ENV，这样 Vite 在构建时可以读取
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# 构建应用
RUN echo "=== 开始构建 ===" && \
    echo "=== 调试信息 ===" && \
    echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}" && \
    echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:10}..." && \
    echo "=== 环境变量列表 ===" && \
    env | grep VITE && \
    echo "===================" && \
    npm run build

# 验证构建输出
RUN echo "=== 验证构建输出 ===" && \
    ls -la dist/ && \
    test -f dist/index.html || (echo "❌ index.html 未找到" && exit 1) && \
    test -f dist/sw.js && echo "✓ Service Worker 已生成" || echo "⚠️ Service Worker 未生成" && \
    echo "构建完成！"

# 清理敏感文件
RUN rm -f dist/.env* && \
    echo "=== 安全清理完成 ==="

# 复制 robots.txt 到 dist 目录（如果存在）
RUN cp public/robots.txt dist/robots.txt 2>/dev/null || true

# 生产阶段：使用 Nginx 提供静态文件
FROM www.luwei.space:4008/proxy-docker-hub/library/nginx:alpine

# 复制自定义 Nginx 配置（只需要 server 块）
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    root         /usr/share/nginx/html; \
    index        index.html; \
    \
    # SPA 路由支持 \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # 静态资源缓存 \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # PWA 资源不缓存 \
    location ~* \.(webmanifest|sw.js)$ { \
        expires -1; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    \
    # Gzip 压缩 \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}' > /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物（包含可能的 robots.txt）
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]