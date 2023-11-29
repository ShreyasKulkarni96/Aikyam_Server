const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Session = require('./SessionModel');
const Topic = require('./TopicModel');

const Session_X_Topic = DB.define(
  'session_x_topic',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sessionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Session,
        key: 'id'
      }
    },
    topicId: {
      type: DataTypes.INTEGER,
      references: {
        model: Topic,
        key: 'id'
      }
    }
  },
  {
    freezeTableName: true,
    timestamps: true
  }
);

module.exports = Session_X_Topic;
