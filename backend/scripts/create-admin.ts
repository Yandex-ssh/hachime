import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'tmc_career',
  });

  try {
    const adminEmail = 'admin@pathfinder.com';
    const [rows]: any = await connection.execute('SELECT * FROM students WHERE email = ?', [adminEmail]);

    if (rows.length > 0) {
      console.log('Admin already exists. Updating student number, password, and promoting to admin status...');
      const studentNumber = '99-9999';
      const password = 'adminpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute('UPDATE students SET student_number = ?, password_hash = ?, isAdmin = true, isActive = true WHERE email = ?', [studentNumber, hashedPassword, adminEmail]);
      console.log('Done.');
    } else {
      const password = 'adminpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const studentNumber = '99-9999';
      const name = 'System Admin';

      await connection.execute(
        'INSERT INTO students (student_number, name, email, password_hash, isAdmin, isActive, year_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [studentNumber, name, adminEmail, hashedPassword, true, true, 1]
      );

      console.log('Admin user created successfully!');
      console.log('Email: admin@pathfinder.com');
      console.log('Password: adminpassword123');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();
