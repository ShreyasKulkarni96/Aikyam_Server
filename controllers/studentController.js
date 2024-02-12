const asyncWrapper = require('express-async-wrapper');
const config = require('config');
const Joi = require('joi');
const _ = require('lodash');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const DB = require('../db/connection');
const StudentModel = require('../db/models/StudentModel');
const UserModel = require('../db/models/UserModel');
const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const dateFns = require('date-fns');
const { uploadPath } = require('./middlewares/bulkUploads');
const fs = require('fs');

const {
  validateUser,
  validateGuardian,
  validateStudentDates,
  validateStudentAcademicDetails,
  validateStudentAccountDetails
} = require('../utils/validations');
const BatchStudentRelation = require('../db/models/BatchStudentRelation');

/**
 * ADD STUDENT FLOW:
 * 1. Admin Adds the details of student
 * 2. with the userDetails provided create a new User
 *  2a.) check if userExists with same email or mobile number, then throw Error
 * 3. Insert User into a DB with a DEFAULT_PASSWORD and send the user his password via Email
 * 4. Later when the Student comes to login first, check if he has DEFAULT_PASSWORD
 * 5. Then force him to RESET the password with an OTP validation (either via Email or Phone)
 */

const addStudentDetails = asyncWrapper(async (req, res, next) => {
  // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add a Course');
  console.log(req.body)
 // return res.send(req.body)
  // VALIDATIONS
  if (_.isEmpty(req.body)) throw new AppError(400, 'Request body is Empty');
  const essentialKeys = ['userDetails', 'guardianDetails', 'academicDetails', 'accountDetails'];
  const reqBodyKeys = Object.keys(req.body);
  console.log("esentials keys-->", reqBodyKeys)
  if (!essentialKeys.every(key => reqBodyKeys.includes(key))) throw new AppError(400, 'Missing required fields');

  req.body.userDetails.password = config.get('DEFAULT_USER_PASS');
  const {
    name,
    DOB,
    gender,
    email,
    phone1,
    phone2 = null,
    password,
    localAddress,
    permanentAddress
  } = validateUser(req.body.userDetails);

  const guardianDetails = validateGuardian(req.body.guardianDetails);
  const academicDetails = validateStudentAcademicDetails(req.body.academicDetails);
  const accountDetails = validateStudentAccountDetails(req.body.accountDetails);
  validateStudentDates(DOB, academicDetails.dateOfAdmission);

  // 1.) Check User Exists with Mobile Number or Email
  const userPresent = await UserModel.findOne({ where: { [Op.or]: [{ email }, { phone1 }] }, attributes: ['id'] });
  if (userPresent) throw new AppError(400, 'User with the given phone or email already exists');

  const U_S_ID = `ST-${parseInt(Date.now() / 100)}`; // later add logic to auto-generate
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
    U_S_ID,
    isActive: 'A',
    roleId: 2 // For Student
  };

let batchId=academicDetails.batchId;
let balanceAmount=accountDetails.balanceAmount


  const txn = await DB.transaction();
  try {
    // Insert into DB
    const user = await UserModel.create(insertUser, { transaction: txn });
    const userDetails = { ...user.dataValues };

    const student = await StudentModel.create(
      {
        U_S_ID,
        guardianDetails,
        academicDetails,
        accountDetails, // updated account details,
        balanceAmount:balanceAmount,
        userId: userDetails.id
      },
      { transaction: txn }
    );

    const studentDetails = { ...student.dataValues };
    // console.log("Student details id-->",studentDetails.id)

    await BatchStudentRelation.create({batchId:batchId,studentId:studentDetails.id},{ transaction: txn })

    await txn.commit();

    // Security Points:
    // 1. stop traveling of password back to frontend
    delete userDetails.password;
    // 2. encrypt the accountDetails or any other sensitive information
    successResp(res, { userDetails, studentDetails }, 'Student added successfully', 201);
  } catch (err) {
    await txn.rollback();
    if (err.name === 'SequelizeUniqueConstraintError')
      throw new AppError(400, `Student Details with U_S_ID: ${req.body.U_S_ID} already exists`);

    throw err;
  }
});

