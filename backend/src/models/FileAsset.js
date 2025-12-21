const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FileAsset = sequelize.define('FileAsset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  file_name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Size in bytes'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'file_assets',
  timestamps: false
});

module.exports = FileAsset;
