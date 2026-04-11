const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'admin123', database: 'tmc_career' });
  const [rows] = await conn.query('SELECT expanded_skills FROM skills WHERE skill_id=1');
  console.log("expanded_skills type:", typeof rows[0].expanded_skills);
  console.log("Is array?", Array.isArray(rows[0].expanded_skills));
  console.log("Value:", rows[0].expanded_skills);
  conn.end();
}
run();
