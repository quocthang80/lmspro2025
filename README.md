# LMS - Learning Management System

A comprehensive Learning Management System with separate interfaces for Administrators and Students. Built with Node.js/Express backend and React frontend.

## Features

### Admin Features
- **User Management**: Create, edit, and manage students and admin accounts
- **Course Management**: Create courses with modules and lessons
- **Content Management**: Add videos, documents, text, and quizzes to lessons
- **Enrollment Management**: Enroll students in courses
- **Progress Tracking**: Monitor student progress and performance
- **Quiz Management**: Create quizzes with automatic grading
- **Reporting**: Generate progress and performance reports

### Student Features
- **Course Enrollment**: Browse and enroll in available courses
- **Learning Dashboard**: View enrolled courses and progress
- **Interactive Learning**: Access videos, documents, and text content
- **Quiz Taking**: Complete quizzes with immediate feedback
- **Progress Tracking**: Track completion percentage for each course
- **Achievement System**: View completion status and scores

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT authentication
- bcrypt for password hashing
- Multer for file uploads

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management
- Vite for build tooling

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd /home/user/webapp
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for both backend and frontend.

### 3. Set up PostgreSQL database

Create a new PostgreSQL database:

```sql
CREATE DATABASE lms_db;
```

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 5. Initialize the database

Run the migration script to create tables and seed initial data:

```bash
cd backend
npm run migrate
```

This will create:
- All database tables
- Admin role and Student role
- Default admin user (admin@lms.com / admin123)
- Demo student user (student@lms.com / student123)

## Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Credentials

### Admin Account
- Email: admin@lms.com
- Password: admin123

### Student Account
- Email: student@lms.com
- Password: student123

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "roleName": "STUDENT"
}
```

#### GET /api/auth/me
Get current user information (requires authentication)

### Course Endpoints

#### GET /api/courses
Get all courses (with optional filters)
Query params: `status`, `search`, `page`, `limit`

#### GET /api/courses/:id
Get course details with modules and lessons

#### POST /api/courses
Create a new course (Admin only)
```json
{
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

#### PUT /api/courses/:id
Update course details (Admin only)

#### PUT /api/courses/:id/publish
Publish a course (Admin only)

#### DELETE /api/courses/:id
Archive a course (Admin only)

### Enrollment Endpoints

#### GET /api/enrollments
Get all enrollments
Query params: `courseId`, `userId`, `status`

#### POST /api/enrollments
Enroll a user in a course
```json
{
  "courseId": "uuid",
  "userId": "uuid"
}
```

#### POST /api/enrollments/bulk
Bulk enroll multiple users
```json
{
  "courseId": "uuid",
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Progress Tracking Endpoints

#### POST /api/progress/events
Track a learning event
```json
{
  "enrollmentId": "uuid",
  "lessonContentId": "uuid",
  "eventType": "VIEW",
  "watchedDuration": 120,
  "totalDuration": 150
}
```

#### GET /api/progress/summary
Get progress summary for an enrollment
Query params: `enrollmentId`, `lessonId`

### Quiz Endpoints

#### GET /api/quizzes
Get all quizzes

#### GET /api/quizzes/:id
Get quiz details

#### POST /api/quizzes
Create a new quiz (Admin only)

#### POST /api/quizzes/:id/attempts
Start a quiz attempt
```json
{
  "enrollmentId": "uuid"
}
```

#### POST /api/quizzes/attempts/:id/submit
Submit quiz responses
```json
{
  "responses": [
    {
      "questionId": "uuid",
      "optionId": "uuid"
    }
  ]
}
```

## Database Schema

The system includes the following main tables:

- **users**: User accounts (students and admins)
- **roles**: User roles (ADMIN, STUDENT)
- **user_roles**: User-role associations
- **courses**: Course information
- **course_modules**: Course modules/chapters
- **lessons**: Individual lessons within modules
- **lesson_contents**: Content items (video, file, text, quiz)
- **file_assets**: Uploaded files
- **embedded_media**: External media (YouTube, Vimeo)
- **enrollments**: Student-course enrollments
- **progress_events**: Learning activity events
- **progress_summary**: Aggregated progress data
- **quizzes**: Quiz definitions
- **quiz_questions**: Quiz questions
- **quiz_options**: Multiple choice options
- **quiz_attempts**: Student quiz attempts
- **quiz_responses**: Individual question responses
- **reports**: Generated reports
- **audit_logs**: System activity logs

## Progress Tracking Rules

### Video Content
- Completion threshold: 80% of video duration watched
- Progress events track watched duration

### Document/File Content
- Completion: When file is downloaded or viewed
- Progress tracked via DOWNLOAD/VIEW events

### Text Content
- Completion: When content is marked as read
- Single VIEW event marks as complete

### Quiz Content
- Completion: When quiz is submitted and score ≥ pass_score
- Multiple attempts allowed (configurable per quiz)

### Lesson Completion
- A lesson is complete when all required contents are complete
- Progress calculated as: (completed required items / total required items) × 100%

### Course Completion
- A course is complete when all required lessons are complete
- Overall progress calculated across all required lessons
- Status automatically updated to COMPLETED when 100% reached

## Project Structure

```
lms-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── courseController.js
│   │   │   ├── moduleController.js
│   │   │   ├── lessonController.js
│   │   │   ├── contentController.js
│   │   │   ├── enrollmentController.js
│   │   │   ├── progressController.js
│   │   │   ├── quizController.js
│   │   │   └── reportController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── checkRole.js
│   │   │   └── auditLog.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Role.js
│   │   │   ├── Course.js
│   │   │   ├── Enrollment.js
│   │   │   └── ... (other models)
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── courses.js
│   │   │   └── ... (other routes)
│   │   └── index.js
│   ├── migrations/
│   │   └── run-migrations.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── LessonView.jsx
│   │   │   └── QuizTake.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Protected API routes
- Audit logging for admin actions
- Input validation and sanitization

## Future Enhancements

- Email notifications for enrollment and completion
- Advanced reporting with charts and analytics
- Discussion forums for courses
- Live video streaming
- Mobile app support
- Gamification features (badges, leaderboards)
- Certificate generation
- Integration with external services (Zoom, Google Drive, AWS S3)
- Advanced quiz types (essay, matching, fill-in-the-blank)
- Peer review assignments
- Calendar integration
- Multi-language support

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE lms_db;`

### Port Already in Use
- Change `PORT` in `.env` for backend
- Change port in `frontend/vite.config.js` for frontend

### Authentication Errors
- Clear browser localStorage
- Check JWT_SECRET in `.env`
- Verify token expiration settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues and questions, please create an issue in the repository.

## Authors

LMS System Development Team

---

**Happy Learning! 🎓**
