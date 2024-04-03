const asyncWrapper = require('express-async-wrapper');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CampusModel = require('../db/models/CampusModel');
const UserModel = require('../db/models/UserModel');
const logger = require('../utils/logger');
const { validateCampus, validateSpace } = require('../utils/validations');

const addCampus = asyncWrapper(async (req, res, next) => {
  const createdByUser = req.headers['userrole'];

  if (createdByUser !== "SUPER_ADMIN") {
    throw new AppError(403, 'You are unauthorized to add a campus');
  }

  const reqBody = { ...req.body };
  const validateSpaceDetails = validateSpace(reqBody.spaceDetails);
  delete reqBody.spaceDetails;
  const validatedCampus = validateCampus(reqBody);

  if (Object.values(reqBody).find(el => typeof el !== 'string')) throw new AppError(400, 'All fields must be string');

  const { contactPerson, contactPersonEmail, contactPersonPhone, contactPersonAddress } = req.body;

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
  }

  const userExists = await UserModel.count({ where: [{ email: contactPersonEmail }, { phone1: contactPersonPhone }] }) > 0;

  const generateRandomUserID = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const userID = `UID-${randomNumber}`;
    return userID;
  };

  const U_S_ID = generateRandomUserID();

  const roleId = 2;

  if (!userExists) {
    const password = "Password@123";
    const insertUser = {
      name: contactPerson,
      email: contactPersonEmail,
      phone1: contactPersonPhone,
      phone2: null,
      password,
      localAddress: contactPersonAddress,
      permanentAddress: contactPersonAddress,
      U_S_ID,
      isActive: 'A',
      roleId
    }

    const user = await UserModel.create(insertUser);
    const details = { ...user.dataValues };
    logger.info(`New User Registered successfully`, details);
  }

  const result = await CampusModel.create(newCampus);
  successResp(res, result, 'Campus created successfully', 201);
});

const getCampus = asyncWrapper(async (req, res, next) => {
  if (!req.params.campusId) throw new AppError(400, 'Missing required `campusId` ');
  if (!req.params.campusId < 0) throw new AppError(400, 'Invalid required `campusId` ');

  const campus = await CampusModel.findByPk(req.params.campusId);
  if (!campus) throw new AppError(400, `Campus with id ${req.params.campusId} does not exist`);

  successResp(res, campus, 'fetched successfully');
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

const updateCampus = asyncWrapper(async (req, res, next) => {
  const createdByUser = req.headers['userrole'];

  if (createdByUser !== "SUPER_ADMIN") {
    throw new AppError(403, 'You are unauthorized to add a campus');
  }

  const reqBody = { ...req.body };
  const validateSpaceDetails = validateSpace(reqBody.spaceDetails);
  delete reqBody.spaceDetails;
  const validatedCampus = validateCampus(reqBody);

  const campus = await CampusModel.findByPk(req.params.campusId);

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
  const createdByUser = req.headers['userrole'];

  if (createdByUser !== "SUPER_ADMIN") {
    throw new AppError(403, 'You are unauthorized to add a campus');
  }

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