const addBulkStudentDetails = asyncWrapper(async (req, res) => {
  let filePath = path.join(uploadPath, req.file.filename);

  try {
    if (req.file == undefined) {
      return res.status(400).send('Please upload an excel file!');
    }

    console.log('filePath');
    console.log(filePath);
    const rows = await readXlsxFile(filePath);
    rows.shift();
    rows.shift();
    let users = [];
    let students = [];
    rows.forEach(rows => {
      const student = {
        name: rows[0],
        DOB: dateFns.format(new Date(rows[1]), 'yyyy-MM-dd').toString(),
        gender: rows[2],
        email: rows[3],
        phone1: rows[4],
        phone2: rows[5],
        localAddress: rows[6],
        permanentAddress: rows[7],
        password: config.get('DEFAULT_USER_PASS'),
        guardianDetails: {
          name: rows[8],
          relation: rows[9],
          gender: rows[10],
          address: rows[11],
          email: rows[12],
          phone: rows[13]
        },
        academicDetails: {
          batchId: rows[14],
          batchCode: rows[15],
          dateOfAdmission: dateFns.format(new Date(rows[16]), 'yyyy-MM-dd').toString()
        },
        accountDetails: {
          paymentPlan: rows[17],
          totalFees: rows[18],
          discount: rows[19],
          paidFees: rows[20],
          pdcDetails: rows[21]
        }
      };
      const studentUser = {
        name: student.name,
        DOB: student.DOB.toString(),
        gender: student.gender,
        email: student.email,
        phone1: student.phone1,
        phone2: student.phone2,
        localAddress: student.localAddress,
        permanentAddress: student.permanentAddress,
        password: student.password
      };

      validateUser(studentUser);
      validateGuardian(student.guardianDetails);
      validateStudentAcademicDetails(student.academicDetails);
      validateStudentAccountDetails(student.accountDetails);

      users.push(studentUser);
      students.push(student);
    });
    const generateU_S_ID = () => `ST-${parseInt(Date.now() / 100) * Math.floor(Math.random() * 100 + 1)}`;
    const updatedStudentsUserArray = students.map(student => ({
      ...student,
      U_S_ID: generateU_S_ID(),
      isActive: 'A',
      roleId: 2
    }));

    const extractedStudentData = updatedStudentsUserArray.map(student => ({
      U_S_ID: student.U_S_ID,
      guardianDetails: student.guardianDetails,
      academicDetails: student.academicDetails,
      accountDetails: student.accountDetails
    }));

    const createdUsers = await UserModel.bulkCreate(updatedStudentsUserArray);
    const studentRecords = extractedStudentData.map((student, index) => ({
      ...student,
      userId: createdUsers[index].id // Use the generated userId
    }));

    await StudentModel.bulkCreate(studentRecords)
      .then(() => {
        successResp(res, req.file.filename, 'Students fetched successfully');
        fs.unlink(filePath, err => {
          if (err) throw new AppError(400, 'Error while deleting the file');
        });
      })
      .catch(error => {
        fs.unlink(filePath, err => {
          if (err) throw new AppError(400, 'Error while deleting the file');
        });
        throw new AppError(400, error.toString().replaceAll('"', '`'));
      });
    // const createdStudents = await StudentModel.bulkCreate(studentRecords);
    // if (!createdStudents) throw new AppError(400, 'Students Imported Successfully');
    // fs.unlink(filePath, err => {
    //   if (err) throw new AppError(400, 'Error while deleting the file');
    // });
  } catch (error) {
    // console.log(error);
    fs.unlink(filePath, err => {
      if (err) throw new AppError(400, 'Error while deleting the file');
    });
    if (error.name === 'SequelizeUniqueConstraintError') throw new AppError(400, 'Student with data already exists');
    throw new AppError(400, error.toString().replaceAll('"', '`'));
  }
});

