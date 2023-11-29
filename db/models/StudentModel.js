const { DataTypes } = require('sequelize');
const DB = require('../connection');
const User = require('./UserModel');

const Student = DB.define(
  'student_details',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // Unique Student ID : system Generated
    U_S_ID: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    guardianDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    academicDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    accountDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    attendanceDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    performanceDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    facultyObservations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    custom1: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    freezeTableName: true,
    tableName: 'student_details',
    timestamps: true,
    indexes: [
      {
        name: 'U_S_ID_Unique',
        unique: true,
        fields: ['U_S_ID']
      }
    ]
  }
);

// Association of Student with User : (One To One)
User.hasOne(Student, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Student.belongsTo(User, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = Student;
