const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const AcademicYearModel = require('../db/models/AcademicYearModel');
const BatchModel = require('../db/models/BatchModel');

const addAcademicYear = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a AcademicYear');

  // VALIDATION
  const aySchema = Joi.object({
    name: Joi.string().min(2).max(20).optional(),
    description: Joi.string().max(200).optional()
  });

  const { error: validationErr } = aySchema.validate(req.body);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  // INSERT INTO DB
  const currentYear = new Date().getFullYear();
  req.body.name = req.body.name || `AY${currentYear}-${currentYear + 1}`; // later auto-generate using preference logic

  const existingYear = await AcademicYearModel.findOne({ order: [['id', 'DESC']] });
  if (existingYear) {
    const latestYear = existingYear.name.split('-')[1] * 1;
    req.body.name = `AY${latestYear}-${latestYear + 1}`; // later auto-generate using preference logic
  }

  const newAcademicYear = await AcademicYearModel.create({ ...req.body });

  successResp(res, newAcademicYear, 'AcademicYear created successfully', 201);
});

const getAllAcademicYears = asyncWrapper(async (req, res, next) => {
  const academicYears = await AcademicYearModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    attributes: req.query.fields,
    where: { isActive: 'A' }
  });
  successResp(res, academicYears, 'fetched successfully');
});

const getAcademicYear = asyncWrapper(async (req, res, next) => {
  const academicYear = await AcademicYearModel.findByPk(req.params.yearId);
  successResp(res, academicYear, 'fetched successfully');
});

const updateAcademicYear = asyncWrapper(async (req, res, next) => {
  // VALIDATION
  const aySchema = Joi.object({
    description: Joi.string().max(200).required()
  });

  const { error: validationErr } = aySchema.validate(req.body);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  const academicYear = await AcademicYearModel.findOne({
    where: { id: req.params.yearId },
    attributes: ['id', 'name', 'description']
  });
  if (!academicYear) throw new AppError(`Academic Year with the id: ${req.params.yearId} not found`);
  academicYear.description = req.body.description;
  await academicYear.save();

  successResp(res, academicYear, 'Academic Year Updated successfully');
});

const deleteAcademicYear = asyncWrapper(async (req, res, next) => {
  if (!req.params.yearId) throw new AppError(400, 'Missing required `yearId` param');
  const ay = await AcademicYearModel.findByPk(req.params.yearId);
  if (!ay) throw new AppError(400, `Academic Year with Id ${req.params.yearId} does not exist`);

  // check if any batches linked to the academic year
  const batchExists = await BatchModel.count({ where: { academicYearId: req.params.yearId } });
  if (batchExists) throw new AppError(403, `Cannot delete Year as batches are linked to it.`);

  try {
    await AcademicYearModel.destroy({ where: { id: req.params.yearId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Year as it's already in use`);
    }
    throw err;
  }
  successResp(res, {}, 'Academic Year deleted');
});

module.exports = {
  addAcademicYear,
  getAllAcademicYears,
  getAcademicYear,
  updateAcademicYear,
  deleteAcademicYear
};
