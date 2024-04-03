const asyncWrapper = require('express-async-wrapper');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('config');
const UserModel = require('../db/models/UserModel');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { successResp } = require('./middlewares/successHandler');
const RoleModel = require('../db/models/RoleModel');

const JWT_SECRET_KEY = config.get('JWT_SECRET_KEY');
const JWT_VALIDITY = config.get('JWT_VALIDITY');

function signInToken(userId, userName, userRole) {
  const token = jwt.sign(
    {
      userId: userId,
      name: userName,
      role: userRole
    },
    JWT_SECRET_KEY,
    { expiresIn: JWT_VALIDITY }
  );
  return token;
}

const registerUser = asyncWrapper(async (req, res, next) => {
  const roles = ['SUPER_ADMIN', 'ADMIN', 'STUDENT', 'STAFF', 'FACULTY'];

  const createdByUserRole = req.headers['userrole'];

  if (!createdByUserRole || !roles.includes(createdByUserRole)) {
    throw new AppError(403, `Invalid or missing user role in headers`);
  }

  if (createdByUserRole !== 'ADMIN' && createdByUserRole !== 'SUPER_ADMIN') {
    throw new AppError(403, 'You are unauthorized to register a user');
  }

  if (createdByUserRole === 'ADMIN' && req.body.role === "SUPER_ADMIN") {
    throw new AppError(403, 'Creating a super admin is not allowed');
  }

  if (req.body.roleId === '1') {
    const superAdminExists = await UserModel.count({ where: { roleId: 1 } }) > 0;
    if (superAdminExists) {
      throw new AppError(400, 'A super admin already exists. Cannot create another super admin.');
    }
  }

  const NAME_REGEX = /^[A-Za-z.\s]{2,50}$/;
  const currentYear = new Date().getFullYear();

  let { name, DOB, gender, email, phone1, phone2 = null, localAddress, permanentAddress, roleId } = req.body;

  if (!req.body || _.isEmpty(req.body)) throw new AppError(400, 'Missing request body');
  if (Object.values(req.body).find(el => typeof el !== 'string')) throw new AppError(400, 'All fields must be string');
  if (!name || !DOB || !email || !phone1) throw new AppError(400, 'Missing required fields');
  if (!NAME_REGEX.test(name)) throw new AppError(400, 'Name can only be alphabetic with blank space and .');
  const YOB = new Date(DOB).getFullYear();
  if (!validator.isDate(DOB, 'DD-MM-YYYY')) throw new AppError(400, 'Invalid Date of birth passed');
  if (currentYear - YOB < 5 || currentYear - YOB > 80) throw new AppError(400, 'Allowed age is 5 to 80 years');
  if (!['M', 'F', 'O'].includes(gender)) throw new AppError(400, 'Invalid Gender passed');
  if (!validator.isEmail(email)) throw new AppError(400, 'Invalid Email');
  const mobile1 = phone1.split('-')[1];
  if (!validator.isMobilePhone(mobile1, ['en-IN'])) throw new AppError(400, 'Invalid Phone number');
  if (localAddress.length > 500) throw new AppError(400, 'Local address can be max 500 characters');
  if (permanentAddress.length > 500) throw new AppError(400, 'Permanent address can be max 500 characters');

  name = name.trim().replace(/\s\s+/g, ' ');
  permanentAddress = permanentAddress && permanentAddress !== 'SAME' ? permanentAddress : localAddress;
  phone1 = phone1.trim();
  if (phone2) {
    const mobile2 = phone2.split('-')[1];
    if (!validator.isMobilePhone(mobile2, ['en-IN'])) throw new AppError(400, 'Invalid Phone number 2');
    phone2 = phone2.trim();
  }

  const userPresent = await UserModel.findOne({ where: { [Op.or]: [{ email }, { phone1 }] } });
  if (userPresent) throw new AppError(400, 'User already registered, please login')

  const newPassword = "Password@123";

  const generateRandomUserID = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const userID = `UID-${randomNumber}`;
    return userID;
  };

  const U_S_ID = generateRandomUserID();

  let insertUser = {
    name,
    DOB,
    gender,
    email,
    phone1,
    phone2,
    password: newPassword,
    localAddress,
    permanentAddress,
    U_S_ID,
    isActive: 'A',
    roleId
  }

  const user = await UserModel.create(insertUser);
  const details = { ...user.dataValues };

  logger.info(`New User Registered successfully`, details);
  return successResp(res, details, 'Registered successfully', 201);
});

const loginUser = asyncWrapper(async (req, res, next) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) throw new AppError(400, 'Missing required fields');
  if (typeof emailOrPhone !== 'string' || typeof password !== 'string') throw new AppError(400, 'Fields must be string only');
  if (emailOrPhone.includes('@') && !validator.isEmail(emailOrPhone)) throw new AppError(400, 'Invalid Email');
  if (emailOrPhone.includes('+') && emailOrPhone.includes('-')) {
    const mobile = emailOrPhone.split('-')[1];
    if (!validator.isMobilePhone(mobile, ['en-IN'])) throw new AppError(400, 'Invalid Phone number');
  }
  const user = await UserModel.findOne({
    where: { [Op.or]: [{ email: emailOrPhone }, { phone1: emailOrPhone }] },
    include: { model: RoleModel }
  });
  if (!user) throw new AppError(401, 'Either username or password is invalid');
  const passMatched = bcrypt.compareSync(password, user.password);
  if (!passMatched) throw new AppError(401, 'Either username or password is invalid');
  if (user.isActive !== 'A') throw new AppError(403, 'Temporarily account is Inactive! please contact admin');
  const token = signInToken(user.id, user.name, user.role.name);
  const userDetails = { userId: user.id, name: user.name, email: user.email, role: user.role.name };
  logger.info(` ${user.name}  logged in successfully`);
  successResp(res, { ...userDetails, token }, 'Logged in successfully');
});

const getUserProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.userId;
  const user = await UserModel.findByPk(userId);
  if (!user) throw new AppError(401, 'Account does not exist anymore');
  if (user.isActive !== 'A') throw new AppError(401, 'Account blocked temporarily');
  const userDetails = {
    userId: user.id,
    name: user.name,
    dob: user.DOB,
    gender: user.gender,
    email: user.email,
    mobile: user.phone1,
    localAddress: user.localAddress,
    permanentAddress: user.permanentAddress,
    role: req.userRole
  };
  successResp(res, userDetails, 'fetched successfully');
});

const getRefreshToken = asyncWrapper(async (req, res, next) => {
  const userId = req.userId;
  const userName = req.userName;
  const token = signInToken(userId, userName);
  const userDetails = { userId: userId, name: userName, token: token };
  logger.info('Token refreshed for user', userDetails);
  res.status(200).json({ status: 'success', code: 200, message: 'token refreshed', data: userDetails });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getRefreshToken
}
