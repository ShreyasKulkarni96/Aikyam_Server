const { DataTypes } = require('sequelize');
const DB = require('../connection');
const Course = require('./CourseModel');
const Session = require('./SessionModel');
const Session_X_Topic = require('./Session_X_Topic');

const Topic = DB.define(
  'topics',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    topicName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    topicCode: {
      type: DataTypes.STRING(100),
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
    tableName: 'topics',
    timestamps: true,
    indexes: [
      {
        name: 'topic_name_ASC',
        fields: ['topicName']
      },
      {
        name: 'topic_code_Unique',
        unique: true,
        fields: ['topicCode']
      }
    ]
  }
);

// Association of Course with Topic : (One To Many)
Course.hasMany(Topic);
Topic.belongsTo(Course);

// Association of Sessions with Topic : (Many To Many)
Session.belongsToMany(Topic, { through: Session_X_Topic });
Topic.belongsToMany(Session, { through: Session_X_Topic });

module.exports = Topic;
