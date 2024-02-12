const asyncWrapper = require('express-async-wrapper');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CourseModel = require('../db/models/CourseModel');
const SessionModel = require('../db/models/SessionModel');
const TopicModel = require('../db/models/TopicModel');
const { validateTopic } = require('../utils/validations');
const { excludeWords } = require('../utils/validations');

const addTopic = asyncWrapper(async (req, res, next) => {
  // VALIDATION
  const validatedTopic = validateTopic(req.body);
  // Check if Course and Sessions Exist in DB
  const course = await CourseModel.findByPk(req.body.courseId);
  if (!course) throw new AppError(400, `Course with Id ${req.body.sessionId} does not exist`);

  const sessions = await SessionModel.findAll({ where: { id: { [Op.in]: req.body.sessionIds } } });

  if (!sessions || sessions.length < req.body.sessionIds.length) {
    throw new AppError(400, `One or more Sessions with given sessionIds does not exist`);
  }

  // CRS/****/****/V1.0
  const topicCode = `CRS/${course.courseName
    .split(' ')
    .map(item => (item.length > 3 ? item.charAt(0) : ''))
    .join('')
    .toUpperCase()}/${validatedTopic.topicName
      .split(' ')
      .map(item => (!excludeWords.includes(item) ? item.charAt(0) : ''))
      .join('')
      .toUpperCase()}/V1.0`;

  const newTopic = { ...validatedTopic };
  newTopic.sessionIds;
  newTopic.topicCode = topicCode;
  const { topicName } = newTopic;

  const topicPresent = await TopicModel.findOne({ where: { [Op.or]: [{ topicName }, { topicCode }] } });
  if (topicPresent) throw new AppError(400, `Program with the given Name or Code ${topicCode} already exists`);

  // INSERT INTO Topic
  const topic = await TopicModel.create(newTopic);
  // INSERT INTO Session_X_Topic junction table
  await topic.addSessions(sessions);

  successResp(res, topic, 'Topic created successfully', 201);
});

const getAllTopics = asyncWrapper(async (req, res, next) => {
  const sessionId = parseInt(req.query.sessionId);
  if (sessionId) {
    const topics = await TopicModel.findAll({
      offset: req.query.offset,
      limit: req.query.limit,
      include: {
        model: SessionModel,
        attributes: {
          exclude: ['details', 'createdAt', 'updatedAt'],
          include: ['id', 'sessionName', 'sessionCode', 'type', 'isActive']
        },
        where: { id: sessionId }
        // required: true    // - For forcing it do an INNER JOIN
      },
      attributes: {
        exclude: ['sessionId']
      }
    });
    return successResp(res, topics, 'fetched successfully');
  }

  const topics = await TopicModel.findAll({ offset: req.query.offset, limit: req.query.limit, attributes: req.query.fields });
  successResp(res, topics, 'fetched successfully');
});

const getTopic = asyncWrapper(async (req, res, next) => {
  if (req.params.topicId < 0) throw new AppError(400, `Invalid Topic ID`);
  const topic = await TopicModel.findByPk(req.params.topicId, { include: SessionModel });
  if (!topic) throw new AppError(404, `Topic with id ${req.params.topicId} does not exist`);
  successResp(res, topic, 'fetched successfully');
});

const updateTopic = asyncWrapper(async (req, res, next) => {
  const validatedTopic = validateTopic(req.body);

  // Find the Topic to be updated
  const topic = await TopicModel.findByPk(req.params.topicId);
  if (!topic) throw new AppError(400, `Topic with Id ${req.params.topicId} does not exist`);

  await topic.update(
    {
      topicName: validatedTopic.topicName,
      description: validatedTopic.description,
      updatedAt: new Date().toString()
    },
    { where: { id: req.params.topicId } }
  );
  successResp(res, topic, 'Topic updated successfully');
});

const deleteTopic = asyncWrapper(async (req, res, next) => {
  if (!req.params.topicId) throw new AppError(400, 'Missing required `topicId` param');
  const topic = await TopicModel.findByPk(req.params.topicId);
  if (!topic) throw new AppError(400, `Topic with Id ${req.params.topicId} does not exist`);

  // check if any Courses linked to the Program
  if (topic.courseId !== null) throw new AppError(403, `Cannot delete Topic as it is linked with a course.`);

  try {
    await TopicModel.destroy({ where: { id: req.params.topicId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Topic as it's already in use`);
    }
    throw err;
  }

  successResp(res, {}, 'Topic deleted successfully');
});

module.exports = {
  addTopic,
  getAllTopics,
  getTopic,
  updateTopic,
  deleteTopic
};
