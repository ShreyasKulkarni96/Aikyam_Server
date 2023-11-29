const { DataTypes } = require('sequelize');
const DB = require('../connection');

const AcademicYear = DB.define(
  'academic_years',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
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
    tableName: 'academic_years',
    timestamps: true,
    indexes: [
      {
        name: 'academicYear_name_ASC',
        fields: ['name']
      }
    ]
  }
);

module.exports = AcademicYear;
