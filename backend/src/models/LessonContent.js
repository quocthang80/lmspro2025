const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LessonContent = sequelize.define('LessonContent', {
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
  content_type: {
    type: DataTypes.ENUM('FILE', 'VIDEO', 'TEXT', 'QUIZ'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  file_asset_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'file_assets',
      key: 'id'
    }
  },
  embedded_media_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'embedded_media',
      key: 'id'
    }
  },
  text_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quiz_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'quizzes',
      key: 'id'
    }
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
  tableName: 'lesson_contents',
  timestamps: false
});

module.exports = LessonContent;
