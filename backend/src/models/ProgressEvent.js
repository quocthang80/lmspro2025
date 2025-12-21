const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressEvent = sequelize.define('ProgressEvent', {
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
  lesson_content_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lesson_contents',
      key: 'id'
    }
  },
  event_type: {
    type: DataTypes.ENUM('VIEW', 'DOWNLOAD', 'QUIZ_START', 'QUIZ_SUBMIT', 'COMPLETED'),
    allowNull: false
  },
  watched_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds for video content'
  },
  total_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total duration in seconds'
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  event_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'progress_events',
  timestamps: false
});

module.exports = ProgressEvent;
