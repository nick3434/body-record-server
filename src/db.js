const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  let dbPath = process.env.DATABASE_URL.replace(/^file:/, '');
  if (dbPath.startsWith('.')) {
    dbPath = path.resolve(__dirname, '..', dbPath);
  }
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const prisma = new PrismaClient();

module.exports = prisma;

