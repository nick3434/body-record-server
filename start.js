const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 確保 SQLite 資料庫目錄存在
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  let dbPath = process.env.DATABASE_URL.replace(/^file:/, '');
  if (dbPath.startsWith('.')) {
    dbPath = path.resolve(__dirname, dbPath);
  }
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 已自動建立 SQLite 資料夾: ${dir}`);
  }
}

// 找到 schema.prisma 路徑
const schemaPath = fs.existsSync(path.join(__dirname, 'prisma', 'schema.prisma'))
  ? path.join(__dirname, 'prisma', 'schema.prisma')
  : path.join(__dirname, 'schema.prisma');

// 啟動前先生成 Prisma Client
console.log(`🔄 正在生成 Prisma Client (schema: ${schemaPath})...`);
try {
  execSync(`npx prisma generate --schema="${schemaPath}"`, { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️ Prisma generate 警告:', err.message);
}

// 自動推送資料庫 schema (建立或更新 table)
console.log('🔄 正在同步資料庫結構 (Prisma db push)...');
try {
  execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️ Prisma db push 執行提示:', err.message);
}

// 啟動 Express 伺服器
require('./src/index.js');
