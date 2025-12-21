const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'),
    defaultValue: 'MULTIPLE_CHOICE'
  },
  points: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.00
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_questions',
  timestamps: false
});

module.exports = QuizQuestion;
