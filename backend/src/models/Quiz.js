const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pass_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 70.00,
    comment: 'Percentage score required to pass'
  },
  time_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time limit in minutes'
  },
  max_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quizzes',
  timestamps: false
});

module.exports = Quiz;
