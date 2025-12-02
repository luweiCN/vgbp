const fs = require('fs');
const path = require('path');

// 读取404.html文件
const filePath = path.join(process.cwd(), 'dist', '404.html');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // GitHub Pages 子路径部署：将相对路径替换为包含项目名的绝对路径
  content = content.replace(/\.\/assets\//g, '/vgbp/assets/');
  content = content.replace(/\.\.\/assets\//g, '/vgbp/assets/');

  // 也处理可能的绝对路径（如果 Vite 生成的是 /assets/）
  content = content.replace(/href="\/assets\//g, 'href="/vgbp/assets/');
  content = content.replace(/src="\/assets\//g, 'src="/vgbp/assets/');

  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('✅ Fixed 404.html asset paths for GitHub Pages');
} catch (error) {
  console.error('❌ Error fixing 404.html:', error);
  process.exit(1);
}