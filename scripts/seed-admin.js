// One-off dev tool for the bootstrap problem: POST /employees requires an
// ADMIN token, but there is no admin yet on a fresh database. This script
// only prints the bcrypt hash + INSERT statement — it does not touch the
// database itself, so it's safe to run against any environment.
//
// Usage: node scripts/seed-admin.js [username] [password]

const bcrypt = require('bcrypt');

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'Admin123!';
  const hash = await bcrypt.hash(password, 10);

  console.log(`username: ${username}`);
  console.log(`password: ${password}`);
  console.log('\nRun this against the wfh_attendance database (e.g. via a MySQL client connected to the mysql container):\n');
  console.log(
    `INSERT INTO user (username, password, role, employeeId, createdAt, updatedAt) VALUES ('${username}', '${hash}', 'ADMIN', NULL, NOW(), NOW());`,
  );
}

main();
