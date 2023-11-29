const { DataTypes } = require('sequelize');
const DB = require('../connection');
const User = require('./UserModel');

const Faculty = DB.define(
  'faculty_details',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // Unique Student ID : system Generated
    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    facultyType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    availability: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
    },
    remunerationPlan: {
      type: DataTypes.STRING(20),
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
    careerDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    freezeTableName: true,
    tableName: 'faculty_details',
    timestamps: true,
    indexes: [
      {
        name: 'Employee_ID_Unique',
        unique: true,
        fields: ['employeeId']
      }
    ]
  }
);

// Association of Student with User : (One To One)
User.hasOne(Faculty, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Faculty.belongsTo(User, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

module.exports = Faculty;