const getAllStudents = asyncWrapper(async (req, res, next) => {
  const students = await StudentModel.findAll({
    offset: req.query.offset,
    limit: req.query.limit,
    include: {
      model: UserModel,
      attributes: {
        exclude: ['id', 'password', 'name', 'createdAt', 'updatedAt', 'roleId', 'isActive', 'U_S_ID'],
        include: [
          ['name', 'studentName'],
          ['createdAt', 'enrolledAt'],
          ['id', 'studentId'],
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
    attributes: { include: ['U_S_ID', 'guardianDetails'], exclude: ['id', 'createdAt', 'updatedAt', 'userId'] }
  });

  const data = JSON.parse(JSON.stringify(students)).map(el => {
    let returnObj = { ...el };
    const user = returnObj.user;
    returnObj = { ...returnObj, ...user };
    delete returnObj.user;
    return returnObj;
  });

  successResp(res, data, 'fetched successfully');
});

const getStudentDetails = asyncWrapper(async (req, res, next) => {
  const student = await UserModel.findByPk(req.params.studentId * 1, {
    include: {
      model: StudentModel,
      required: true,
      attributes: ['guardianDetails', 'accountDetails', 'academicDetails']
    },
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt', 'roleId'],
      include: [['createdAt', 'enrolledAt']]
    }
  });

  const data = JSON.parse(JSON.stringify(student));
  // console.log(data);
  // delete data.student_master;
  // data.guardianDetails = student.student_master.guardianDetails;

  successResp(res, data, 'fetched successfully');
});

const updateStudentDetails = asyncWrapper(async (req, res, next) => {
  // Find the student to be updated
  const student = await StudentModel.findOne({ where: { userId: req.params.studentId } });
  if (!student) throw new AppError(400, `student with Id ${req.params.studentId} does not exist`);

  const user = await UserModel.findOne({ where: { id: req.params.studentId } });
  if (!user) throw new AppError(400, `user with Id ${req.params.studentId} does not exist`);

  const tempUser = {
    name: req.body.userDetails.name,
    DOB: req.body.userDetails.DOB,
    gender: req.body.userDetails.gender,
    email: req.body.userDetails.email,
    phone1: req.body.userDetails.phone1,
    phone2: req.body.userDetails.phone2,
    password: 'Abc@123', //dummy place holder value just for validation purpose
    localAddress: req.body.userDetails.localAddress,
    permanentAddress: req.body.userDetails.permanentAddress
  };

  const updatedUserDetails = validateUser(tempUser);
  const updatedGuardianDetails = validateGuardian(req.body.guardianDetails);
  const updatedAcademicDetails = validateStudentAcademicDetails(req.body.academicDetails);
  const updateAccountDetails = validateStudentAccountDetails(req.body.accountDetails);
  validateStudentDates(tempUser.DOB, updatedAcademicDetails.dateOfAdmission);

  await user.update(
    {
      name: updatedUserDetails.name,
      DOB: updatedUserDetails.DOB,
      gender: updatedUserDetails.gender,
      email: updatedUserDetails.email,
      phone1: updatedUserDetails.phone1,
      phone2: updatedUserDetails.phone2,
      localAddress: updatedUserDetails.localAddress,
      permanentAddress: updatedUserDetails.permanentAddress,
      updatedAt: new Date().toString()
    },
    { where: { id: student.userId } }
  );

  await student.update(
    {
      accountDetails: updateAccountDetails,
      academicDetails: updatedAcademicDetails,
      guardianDetails: updatedGuardianDetails,
      updatedAt: new Date().toString()
    },
    { where: { userId: student.userId } }
  );

  successResp(res, student, 'Student updated successfully');
});

const deleteStudentDetails = asyncWrapper(async (req, res, next) => {
  if (!req.params.studentId) throw new AppError(400, 'Missing required `studentId` param');
  const student = await StudentModel.findOne({ where: { userId: req.params.studentId } });
  if (!student) throw new AppError(400, `Student with givenId ${req.params.studentId} does not exist`);

  try {
    await StudentModel.destroy({ where: { id: student.id } });
    await UserModel.destroy({ where: { id: student.userId } });
    successResp(res, {}, 'Student deleted successfully');
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError(403, `Cannot delete Student as it's already in use`);
    }
    throw err;
  }
});

module.exports = {
  addStudentDetails,
  getAllStudents,
  getStudentDetails,
  updateStudentDetails,
  deleteStudentDetails,
  addBulkStudentDetails
};
