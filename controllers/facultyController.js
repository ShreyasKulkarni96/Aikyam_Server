const asyncWrapper = require('express-async-wrapper');
const config = require('config');
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const DB = require('../db/connection');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const FacultyModel = require('../db/models/FacultyModel');
const UserModel = require('../db/models/UserModel');
const {
  validateUser,
  validateFacultyAccountDetails,
  validateFacultyDates,
  validateFacultyCareerDetails,
  validateFacultyAcademicDetails
} = require('../utils/validations');

/**
 * ADD FACULTY FLOW:
 * 1. Admin Adds the details of faculty
 * 2. with the userDetails provided create a new User
 *  2a.) check if userExists with same email or mobile number, then throw Error
 * 3. Insert User into a DB with a DEFAULT_PASSWORD and send the user his password via Email
 * 4. Later when the Faculty comes to login first, check if he has DEFAULT_PASSWORD
 * 5. Then force him to RESET the password with an OTP validation (either via Email or Phone)
 */

const addFaculty = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a Faculty');

  // Role Check: RoleId is intended to be passed by an admin user
  // const roles = [1, 2, 3, 4];
  // const roleId = req.query.roleId * 1 || 2;
  // if (!roles.includes(roleId)) throw new AppError(403, `Allowed roles are ${roles}`);

  // VALIDATION
  // add validations to these Later: academic details, account details, career details
  let { academicDetails, accountDetails, careerDetails } = req.body;
  const reqBodyCopy = { ...req.body };

  validateFacultyAcademicDetails(reqBodyCopy.academicDetails);
  validateFacultyAccountDetails(reqBodyCopy.accountDetails);
  // validateFacultyCareerDetails(reqBodyCopy.careerDetails);
  validateFacultyDates(reqBodyCopy.DOB, academicDetails.startDate, academicDetails.endDate);

  delete reqBodyCopy.academicDetails;
  delete reqBodyCopy.accountDetails;
  delete reqBodyCopy.careerDetails;
  reqBodyCopy.password = config.get('DEFAULT_USER_PASS');

  const { name, DOB, gender, email, phone1, phone2 = null, password, localAddress, permanentAddress } = validateUser(reqBodyCopy);

  // 1.) Check User Exists with Mobile Number or Email
  const userPresent = await UserModel.findOne({ where: { [Op.or]: [{ email }, { phone1 }] } });
  if (userPresent) throw new AppError(400, 'User with the given phone or email already exists');

  const employeeId = `EMP-${parseInt(Date.now() / 100)}`;
  const insertUser = {
    name,
    DOB,
    gender,
    email,
    phone1,
    phone2,
    password,
    localAddress,
    permanentAddress,
    U_S_ID: employeeId, // later add logic to auto-generate
    isActive: 'A',
    roleId: 4 // For Faculty
  };

  if (!_.isEmpty(careerDetails)) {
    careerDetails = careerDetails.map((experience, ind) => ({ expId: ind + 1, ...experience }));
  }
  const txn = await DB.transaction();
  try {
    const user = await UserModel.create(insertUser, { transaction: txn });
    const userDetails = { ...user.dataValues };

    const faculty = await FacultyModel.create(
      {
        employeeId,
        facultyType: accountDetails.facultyType,
        availability: accountDetails.facultyAvailability,
        remunerationPlan: accountDetails.paymentPlan,
        academicDetails,
        accountDetails,
        careerDetails,
        userId: userDetails.id
      },
      { transaction: txn }
    );

    const facultyDetails = { ...faculty.dataValues };

    await txn.commit();

    // Security Points:
    // 1. stop traveling of password back to frontend
    delete userDetails.password;
    // 2. encrypt the accountDetails or any other sensitive information
    successResp(res, { userDetails, facultyDetails }, 'Faculty added successfully', 201);
  } catch (err) {
    await txn.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') throw new AppError(400, `Faculty with given Employee_ID already exists`);
    throw err;
  }
});

const getAllFaculties = asyncWrapper(async (req, res, next) => {
  const faculties = await FacultyModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    include: {
      model: UserModel,
      attributes: {
        exclude: ['id', 'password', 'name', 'createdAt', 'updatedAt', 'roleId', 'isActive', 'U_S_ID'],
        include: [
          ['name', 'facultyName'],
          ['createdAt', 'joinedOn'],
          ['id', 'facultyId'],
          'DOB',
          'gender',
          'email',
          'phone1',
          'localAddress',
          'permanentAddress'
        ]
      },
      where: { isActive: 'A' }
    },
    attributes: {
      include: [
        'employeeId',
        'facultyType',
        'availability',
        'remunerationPlan',
        'academicDetails',
        'accountDetails',
        'careerDetails'
      ],
      exclude: ['id', 'createdAt', 'updatedAt', 'userId']
    }
  });

  const data = JSON.parse(JSON.stringify(faculties)).map(el => {
    let returnObj = { ...el };
    const user = returnObj.user;
    returnObj = { ...user, ...returnObj };
    delete returnObj.user;
    return returnObj;
  });

  successResp(res, data, 'fetched successfully');
});

