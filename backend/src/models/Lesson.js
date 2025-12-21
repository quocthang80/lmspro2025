const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  module_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'course_modules',
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
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
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
  tableName: 'lessons',
  timestamps: false
});

module.exports = Lesson;
