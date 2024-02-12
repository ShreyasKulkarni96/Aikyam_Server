const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Program = require('./ProgramModel');
const AcademicYear = require('./AcademicYearModel');
const Student = require('./StudentModel');
const BatchStudentRelation = require('./BatchStudentRelation');

const Batch = DB.define(
  'batches',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    batchCode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    startDate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    endDate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    capacity: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    enrolled: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.ENUM('A', 'I'),
      allowNull: false,
      defaultValue: 'A'
    },
  },
  {
    freezeTableName: true,
    tableName: 'batches',
    timestamps: true,
    indexes: [
      {
        name: 'batchCode_name_ASC',
        fields: ['batchCode']
      }
    ]
  }
);

// Associations of Batch with Program: (One to One)
Program.hasOne(Batch, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Batch.belongsTo(Program, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Associations of AcademicYear with Batch: (One to Many)
AcademicYear.hasMany(Batch, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Batch.belongsTo(AcademicYear, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Batch.belongsToMany(Student, { through: BatchStudentRelation, foreignKey: 'batchId', otherKey: 'studentId' });


module.exports = Batch;
