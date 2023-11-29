const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CampusModel = require('../db/models/CampusModel');
const { validateCampus, validateSpace } = require('../utils/validations');

const addCampus = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a Campus');
  const reqBody = { ...req.body };
  const validateSpaceDetails = validateSpace(reqBody.spaceDetails);
  delete reqBody.spaceDetails;
  const validatedCampus = validateCampus(reqBody);

  // VALIDATIONS
  if (Object.values(reqBody).find(el => typeof el !== 'string')) throw new AppError(400, 'All fields must be string');

  // Insert into DB
  const newCampus = {
    facilityName: validatedCampus.facilityName,
    city: validatedCampus.city,
    state: validatedCampus.state,
    facilityAddress: validatedCampus.facilityAddress,
    contactPerson: validatedCampus.contactPerson,
    contactPersonAddress: validatedCampus.contactPersonAddress,
    contactPersonPhone: validatedCampus.contactPersonPhone,
    contactPersonEmail: validatedCampus.contactPersonEmail,
    spaceDetails: validateSpaceDetails
  };

  const result = await CampusModel.create(newCampus);
  successResp(res, result, 'Campus created successfully', 201);
});

const getAllCampuses = asyncWrapper(async (req, res, next) => {
  const campuses = await CampusModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    attributes: req.query.fields,
    where: { isActive: 'A' },
    order: [['createdAt', 'DESC']]
  });
  successResp(res, campuses, 'fetched successfully');
});

const getCampus = asyncWrapper(async (req, res, next) => {
  if (!req.params.campusId) throw new AppError(400, 'Missing required `campusId` ');
  if (!req.params.campusId < 0) throw new AppError(400, 'Invalid required `campusId` ');

  const campus = await CampusModel.findByPk(req.params.campusId);
  if (!campus) throw new AppError(400, `Campus with id ${req.params.campusId} does not exist`);

  successResp(res, campus, 'fetched successfully');
});

const updateCampus = asyncWrapper(async (req, res, next) => {
  // VALIDATIONS
  const reqBody = { ...req.body };
  const validateSpaceDetails = validateSpace(reqBody.spaceDetails);
  delete reqBody.spaceDetails;
  const validatedCampus = validateCampus(reqBody);

  // Find the Campus to be updated
  const campus = await CampusModel.findByPk(req.params.campusId);

  if (!campus) throw new AppError(400, `campus with Id ${req.params.campusId} does not exist`);

  // Update the course's properties with the new data
  await campus.update(
    {
      facilityName: validatedCampus.facilityName,
      city: validatedCampus.city,
      state: validatedCampus.state,
      facilityAddress: validatedCampus.facilityAddress,
      contactPerson: validatedCampus.contactPerson,
      contactPersonAddress: validatedCampus.contactPersonAddress,
      contactPersonPhone: validatedCampus.contactPersonPhone,
      contactPersonEmail: validatedCampus.contactPersonEmail,
      spaceDetails: validateSpaceDetails,
      updatedAt: new Date().toString()
    },
    { where: { id: req.params.campusId } }
  );

  successResp(res, campus, 'campus updated successfully');
});

const deleteCampus = asyncWrapper(async (req, res, next) => {
  if (!req.params.campusId) throw new AppError(400, 'Missing required `campusId` param');
  const campus = await CampusModel.findByPk(req.params.campusId);
  if (!campus) throw new AppError(400, `Campus with id ${req.params.campusId} does not exist`);

  try {
    await CampusModel.destroy({ where: { id: req.params.campusId } });
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Campus as it's already in use`);
    }
    throw err;
  }
  successResp(res, {}, 'Campus deleted');
});

module.exports = {
  addCampus,
  getAllCampuses,
  getCampus,
  updateCampus,
  deleteCampus
};
