# 使用官方 Node.js 22 镜像
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 运行自定义 i18n 脚本
RUN echo "=== 准备国际化文件 ===" && \
    node scripts/copy-i18n.mjs

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# 构建应用
RUN echo "=== 开始构建 ===" && \
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
FROM nginx:alpine

# 复制自定义 Nginx 配置
RUN echo 'events { worker_connections 1024; } \
http { \
    include       /etc/nginx/mime.types; \
    default_type  application/octet-stream; \
    \
    server { \
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
    } \
}' > /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物（包含可能的 robots.txt）
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]