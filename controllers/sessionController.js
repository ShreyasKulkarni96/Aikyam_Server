const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CourseModel = require('../db/models/CourseModel');
const SessionModel = require('../db/models/SessionModel');
const TopicModel = require('../db/models/TopicModel');
const Session_X_Topic = require('../db/models/Session_X_Topic');
const { validateSession } = require('../utils/validations');
const { Op } = require('sequelize');
const { excludeWords } = require('../utils/validations');

const addSession = asyncWrapper(async (req, res, next) => {
  // VALIDATION
  const validData = validateSession(req.body);
  const { sessionName } = validData;
  // INSERT INTO DB
  const course = await CourseModel.findByPk(req.body.courseId);
  if (!course) throw new AppError(400, `Course with Id ${req.body.courseId} does not exist`);

  //CRS/****/CR/SES/****/V1.0
  const sessionCode = `CRS/${course.courseName
    .split(' ')
    .map(item => (!excludeWords.includes(item) ? item.charAt(0) : ''))
    .join('')
    .toUpperCase()}/${req.body.type === 'core' ? 'CR' : 'EL'}/SES/${validData.sequence.replaceAll(' ', '')}/V1.0`;

  const sessionPresent = await SessionModel.findOne({ where: { [Op.or]: [{ sessionName }, { sessionCode }] } });
  if (sessionPresent) throw new AppError(400, `Program with the given Name or Code ${sessionCode} already exists`);

  const newSession = await SessionModel.create({ ...validData, sessionCode });

  successResp(res, newSession, 'Session created successfully', 201);
});

const getAllSessions = asyncWrapper(async (req, res, next) => {
  const courseId = parseInt(req.query.courseId);
  if (courseId) {
    const Sessions = await SessionModel.findAll({
      offset: req.query.offset,
      limit: req.query.limit,
      include: {
        model: CourseModel,
        attributes: {
          exclude: ['details', 'createdAt', 'updatedAt'],
          include: ['id', 'courseName', 'courseCode', ['type', 'courseType'], 'isActive']
        },
        where: { id: courseId }
        // required: true // - For forcing it do an INNER JOIN
      }
      // attributes: {
      //   exclude: ['courseId']
      // }
    });
    return successResp(res, Sessions, 'fetched successfully');
  }

  const sessions = await SessionModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    attributes: req.query.fields,
    include: {
      model: CourseModel,
      attributes: {
        exclude: ['details', 'createdAt', 'updatedAt'],
        include: ['id', 'courseName', 'courseCode', ['type', 'courseType'], 'isActive']
      }
    }
  });
  successResp(res, sessions, 'fetched successfully');
});

const getSession = asyncWrapper(async (req, res, next) => {
  if (req.params.sessionId < 0) throw new AppError(400, `Invalid Session ID`);

  const session = await SessionModel.findByPk(req.params.sessionId, { include: CourseModel });
  if (!session) throw new AppError(404, `Session with id ${req.params.sessionId} does not exist`);

  successResp(res, session, 'fetched successfully');
});

const updateSession = asyncWrapper(async (req, res, next) => {
  // VALIDATIONS
  const validatedSessionDetails = validateSession(req.body);

  const session = await SessionModel.findByPk(req.params.sessionId);
  if (!session) throw new AppError(400, `session with Id ${req.params.sessionId} does not exist`);

  // Update the session's properties with the new data
  await session.update(
    {
      sessionName: validatedSessionDetails.sessionName,
      type: validatedSessionDetails.type,
      sessionType: validatedSessionDetails.sessionType,
      sequence: validatedSessionDetails.sequence,
      timeDuration: validatedSessionDetails.timeDuration,
      description: validatedSessionDetails.description
    },
    { where: { id: session.id } }
  );

  successResp(res, session, 'Session updated successfully');
});

const deleteSession = asyncWrapper(async (req, res, next) => {
  if (!req.params.sessionId) throw new AppError(400, 'Missing required `sessionId` param');
  const session = await SessionModel.findByPk(req.params.sessionId);
  if (!session) throw new AppError(400, `Session with Id ${req.params.sessionId} does not exist`);

  // check if any Session linked to topics
  const topicExists = await Session_X_Topic.count({ where: { sessionId: session.id } });
  if (topicExists) throw new AppError(403, `Cannot delete Session as Topics are linked to it.`);

  try {
    await SessionModel.destroy({ where: { id: req.params.sessionId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Session as it's already in use`);
    }
    throw err;
  }
  successResp(res, {}, 'Session deleted successfully');
});

module.exports = {
  addSession,
  getAllSessions,
  getSession,
  updateSession,
  deleteSession
};
