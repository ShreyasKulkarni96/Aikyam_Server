const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Program = require('./ProgramModel');
const Session=require('./SessionModel');
const Batch=require('./BatchModel');
const Campus=require('./CampusModel');
const Course=require('./CourseModel');

const Event = DB.define(
  'event',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    locationId : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    batchType: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    
    programType: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
    programId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    courseId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      
      sessionId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    topics: {
      type: DataTypes.STRING(200),
      allowNull: null
    },
  },
  {
    freezeTableName: true,
    tableName: 'event',
    timestamps: true,
    indexes: [
      {
        name: 'events_OnDate',
        fields: ['startDate']
      }
    ]
  }
);

Event.belongsTo(Campus, { foreignKey: 'locationId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Event.belongsTo(Batch, { foreignKey: 'batchId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Event.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Event.belongsTo(Session, { foreignKey: 'sessionId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Event.belongsTo(Program, { foreignKey:'programId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });



module.exports = Event;
