const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Role = require('./RoleModel');
const bcrypt = require('bcrypt');

const User = DB.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    DOB: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    gender: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    phone1: {
      type: DataTypes.STRING(20), // allow with Country Code
      allowNull: false
    },
    phone2: {
      type: DataTypes.STRING(20), // optional phone
      allowNull: true
    },
    localAddress: {
      type: DataTypes.TEXT(),
      allowNull: true
    },
    permanentAddress: {
      type: DataTypes.TEXT(), // local and permanent addresses can be same
      allowNull: true
    },
    // Unique Student ID : system Generated
    U_S_ID: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    isActive: {
      type: DataTypes.ENUM('A', 'I'),
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    tableName: 'users',
    timestamps: true,
    indexes: [
      // Create a unique index on email
      {
        name: 'Email',
        unique: true,
        fields: ['email']
      },
      // Create a unique index on Phone1
      {
        name: 'Phone1',
        unique: true,
        fields: ['phone1']
      },
      // Create an index on Name for quick search with Name
      {
        name: 'User_Name_ASC',
        fields: ['name']
      }
    ]
  }
);

// Schema Method to hash the password
User.beforeCreate(async (user, options) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
  user.isActive = 'A';
});

// Association of role with User
Role.hasOne(User, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
User.belongsTo(Role, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = User;
