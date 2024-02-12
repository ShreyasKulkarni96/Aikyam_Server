const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Course = require('./CourseModel');

const Session = DB.define(
  'sessions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    sessionName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sessionCode: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    timeDuration: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    sequence: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
    },
    isActive: {
      type: DataTypes.ENUM('A', 'I'),
      allowNull: false,
      defaultValue: 'A'
    }
  },
  {
    freezeTableName: true,
    tableName: 'sessions',
    timestamps: true,
    indexes: [
      {
        name: 'session_name_ASC',
        fields: ['sessionName']
      },
      {
        name: 'session_code_Unique',
        unique: true,
        fields: ['sessionCode']
      }
    ]
  }
);

// Association of Course with Session : (One To Many)
Course.hasMany(Session);
Session.belongsTo(Course);

module.exports = Session;
