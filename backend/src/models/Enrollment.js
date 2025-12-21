const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'),
    defaultValue: 'ENROLLED'
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  progress_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'enrollments',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    }
  ]
});

module.exports = Enrollment;
