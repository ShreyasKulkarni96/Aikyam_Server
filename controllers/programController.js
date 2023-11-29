const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const ProgramModel = require('../db/models/ProgramModel');
const CourseModel = require('../db/models/CourseModel');
const { validateProgram } = require('../utils/validations');
const { excludeWords } = require('../utils/validations');
const { Op } = require('sequelize');

const addProgram = asyncWrapper(async (req, res, next) => {
  const validData = validateProgram(req.body);
  const { programName } = validData;
  // INSERT INTO DB
  // PROGRAM_CODE = ****/CR/V1.0
  const programCode = `${validData.programName
    .split(' ')
    .map(item => (!excludeWords.includes(item) ? item.charAt(0) : ''))
    .join('')
    .toUpperCase()}/${validData.type === 'core' ? 'CR' : 'EL'}/V1.0`;

  const programPresent = await ProgramModel.findOne({ where: { [Op.or]: [{ programName }, { programCode }] } });
  if (programPresent) throw new AppError(400, `Program with the given Name or Code ${programCode} already exists`);

  const newProgram = await ProgramModel.create({ ...validData, programCode });
  successResp(res, newProgram, 'Program created successfully', 201);
});

const getAllPrograms = asyncWrapper(async (req, res, next) => {
  const programs = await ProgramModel.findAll({ offset: req.query.offset, limit: req.query.limit, attributes: req.query.fields });
  successResp(res, programs, 'fetched successfully');
});

const getProgram = asyncWrapper(async (req, res, next) => {
  const program = await ProgramModel.findByPk(req.params.programId);
  successResp(res, program, 'fetched successfully');
});

const updateProgram = asyncWrapper(async (req, res, next) => {
  const validData = validateProgram(req.body);
  const programId = req.params.programId;

  // Find the Program to be updated
  const program = await ProgramModel.findByPk(programId);
  if (!program) throw new AppError(400, `Program with Id ${programId} does not exist`);

  // Update the course's properties with the new data
  await program.update(validData, { where: { id: programId } });

  successResp(res, { ...program.dataValues, ...validData }, 'Program updated successfully');
});

const deleteProgram = asyncWrapper(async (req, res, next) => {
  if (!req.params.programId) throw new AppError(400, 'Missing required `programId` param');
  const program = await ProgramModel.findByPk(req.params.programId);
  if (!program) throw new AppError(400, `Program with Id ${req.params.programId} does not exist`);

  // check if any Courses linked to the Program
  const courseExists = await CourseModel.count({ where: { programId: program.id } });
  if (courseExists) throw new AppError(403, `Cannot delete Program as Courses are linked to it.`);

  try {
    await ProgramModel.destroy({ where: { id: req.params.programId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete program as it's already in use`);
    }
    throw err;
  }
  successResp(res, {}, 'Program deleted successfully');
});

module.exports = {
  addProgram,
  getAllPrograms,
  getProgram,
  updateProgram,
  deleteProgram
};
