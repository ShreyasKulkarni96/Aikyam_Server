const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CourseModel = require('../db/models/CourseModel');
const ProgramModel = require('../db/models/ProgramModel');
const SessionModel = require('../db/models/SessionModel');
const TopicModel = require('../db/models/TopicModel');
const { validateCourse } = require('../utils/validations');
const { Op } = require('sequelize');
const { excludeWords } = require('../utils/validations');

const addCourse = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a Course');

  // VALIDATION
  console.log(req.body);
  const validatedCourse = validateCourse(req.body);
  const { courseName } = validatedCourse;
  // INSERT INTO DB
  const program = await ProgramModel.findByPk(validatedCourse.programId);
  if (!program) throw new AppError(400, `Program with Id ${validatedCourse.programId} does not exist`);
  if (program.type !== validatedCourse.type) {
    throw new AppError(400, `Can't add Elective Course to a Core Program and vice-versa`);
  }
  const courseCode = `CRS/${req.body.courseName
    .split(' ')
    .map(item => (!excludeWords.includes(item) ? item.charAt(0) : ''))
    .join('')
    .toUpperCase()}/${req.body.type === 'core' ? 'CR' : 'EL'}/V1.0`;

  const coursePresent = await CourseModel.findOne({ where: { [Op.or]: [{ courseName }, { courseCode }] } });
  if (coursePresent) throw new AppError(400, `Program with the given Name or Code ${courseCode} already exists`);

  const newCourse = await CourseModel.create({ ...req.body, courseCode });

  successResp(res, newCourse, 'Course created successfully', 201);
});

const getAllCourses = asyncWrapper(async (req, res, next) => {
  const programId = parseInt(req.query.programId);
  if (programId) {
    const Courses = await CourseModel.findAll({
      offset: req.query.offset,
      limit: req.query.limit,
      include: {
        model: ProgramModel,
        attributes: {
          exclude: ['details', 'createdAt', 'updatedAt'],
          include: ['id', 'programName', 'programCode', ['type', 'programType'], 'isActive']
        },
        where: { id: programId }
        // required: true    // - For forcing it do an INNER JOIN
      },
      attributes: {
        exclude: ['programId']
      }
    });
    return successResp(res, Courses, 'fetched successfully');
  }

  const Courses = await CourseModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    include: {
      model: ProgramModel,
      attributes: {
        exclude: ['id', 'details', 'createdAt', 'updatedAt'],
        include: ['programName', 'programCode', ['type', 'programType'], 'isActive']
      }
      // required: true    // - For forcing it do an INNER JOIN
    }
  });
  successResp(res, Courses, 'fetched successfully');
});

const getCourse = asyncWrapper(async (req, res, next) => {
  if (req.params.courseId < 0) throw new AppError(400, `Invalid Topic ID`);

  const course = await CourseModel.findByPk(req.params.courseId, { include: ProgramModel });
  if (!course) throw new AppError(404, `Course with id ${req.params.courseId} does not exist`);

  successResp(res, course, 'fetched successfully');
});

const updateCourse = asyncWrapper(async (req, res, next) => {
  if (req.params.courseId < 0) throw new AppError(400, `Invalid Course ID`);
  // Validation on input fields
  console.log(req.body);
  const validatedCourse = validateCourse(req.body);
  // Find the course to be updated
  const course = await CourseModel.findByPk(validatedCourse.courseId);
  if (!course) throw new AppError(400, `Course with Id ${validatedCourse.courseId} does not exist`);

  // Update the course's properties with the new data
  await course.update(
    {
      courseName: validatedCourse.courseName,
      description: validatedCourse.description
    },
    { where: { id: course.id } }
  );

  successResp(res, course, 'Course updated successfully');
});

const deleteCourse = asyncWrapper(async (req, res, next) => {
  if (!req.params.courseId) throw new AppError(400, 'Missing required `courseId` param');
  const course = await CourseModel.findByPk(req.params.courseId);
  if (!course) throw new AppError(400, `Course with Id ${req.params.courseId} does not exist`);

  // check if any sessions linked to the course
  const sessionExists = await SessionModel.count({ where: { courseId: course.id } });
  if (sessionExists) throw new AppError(403, `Cannot delete Course as Sessions are linked to it.`);

  // const topicExists = await TopicModel.count({ where: { courseId: course.id } });
  // if (topicExists) throw new AppError(403, `Cannot delete Course as Topics are linked to it.`);

  try {
    await CourseModel.destroy({ where: { id: req.params.courseId } });
    await TopicModel.update({ courseId: null }, { where: { courseId: req.params.courseId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Course as it's already in use`);
    }
    throw err;
  }
  successResp(res, {}, 'Course deleted successfully');
});

module.exports = {
  addCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse
};
