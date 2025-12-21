const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressSummary = sequelize.define('ProgressSummary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'enrollments',
      key: 'id'
    }
  },
  lesson_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  completion_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  quiz_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  last_accessed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'progress_summary',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['enrollment_id', 'lesson_id']
    }
  ]
});

module.exports = ProgressSummary;
