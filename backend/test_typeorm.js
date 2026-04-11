require('ts-node/register');
const { DataSource } = require('typeorm');
const { Skill } = require('./src/entities/skill.entity.ts');

async function run() {
  const ds = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'admin123',
    database: 'tmc_career',
    entities: [Skill],
    synchronize: false,
  });
  await ds.initialize();
  const repo = ds.getRepository(Skill);
  
  // 1. Update using standard array
  await repo.update(1, { expanded_skills: [{name: "UI Tested Tool", url: "http://ui"}] });
  
  // 2. Fetch using query()
  const [rows] = await repo.query('SELECT expanded_skills FROM skills WHERE skill_id=1');
  console.log("From .query(): typeof =", typeof rows.expanded_skills, ", value =", rows.expanded_skills);
  
  // 3. Fetch using find()
  const skill = await repo.findOne({ where: { skill_id: 1 } });
  console.log("From .find(): typeof =", typeof skill.expanded_skills, ", value =", skill.expanded_skills);
  
  await ds.destroy();
}
run();
