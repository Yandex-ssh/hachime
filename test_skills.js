const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'tmc_career'
  });
  
  const [rows] = await conn.query('SELECT skill_id, skill_name, expanded_skills FROM skills WHERE JSON_LENGTH(expanded_skills) > 0 OR expanded_skills IS NOT NULL');
  console.log('DB Rows:', rows);
  
  if (rows.length > 0) {
     const r = rows[0];
     console.log('Type of expanded_skills:', typeof r.expanded_skills);
     console.log('Value:', r.expanded_skills);
     if (typeof r.expanded_skills === 'string') {
        const parsed = JSON.parse(r.expanded_skills);
        console.log('Parsed type:', typeof parsed);
        console.log('Parsed val:', parsed);
        if (typeof parsed === 'string') {
            console.log('Double parsed:', JSON.parse(parsed));
        }
     }
  }
  
  await conn.end();
}
check();
