const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmbeddedMedia = sequelize.define('EmbeddedMedia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  media_type: {
    type: DataTypes.ENUM('YOUTUBE', 'VIMEO', 'CDN'),
    allowNull: false
  },
  embed_url: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
  },
  thumbnail_url: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'embedded_media',
  timestamps: false
});

module.exports = EmbeddedMedia;
