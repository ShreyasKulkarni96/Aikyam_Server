const { DataTypes } = require('sequelize');
const DB = require('../connection');
const User = require('./UserModel');

const Leave = DB.define('leave', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE, // Adjusted data type
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE, // Adjusted data type
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approverId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  freezeTableName: true,
  tableName: 'leaves',
  timestamps: true
});

// Define associations
Leave.belongsTo(User, { foreignKey: 'userId', as: 'requester' });
Leave.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

module.exports = Leave;