const getFacultyDetails = asyncWrapper(async (req, res, next) => {
  const faculty = await FacultyModel.findOne({
    where: { userId: req.params.facultyId },
    include: {
      model: UserModel,
      attributes: {
        exclude: ['id', 'password', 'name', 'createdAt', 'updatedAt', 'roleId', 'isActive', 'U_S_ID'],
        include: [
          ['name', 'facultyName'],
          ['createdAt', 'joinedOn'],
          ['id', 'facultyId'],
          'DOB',
          'gender',
          'email',
          'phone1',
          'localAddress',
          'permanentAddress'
        ]
      }
    },
    attributes: {
      include: [
        'employeeId',
        'facultyType',
        'availability',
        'remunerationPlan',
        'academicDetails',
        'accountDetails',
        'careerDetails'
      ],
      exclude: ['id', 'createdAt', 'updatedAt', 'userId']
    }
  });

  const data = JSON.parse(JSON.stringify(faculty));
  let facultyDetails = { ...data.user, ...data };
  delete facultyDetails.user;

  successResp(res, facultyDetails, 'fetched successfully');
});

const getFacultyExperience = asyncWrapper(async (req, res, next) => {
  const faculty = await FacultyModel.findOne({
    where: { userId: req.params.facultyId },
    include: {
      model: UserModel,
      attributes: {
        exclude: [
          'id',
          'password',
          'name',
          'createdAt',
          'updatedAt',
          'roleId',
          'isActive',
          'U_S_ID',
          'localAddress',
          'permanentAddress',
          'DOB',
          'email',
          'phone1',
          'phone2'
        ],
        include: [['name', 'facultyName'], ['createdAt', 'joinedOn'], ['id', 'facultyId'], 'gender']
      }
    },
    attributes: {
      include: ['employeeId', 'careerDetails'],
      exclude: [
        'id',
        'createdAt',
        'updatedAt',
        'userId',
        'accountDetails',
        'academicDetails',
        'facultyType',
        'availability',
        'remunerationPlan'
      ]
    }
  });

  const data = JSON.parse(JSON.stringify(faculty));
  let facultyDetails = { ...data.user, ...data };
  delete facultyDetails.user;

  successResp(res, facultyDetails, 'fetched successfully');
});

const addFacultyExp = asyncWrapper(async (req, res, next) => {
  console.log(req.params.facultyId);
  const experienceList = req.body;
  // 2.) Validations
  // 2.1) Check if body is Array
  if (!Array.isArray(experienceList)) throw new AppError(400, 'Request body must be an array');
  let notObj = false;
  for (const exp of experienceList) {
    if (typeof exp !== 'object') notObj = true;
    break;
  }
  // 2.2) Check if body is an Array of objects
  if (notObj) throw new AppError(400, 'Each exp item must be an object');

  validateFacultyCareerDetails(experienceList);
  // 3.) Check if the faculty exists, if not throw error
  const faculty = await FacultyModel.findOne({ where: { userId: parseInt(req.params.facultyId) } });
  if (!faculty) throw new AppError(400, `Faculty with id: ${req.params.facultyId} was not found`);

  // 3.) populate faculty previous Experiences
  const { careerDetails } = faculty;

  // 4.) Add new experience
  const newExpList = experienceList.map((exp, ind) => ({ expId: careerDetails.length + ind + 1, ...exp }));
  careerDetails.push(...newExpList);
  // faculty.updatedAt = new Date().toString();

  // 5.) Save into the database
  await FacultyModel.update({ careerDetails, updatedAt: new Date().toString() }, { where: { id: faculty.id } });
  // await faculty.save();

  // 6.) Send Response
  successResp(res, faculty, 'Experience added successfully');
});

