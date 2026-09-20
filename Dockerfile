# 使用官方 Node.js 20 輕量版作為基礎映像
FROM node:20-slim

# 安裝 openssl (Prisma ORM 引擎所需依賴)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 設定容器內的工作目錄
WORKDIR /app

# 複製 package.json 與 package-lock.json
COPY package*.json ./

# 安裝生產環境依賴套件
RUN npm install --omit=dev

# 複製 Prisma Schema
COPY prisma ./prisma/

# 生成 Prisma Client 客戶端代碼
RUN npx prisma generate

# 複製其餘後端原始碼
COPY src ./src/

# 建立用於存放 SQLite 資料庫的持久化目錄
RUN mkdir -p /app/data

# 設定預設環境變數
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:/app/data/body_record.db"

# 暴露服務埠號
EXPOSE 5000

# 容器啟動指令：先自動同步/建立 SQLite 資料庫結構，再啟動 Express 伺服器
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
