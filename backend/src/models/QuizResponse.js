const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizResponse = sequelize.define('QuizResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  attempt_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_attempts',
      key: 'id'
    }
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_questions',
      key: 'id'
    }
  },
  option_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'quiz_options',
      key: 'id'
    }
  },
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  answered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_responses',
  timestamps: false
});

module.exports = QuizResponse;
