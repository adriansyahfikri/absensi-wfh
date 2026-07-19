// For initialize admin account.
//
// Usage: node scripts/seed-admin.js [username] [password]
// Assumes `docker compose up` is running and MySQL's port is published to
// the host (reads connection details from .env at the repo root).

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'Admin123!';
  const hash = await bcrypt.hash(password, 10);
  const env = loadEnv();

  const connection = await mysql.createConnection({
    host: 'localhost', // running from the host machine, not inside Docker
    port: Number(env.DB_PORT) || 3306,
    user: env.DB_USERNAME || 'root',
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  try {
    const [existing] = await connection.execute(
      'SELECT id FROM user WHERE username = ?',
      [username],
    );
    if (existing.length > 0) {
      console.log(`User '${username}' already exists (id=${existing[0].id}) — nothing to do.`);
      return;
    }

    await connection.execute(
      'INSERT INTO user (username, password, role, employeeId, createdAt, updatedAt) VALUES (?, ?, ?, NULL, NOW(), NOW())',
      [username, hash, 'ADMIN'],
    );
    console.log(`Admin created: username=${username} password=${password}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Failed to seed admin:', err.message);
  process.exitCode = 1;
});
