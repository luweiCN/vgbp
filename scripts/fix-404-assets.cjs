const fs = require('fs');
const path = require('path');

// 读取404.html文件
const filePath = path.join(process.cwd(), 'dist', '404.html');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // 将相对路径替换为绝对路径
  content = content.replace(/\.\/assets\//g, '/assets/');
  content = content.replace(/\.\.\/assets\//g, '/assets/');

  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('✅ Fixed 404.html asset paths');
} catch (error) {
  console.error('❌ Error fixing 404.html:', error);
  process.exit(1);
}