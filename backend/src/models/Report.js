const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  report_type: {
    type: DataTypes.ENUM('COURSE_PROGRESS', 'STUDENT_PROGRESS', 'QUIZ_RESULTS', 'ENROLLMENT_SUMMARY'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED'),
    defaultValue: 'PENDING'
  },
  file_asset_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'file_assets',
      key: 'id'
    }
  },
  generated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reports',
  timestamps: false
});

module.exports = Report;
