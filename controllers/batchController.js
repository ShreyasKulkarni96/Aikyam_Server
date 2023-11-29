const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const BatchModel = require('../db/models/BatchModel');
const AcademicYear = require('../db/models/AcademicYearModel');
const Program = require('../db/models/ProgramModel');
const { validateBatch, validateBatchDates } = require('../utils/validations');

const addBatch = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a Batch');

  // VALIDATION
  if (req.params.batchId < 0) throw new AppError(400, `Invalid Batch Id`);
  const reqBodyCopy = { ...req.body };
  const validatedBatchDetails = validateBatch(reqBodyCopy);

  // 1.) Check if AY exists with the given ayId
  const ayExists = await AcademicYear.findByPk(validatedBatchDetails.academicYearId);
  if (!ayExists) throw new AppError(400, `Academic Year with Id: ${validatedBatchDetails.academicYearId} does not exist`);

  // 2.) Check if Program exists with the given programId
  const program = await Program.findByPk(validatedBatchDetails.programId);
  if (!program) throw new AppError(400, `Program with Id: ${validatedBatchDetails.academicYearId} does not exist`);

  validateBatchDates(ayExists.name, validatedBatchDetails.startDate, validatedBatchDetails.endDate);

  // INSERT INTO DB
  const batchCode = `BAT-${Date.now()}`; // later auto-generate using preference logic
  try {
    var newBatch = await BatchModel.create({ ...req.body, batchCode, academicYear: ayExists.name });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') throw new AppError(400, `Batch Code must be unique`);
    throw err;
  }

  successResp(res, newBatch, 'Batch created successfully', 201);
});

const getAllBatches = asyncWrapper(async (req, res, next) => {
  const batches = await BatchModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    attributes: req.query.fields,
    where: { isActive: 'A' }
  });
  successResp(res, batches, 'fetched successfully');
});

const getBatch = asyncWrapper(async (req, res, next) => {
  if (req.params.batchId < 0) throw new AppError(400, `Invalid Batch Id`);

  const batch = await BatchModel.findByPk(req.params.batchId);
  if (!batch) throw new AppError(400, `Batch with Id: ${req.params.batchId} does not exist`);

  successResp(res, batch, 'fetched successfully');
});

const updateBatch = asyncWrapper(async (req, res, next) => {
  if (req.params.batchId < 0) throw new AppError(400, `Invalid Batch Id`);
  const reqBodyCopy = { ...req.body };
  const validatedBatchDetails = validateBatch(reqBodyCopy);

  // 1.) Check if AY exists with the given ayId
  const ayExists = await AcademicYear.findByPk(validatedBatchDetails.academicYearId);
  if (!ayExists) throw new AppError(400, `Academic Year with Id: ${validatedBatchDetails.academicYearId} does not exist`);

  // 2.) Check if Program exists with the given programId
  const program = await Program.findByPk(validatedBatchDetails.programId);
  if (!program) throw new AppError(400, `Program with Id: ${validatedBatchDetails.academicYearId} does not exist`);

  //3. Get Batch
  const batch = await BatchModel.findByPk(req.params.batchId);
  if (!batch) throw new AppError(400, `Batch with Id: ${req.params.batchId} does not exist`);

  validateBatchDates(ayExists.name, validatedBatchDetails.startDate, validatedBatchDetails.endDate);

  //Update the batch
  await batch.update(
    {
      academicYear: ayExists.name,
      academicYearId: validatedBatchDetails.academicYearId,
      description: validatedBatchDetails.details,
      programId: validatedBatchDetails.programId,
      startDate: validatedBatchDetails.startDate,
      endDate: validatedBatchDetails.endDate,
      capacity: validatedBatchDetails.capacity,
      updatedAt: new Date().toString()
    },
    { where: { id: req.params.batchId } }
  );
  successResp(res, batch, 'Batch updated successfully');
});

const deleteBatch = asyncWrapper(async (req, res, next) => {
  if (!req.params.batchId) throw new AppError(400, 'Missing required `batchId` param');
  const batch = await BatchModel.findByPk(req.params.batchId);
  if (!batch) throw new AppError(400, `Batch with Id ${req.params.batchId} does not exist`);

  // check if any programs are linked to the batch
  if (batch.programId || batch.academicYearId) throw new AppError(403, `Cannot delete Batch as programs are linked to it.`);

  try {
    await BatchModel.destroy({ where: { id: req.params.batchId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete batch as it's already in use`);
    }
    throw err;
  }

  successResp(res, {}, 'batch deleted successfully');
});

module.exports = {
  addBatch,
  getAllBatches,
  getBatch,
  updateBatch,
  deleteBatch
};
