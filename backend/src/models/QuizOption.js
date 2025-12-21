const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizOption = sequelize.define('QuizOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'quiz_questions',
      key: 'id'
    }
  },
  option_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'quiz_options',
  timestamps: false
});

module.exports = QuizOption;
