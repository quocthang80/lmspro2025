const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Course = require('./Course');
const CourseModule = require('./CourseModule');
const Lesson = require('./Lesson');
const LessonContent = require('./LessonContent');
const FileAsset = require('./FileAsset');
const EmbeddedMedia = require('./EmbeddedMedia');
const Enrollment = require('./Enrollment');
const ProgressEvent = require('./ProgressEvent');
const ProgressSummary = require('./ProgressSummary');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizOption = require('./QuizOption');
const QuizAttempt = require('./QuizAttempt');
const QuizResponse = require('./QuizResponse');
const Report = require('./Report');
const AuditLog = require('./AuditLog');

// User <-> Role (Many-to-Many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', as: 'users' });

// Course relationships
Course.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Course.hasMany(CourseModule, { foreignKey: 'course_id', as: 'modules' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });

// CourseModule relationships
CourseModule.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CourseModule.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons' });

// Lesson relationships
Lesson.belongsTo(CourseModule, { foreignKey: 'module_id', as: 'module' });
Lesson.hasMany(LessonContent, { foreignKey: 'lesson_id', as: 'contents' });
Lesson.hasOne(Quiz, { foreignKey: 'lesson_id', as: 'quiz' });
Lesson.hasMany(ProgressSummary, { foreignKey: 'lesson_id', as: 'progressSummaries' });

// LessonContent relationships
LessonContent.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
LessonContent.belongsTo(FileAsset, { foreignKey: 'file_asset_id', as: 'fileAsset' });
LessonContent.belongsTo(EmbeddedMedia, { foreignKey: 'embedded_media_id', as: 'embeddedMedia' });
LessonContent.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
LessonContent.hasMany(ProgressEvent, { foreignKey: 'lesson_content_id', as: 'progressEvents' });

// FileAsset relationships
FileAsset.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Enrollment relationships
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Enrollment.hasMany(ProgressEvent, { foreignKey: 'enrollment_id', as: 'progressEvents' });
Enrollment.hasMany(ProgressSummary, { foreignKey: 'enrollment_id', as: 'progressSummaries' });
Enrollment.hasMany(QuizAttempt, { foreignKey: 'enrollment_id', as: 'quizAttempts' });

// ProgressEvent relationships
ProgressEvent.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
ProgressEvent.belongsTo(LessonContent, { foreignKey: 'lesson_content_id', as: 'lessonContent' });

// ProgressSummary relationships
ProgressSummary.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
ProgressSummary.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// Quiz relationships
Quiz.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });

// QuizQuestion relationships
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizQuestion.hasMany(QuizOption, { foreignKey: 'question_id', as: 'options' });
QuizQuestion.hasMany(QuizResponse, { foreignKey: 'question_id', as: 'responses' });

// QuizOption relationships
QuizOption.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });

// QuizAttempt relationships
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizAttempt.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
QuizAttempt.hasMany(QuizResponse, { foreignKey: 'attempt_id', as: 'responses' });

// QuizResponse relationships
QuizResponse.belongsTo(QuizAttempt, { foreignKey: 'attempt_id', as: 'attempt' });
QuizResponse.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });
QuizResponse.belongsTo(QuizOption, { foreignKey: 'option_id', as: 'option' });

// Report relationships
Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });
Report.belongsTo(FileAsset, { foreignKey: 'file_asset_id', as: 'file' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Course,
  CourseModule,
  Lesson,
  LessonContent,
  FileAsset,
  EmbeddedMedia,
  Enrollment,
  ProgressEvent,
  ProgressSummary,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizAttempt,
  QuizResponse,
  Report,
  AuditLog
};
