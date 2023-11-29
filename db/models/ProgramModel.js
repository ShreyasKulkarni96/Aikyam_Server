const { DataTypes } = require('sequelize');
const DB = require('../connection');

const Program = DB.define(
  'programs',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    programName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    programCode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    details: {
      type: DataTypes.STRING(100),
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
    tableName: 'programs',
    timestamps: true,
    indexes: [
      {
        name: 'program_name_ASC',
        fields: ['programName']
      },
      {
        name: 'program_code_Unique',
        unique: true,
        fields: ['programCode']
      }
    ]
  }
);

module.exports = Program;
