// scripts/runMigrations.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const migrationDir = path.join(__dirname, '../src/migrations');
const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();

files.forEach(file => {
  const fullPath = path.join(migrationDir, file);
  const sql = fs.readFileSync(fullPath, 'utf8');

  const psql = spawn('psql', [
    '-h', process.env.DB_HOST || 'localhost',
    '-p', process.env.DB_PORT || '5432',
    '-U', process.env.DB_USER || 'postgres',
    '-d', process.env.DB_NAME || 'turfmate',
    '-c', sql
  ], {
    env: {
      ...process.env,
      PGPASSWORD: process.env.DB_PASSWORD
    }
  });

  psql.stdout.on('data', (data) => {
    console.log(`[Migration ${file}] ${data}`);
  });

  psql.stderr.on('data', (data) => {
    console.error(`[Migration ${file} ERROR] ${data}`);
  });

  psql.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Migration ${file} completed`);
    } else {
      console.error(`❌ Migration ${file} failed`);
      process.exit(1);
    }
  });
});