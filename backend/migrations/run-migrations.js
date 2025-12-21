const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');
const { User, Role, UserRole } = require('../src/models');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    console.log('✓ All tables created');

    // Create roles
    const adminRole = await Role.create({
      name: 'ADMIN',
      description: 'Administrator with full access'
    });
    console.log('✓ Admin role created');

    const studentRole = await Role.create({
      name: 'STUDENT',
      description: 'Student with limited access'
    });
    console.log('✓ Student role created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@lms.com',
      password_hash: adminPassword,
      full_name: 'System Administrator',
      status: 'ACTIVE'
    });
    console.log('✓ Admin user created');

    // Assign admin role
    await UserRole.create({
      user_id: adminUser.id,
      role_id: adminRole.id
    });
    console.log('✓ Admin role assigned');

    // Create demo student
    const studentPassword = await bcrypt.hash('student123', 10);
    const studentUser = await User.create({
      email: 'student@lms.com',
      password_hash: studentPassword,
      full_name: 'Demo Student',
      status: 'ACTIVE'
    });
    console.log('✓ Demo student created');

    // Assign student role
    await UserRole.create({
      user_id: studentUser.id,
      role_id: studentRole.id
    });
    console.log('✓ Student role assigned');

    console.log('\n=================================');
    console.log('Database initialization complete!');
    console.log('=================================');
    console.log('\nDefault credentials:');
    console.log('Admin:');
    console.log('  Email: admin@lms.com');
    console.log('  Password: admin123');
    console.log('\nStudent:');
    console.log('  Email: student@lms.com');
    console.log('  Password: student123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