const updateFaculty = asyncWrapper(async (req, res, next) => {
  const reqBodyCopy = { ...req.body };
  console.log(reqBodyCopy);
  // Find the faculty to be updated
  const faculty = await FacultyModel.findOne({ where: { userId: req.params.facultyId } });
  if (!faculty) throw new AppError(400, `faculty with Id ${req.params.facultyId} does not exist`);

  // Find the user to be updated
  const user = await UserModel.findOne({ where: { id: req.params.facultyId } });
  if (!user) throw new AppError(400, `user with Id ${req.params.facultyId} does not exist`);

  const tempUser = {
    name: reqBodyCopy.name,
    DOB: reqBodyCopy.DOB,
    gender: reqBodyCopy.gender,
    email: reqBodyCopy.email,
    phone1: reqBodyCopy.phone1,
    phone2: reqBodyCopy.phone2,
    password: 'Abc@123', //dummy place holder value just for validation purpose in the validateUser function because the userDetails in the req body is not containing the password field
    localAddress: reqBodyCopy.localAddress,
    permanentAddress: reqBodyCopy.permanentAddress
  };
  const updatedUser = validateUser(tempUser);
  const updatedAccountDetails = validateFacultyAccountDetails(reqBodyCopy.accountDetails);
  const updatedAcademicDetails = validateFacultyAcademicDetails(reqBodyCopy.academicDetails);
  // const updatedCareerDetails = validateFacultyCareerDetails(reqBodyCopy.careerDetails);
  validateFacultyDates(updatedUser.DOB, updatedAcademicDetails.startDate, updatedAcademicDetails.endDate);

  await user.update(
    {
      name: updatedUser.name,
      DOB: updatedUser.DOB,
      gender: updatedUser.gender,
      email: updatedUser.email,
      phone1: updatedUser.phone1,
      phone2: updatedUser.phone2,
      localAddress: updatedUser.localAddress,
      permanentAddress: updatedUser.permanentAddress,
      updatedAt: new Date().toString()
    },
    { where: { id: faculty.userId } }
  );

  await faculty.update(
    {
      facultyType: updatedAccountDetails.facultyType,
      availability: updatedAccountDetails.availability,
      remunerationPlan: updatedAccountDetails.remunerationPlan,
      academicDetails: updatedAcademicDetails,
      accountDetails: updatedAccountDetails,
      // careerDetails: updatedCareerDetails,
      updatedAt: new Date().toString()
    },
    { where: { userId: faculty.userId } }
  );

  successResp(res, faculty, 'faculty updated successfully');
});

const updateFacultyExp = asyncWrapper(async (req, res, next) => {
  const expID = parseInt(req.params.expId);

  if (isNaN(expID) || expID < 1) {
    throw new AppError(400, 'Invalid expId');
  }

  const faculty = await FacultyModel.findOne({ where: { userId: req.params.facultyId } });
  if (!faculty) throw new AppError(400, `faculty with Id ${req.params.facultyId} does not exist`);

  const details = { ...req.body };
  const validatedFacultyExp = validateFacultyCareerDetails(details);
  const updatedFacultyExp = validatedFacultyExp[0];
  const updatedExpObject = {
    ...updatedFacultyExp,
    expId: expID
  };
  const expIndex = expID - 1;

  if (expIndex >= 0 && expIndex < faculty.careerDetails.length) {
    const updatedCareerDetails = [...faculty.careerDetails];
    updatedCareerDetails[expIndex] = updatedExpObject;

    console.log('updatedCareerDetails');
    console.log(updatedCareerDetails);

    await faculty.update(
      { careerDetails: updatedCareerDetails, updatedAt: new Date().toString() },
      { where: { userId: req.params.facultyId } }
    );

    successResp(res, faculty.careerDetails, 'Faculty updated successfully');
  } else {
    throw new AppError(400, 'Invalid experience ID');
  }
});

const deleteFaculty = asyncWrapper(async (req, res, next) => {
  if (!req.params.facultyId) throw new AppError(400, 'Missing required `facultyId` param');
  const faculty = await FacultyModel.findOne({ userId: req.params.facultyId });
  if (!faculty) throw new AppError(400, `Faculty with Id ${req.params.facultyId} does not exist`);

  try {
    await FacultyModel.destroy({ where: { id: faculty.id } });
    await UserModel.destroy({ where: { id: faculty.userId } });
    successResp(res, {}, 'Faculty deleted successfully');
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Faculty as it's already in use`);
    }
    throw err;
  }
});

const deleteFacultyExp = asyncWrapper(async (req, res, next) => {
  //ExpId index is in the request body
  const expID = parseInt(req.params.expId);

  if (isNaN(expID) || expID < 1) {
    throw new AppError(400, 'Invalid expId');
  }
  const faculty = await FacultyModel.findOne({ where: { userId: req.params.facultyId } });
  if (!faculty) throw new AppError(400, `Faculty with Id ${req.params.facultyId} does not exist`);

  const expArr = [...faculty.careerDetails];
  const expIdToDelete = expID;
  const indexToDelete = expArr.findIndex(item => item.expId === expIdToDelete);

  if (indexToDelete !== -1) {
    expArr.splice(indexToDelete, 1);
  } else {
    throw new AppError(400, `Invalid Experience Index`);
  }

  await faculty.update({ careerDetails: expArr, updatedAt: new Date().toString() }, { where: { userId: req.params.facultyId } });

  successResp(res, expArr, 'faculty Experience deleted successfully');
});

module.exports = {
  addFaculty,
  getAllFaculties,
  getFacultyDetails,
  updateFaculty,
  deleteFaculty,
  getFacultyExperience,
  updateFacultyExp,
  deleteFacultyExp,
  addFacultyExp
};
