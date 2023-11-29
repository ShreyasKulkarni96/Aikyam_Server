const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Program = require('./ProgramModel');

const Course = DB.define(
  'courses',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    courseCode: {
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
    isActive: {
      type: DataTypes.ENUM('A', 'I'),
      allowNull: false,
      defaultValue: 'A'
    }
  },
  {
    freezeTableName: true,
    tableName: 'courses',
    timestamps: true,
    indexes: [
      {
        name: 'course_name_ASC',
        fields: ['courseName']
      },
      {
        name: 'course_code_Unique',
        unique: true,
        fields: ['courseCode']
      }
    ]
  }
);

// Association of Program with Course : (One To Many)
Program.hasMany(Course, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Course.belongsTo(Program, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = Course;
