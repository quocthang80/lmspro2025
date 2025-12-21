const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'SUBMITTED', 'GRADED'),
    defaultValue: 'IN_PROGRESS'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  max_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: false
});

module.exports = QuizAttempt;
