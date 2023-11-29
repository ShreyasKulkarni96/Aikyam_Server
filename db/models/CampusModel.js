const { DataTypes } = require('sequelize');
const DB = require('../connection');

const Campus = DB.define(
  'campuses',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    facilityName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    facilityAddress: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    contactPersonAddress: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    contactPersonPhone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    contactPersonEmail: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    spaceDetails: {
      type: DataTypes.JSON,
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
    tableName: 'campuses',
    timestamps: true,
    indexes: [
      {
        name: 'campus_city_ASC',
        fields: ['facilityName']
      }
    ]
  }
);

module.exports = Campus;
