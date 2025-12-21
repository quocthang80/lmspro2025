# Quick Start Guide

## Setup Instructions

### 1. Prerequisites Check
```bash
# Check Node.js version (should be v16+)
node --version

# Check PostgreSQL (should be v12+)
psql --version

# Check npm
npm --version
```

### 2. Database Setup

Create the database:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lms_db;

# Exit PostgreSQL
\q
```

### 3. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all
```

### 4. Configure Environment

The `.env` file is already created. Update with your database credentials if needed:
```bash
# Edit .env file
nano .env

# Or use your preferred editor
# Update DB_USER and DB_PASSWORD to match your PostgreSQL setup
```

### 5. Initialize Database

```bash
# Run migrations to create tables and seed data
cd backend
npm run migrate
cd ..
```

This creates:
- All database tables
- Admin user: admin@lms.com / admin123
- Student user: student@lms.com / student123

### 6. Start the Application

```bash
# Start both backend and frontend
npm run dev
```

Or start separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 8. Login

**Admin Account:**
- Email: admin@lms.com
- Password: admin123

**Student Account:**
- Email: student@lms.com
- Password: student123

## Testing the System

### As Admin:

1. **Create a Course:**
   - Go to Admin Dashboard
   - Click "Courses" tab
   - Click "+ Create Course"
   - Fill in course details
   - Save and publish

2. **Add Modules and Lessons:**
   - Click "View" on a course
   - Add modules and lessons
   - Add content (text, videos, files, quizzes)

3. **Enroll Students:**
   - Go to "Enrollments" tab
   - Create new enrollment
   - Select student and course

4. **Create Quizzes:**
   - Navigate to a lesson
   - Create quiz with questions
   - Set pass score and time limit

### As Student:

1. **Browse Courses:**
   - Login as student
   - View "Available Courses" tab
   - Enroll in courses

2. **Take Lessons:**
   - Go to "My Courses"
   - Click "Continue Learning"
   - Complete lessons and content

3. **Take Quizzes:**
   - Access quizzes in lessons
   - Submit answers
   - View results immediately

4. **Track Progress:**
   - View progress percentage
   - See completion status

## Common Issues

### Port Already in Use
```bash
# Change backend port in .env
PORT=5001

# Change frontend port in frontend/vite.config.js
server: { port: 3001 }
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Or on Mac
brew services list

# Check database exists
psql -U postgres -l
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

### JWT Token Errors
- Clear browser localStorage
- Login again
- Check JWT_SECRET in .env

## Development Tips

### API Testing
Use tools like Postman or curl:
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'

# Get courses (with token)
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Inspection
```bash
# Connect to database
psql -U postgres -d lms_db

# List tables
\dt

# View table structure
\d users

# Query data
SELECT * FROM users;
```

### Reset Database
```bash
cd backend
npm run migrate
```
This will drop all tables and recreate them with seed data.

## Next Steps

1. **Create Sample Content:**
   - Add multiple courses with modules
   - Create diverse lesson content
   - Design comprehensive quizzes

2. **Test Progress Tracking:**
   - Enroll students
   - Have them complete lessons
   - Verify progress calculations

3. **Generate Reports:**
   - Access Reports tab
   - Generate various report types
   - Export to CSV/PDF

4. **Customize:**
   - Modify styles in CSS files
   - Add new features
   - Extend API endpoints

## Support

For detailed documentation, see README.md

For issues:
1. Check console logs (browser and terminal)
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check API responses in Network tab

## Production Deployment

Before deploying to production:

1. **Security:**
   - Change JWT_SECRET to a strong random string
   - Update default admin password
   - Enable HTTPS
   - Set NODE_ENV=production

2. **Database:**
   - Use managed PostgreSQL service
   - Enable backups
   - Set up connection pooling

3. **Environment:**
   - Set proper CORS origins
   - Configure file upload limits
   - Enable rate limiting

4. **Monitoring:**
   - Add error tracking (Sentry)
   - Set up logging (Winston)
   - Monitor performance (PM2)

---

**Happy Developing! 🚀**
