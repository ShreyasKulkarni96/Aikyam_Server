const _ = require('lodash');
const validator = require('validator');
const Joi = require('joi');
const AppError = require('./AppError');
const excludeWords = ['in', 'for', 'of', 'the', 'on', 'to', 'off', 'from', 'under', 'at'];

const validateUser = data => {
  const PASS_REGEX = /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[\d|@#$!%*?&])[\p{L}\d@#$!%*?&]{6,20}$/gmu;
  const NAME_REGEX = /^[A-Za-z.\s]{2,50}$/;
  const ADDRESS_REGEX = /^[0-9A-Za-z\s,\-.]*$/;
  const currentYear = new Date().getFullYear();
  const MIN_DATE = new Date();
  MIN_DATE.setFullYear(MIN_DATE.getFullYear() - 100);
  MIN_DATE.setHours(0, 0, 0, 0);
  console.log(MIN_DATE);
  const MAX_DATE = new Date();
  MAX_DATE.setFullYear(MAX_DATE.getFullYear() - 5);
  MAX_DATE.setHours(0, 0, 0, 0);

  let { name, DOB, gender, email, phone1, phone2 = null, password, localAddress, permanentAddress } = data;

  // Validations
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing request body');
  if (Object.values(data).find(el => typeof el !== 'string')) throw new AppError(400, 'All fields must be string');
  if (!name || !DOB || !email || !phone1 || !password) throw new AppError(400, 'Missing required fields');
  if (!NAME_REGEX.test(name))
    throw new AppError(400, 'Name can contain alphabets, blank space and . with min 2 characters max 50 characters.');
  const YOB = new Date(DOB).getFullYear();
  // if (!validator.isDate(DOB, 'DD-MM-YYYY'))  console validator.isDate(DOB, 'YYYY-MM-DD')
  if (!validator.isDate(DOB, 'YYYY-MM-DD')) throw new AppError(400, 'Date must be in the format of YYYY-MM-DD');
  if (currentYear - YOB < 5) throw new AppError(400, 'Allowed age is upto 5 years');
  if (new Date(DOB) < MIN_DATE) throw new AppError(400, `Birth Year can not be less than ${MIN_DATE.getFullYear()}`);
  // if (new Date(DOB) > MAX_DATE) throw new AppError(400, 'Age should be more than 5 years');
  if (!['M', 'F', 'O'].includes(gender)) throw new AppError(400, 'Invalid Gender passed');
  if (!validator.isEmail(email)) throw new AppError(400, 'Invalid Email');
  if (!PASS_REGEX.test(password)) throw new AppError(400, 'Password must contain 1 Capital, 1 number and min 6 chars');
  const mobile1 = phone1.includes('-') ? phone1.split('-')[1] : phone1;
  if (!validator.isMobilePhone(mobile1, ['en-IN']) || phone1.startsWith('-')) throw new AppError(400, 'Invalid Phone number');
  if (!ADDRESS_REGEX.test(localAddress)) throw new AppError(400, 'Please enter proper local address');
  if (localAddress.length > 500 || localAddress.length < 2)
    throw new AppError(400, 'Local address can be min 6 characters and max 500 characters');
  if (!ADDRESS_REGEX.test(permanentAddress)) throw new AppError(400, 'Please enter proper Permanent address');
  if (permanentAddress.length > 500 || permanentAddress.length < 5)
    throw new AppError(400, 'Permanent address can be min 6 characters and max 500 characters');

  // Sanitation
  name = name.trim().replace(/\s\s+/g, ' ');
  localAddress = localAddress.trim().replace(/\s\s+/g, ' ');
  permanentAddress = permanentAddress.trim().replace(/\s\s+/g, ' ');
  permanentAddress = permanentAddress && permanentAddress !== 'SAME' ? permanentAddress : localAddress;
  phone1 = phone1.trim();
  if (phone2) {
    const mobile2 = phone2.includes('-') ? phone2.split('-')[1] : phone2;
    if (!validator.isMobilePhone(mobile2, ['en-IN']) || phone1.startsWith('-')) throw new AppError(400, 'Invalid Phone number 2');
    phone2 = phone2.trim();
  }

  return { name, DOB, gender, email, phone1, phone2, password, localAddress, permanentAddress };
};

const validateGuardian = data => {
  // let { name, relation, gender, localAddress, permanentAddress, email, phone1, phone2 = null } = data;

  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing guardian details');

  // validation and sanitation
  const guardianSchema = Joi.object({
    name: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.]+$/) //name containing uppercase or lowercase letters, periods (.), spaces, or hyphens (-)
      .message('Invalid Guardian/Parent Name')
      .min(2)
      .max(50)
      .required(),
    relation: Joi.string()
      .trim()
      .valid('Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousins', 'Other')
      .min(5)
      .max(20)
      .required(),
    gender: Joi.string().valid('M', 'F', 'O').required(),
    address: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[0-9A-Za-z\s,\-.]*$/) //alphanumeric characters, spaces, hyphens, commas, periods
      .message('Invalid Guardian/Parent Address')
      .trim()
      .min(2)
      .max(300)
      .required(),
    email: Joi.string().email().min(4).max(50).required(),
    phone: Joi.string()
      .trim()
      .regex(/^(?:\+91-)?\d{10}$/)
      .message('Invalid Guardian/Parent Phone number')
      .required()
  });

  const { error: validationErr } = guardianSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  // return { name, relation, gender, localAddress, permanentAddress, email, phone1, phone2 };
  return data;
};

const validateStudentAccountDetails = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Student Account details');

  let { paymentPlan, totalFees, discount, paidFees, balanceAmount, pdcDetails, Totalpayable } = data;

  const studentAccountSchema = Joi.object({
    paymentPlan: Joi.string().trim().valid('CASH', 'CHEQUE', 'ONLINE PAYMENT').required(),
    totalFees: Joi.number().min(0).optional(),
    Totalpayable: Joi.number().min(0).optional(),
    balanceAmount: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).max(100).optional(),
    paidFees: Joi.number().min(0).optional(),
    pdcDetails: Joi.string().trim().allow('').optional()
  });

  const { error: validationErr } = studentAccountSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  totalFees = parseFloat(totalFees);
  discount = parseFloat(discount);
  paidFees = parseFloat(paidFees);

  if (discount > 0) {
    const totalDiscount = (totalFees * discount) / 100;

    if (paidFees > totalFees) {
      throw new AppError(400, 'Paid Fees cannot be more than Total Fees');
    }
    if (totalDiscount + paidFees > totalFees) {
      throw new AppError(400, 'Paid Fees and Discount cannot be more than Total Fees');
    }
  } else {
    if (paidFees > totalFees) {
      throw new AppError(400, 'Paid Fees cannot be more than Total Fees');
    }
  }

  return data;
};

const validateStudentAcademicDetails = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing academic details');
  let { dateOfAdmission } = data;
  const Min_Date = new Date();
  Min_Date.setFullYear(Min_Date.getFullYear() - 100);
  Min_Date.setHours(0, 0, 0, 0);
  console.log('Min_Date');
  console.log(Min_Date);
  const Current_Date = new Date();
  const Allowed_Date = new Date();
  Allowed_Date.setDate(Current_Date.getDate() - 5);
  Allowed_Date.setHours(0, 0, 0, 0);
  // Validations
  const academySchema = Joi.object({
    batchId: Joi.number().min(1).required(),
    batchCode: Joi.string().trim().min(5).max(50).required(),
    elective: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.]+$/)
      .min(2)
      .max(50)
      .optional(),
    dateOfAdmission: Joi.string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required()
  });

  const { error: validationErr } = academySchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  if (new Date(dateOfAdmission) < Min_Date) {
    throw new AppError(400, 'Admission Year cannot be less than 1980');
  } else if (new Date(dateOfAdmission) > Current_Date || new Date(dateOfAdmission) < Allowed_Date) {
    throw new AppError(
      400,
      `Admission Date must be within the range of today to up to 5 days before today (from ${Allowed_Date.toDateString()} to ${Current_Date.toDateString()}).`
    );
  }

  if (isNaN(new Date(dateOfAdmission).getTime()) || dateOfAdmission.split('-')[0] === '0000') {
    throw new AppError(400, 'Please Enter Proper Admission Date');
  }

  // if (new Date(dateOfAdmission) > new Date()) throw new AppError(400, 'Admission Date can not be in future');
  return data;
};

const validateStudentDates = (DOB, DOA) => {
  if (!DOB || !DOA || _.isEmpty(DOB) || _.isEmpty(DOA))
    throw new AppError(400, 'Missing Date of Birth Date and Date of Admission');
  const birthDate = new Date(DOB);
  const admissionDate = new Date(DOA);
  if (birthDate >= admissionDate) {
    throw new AppError(400, 'Date of Admission can not be greater than or Equal to Date of Birth');
  }
};

const validateFacultyDates = (DOB, startDate, endDate) => {
  if (!DOB || !startDate || !endDate || _.isEmpty(DOB) || _.isEmpty(startDate) || _.isEmpty(endDate))
    throw new AppError(400, 'Missing Date of Birth Date, Start Date or End Date');

  const dateOfBirth = new Date(DOB);
  const employmentStartDate = new Date(startDate);
  const employmentEndDate = new Date(endDate);
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  const birthYear = dateOfBirth.getFullYear();

  // Calculate the difference in years
  const age = currentYear - birthYear;

  if (age < 18) {
    throw new AppError(400, 'Faculty must be at least 18 years old.');
  }
  if (dateOfBirth >= employmentStartDate || dateOfBirth >= employmentEndDate) {
    throw new AppError(400, 'Date of Admission can not be greater than or Equal to Date of Birth');
  }
};

const validateFacultyAcademicDetails = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Faculty Academic details');
  const MIN_DATE = new Date();
  MIN_DATE.setFullYear(MIN_DATE.getFullYear() - 100);
  MIN_DATE.setHours(0, 0, 0, 0);

  //validations and sanitation
  let { institution, degree, fieldOfStudy, startDate, endDate } = data;
  const careerDetailSchema = Joi.object({
    institution: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(2)
      .max(100)
      .required(),
    degree: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(2)
      .max(100)
      .required(),
    fieldOfStudy: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(2)
      .max(30)
      .required(),
    startDate: Joi.string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required()
  });

  const { error: validationErr } = careerDetailSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  if (new Date(startDate) < MIN_DATE || new Date(endDate) < MIN_DATE)
    throw new AppError(400, 'Start date or End date can not be less than 1980');

  if (
    isNaN(new Date(startDate).getTime()) ||
    isNaN(new Date(endDate).getTime()) ||
    startDate.split('-')[0] === '0000' ||
    endDate.split('-')[0] === '0000'
  ) {
    throw new AppError(400, 'Enter Proper Start or end Date');
  }

  if (new Date(startDate) > new Date()) {
    throw new AppError(400, "Start date can not be from Today's Date");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError(400, 'Start date can not be greater than or equal to End Date');
  }

  return data;
};

const validateFacultyCareerDetails = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Faculty Carrier details');

  const monthPattern = /^(Jan|Feb|Mar|Apr|May|June|July|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s*|(present)$/;

  if (!Array.isArray(data)) data = [data];
  //validations and sanitation
  const careerDetailSchema = Joi.object({
    expId: Joi.number().min(1).optional(),
    designation: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(5)
      .max(20)
      .required(),
    employer: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(5)
      .max(20)
      .required(),
    from: Joi.string().trim().regex(monthPattern).required(),
    to: Joi.string().trim().regex(monthPattern).required(),
    area: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[0-9A-Za-z\s\-.,]*$/)
      .min(5)
      .max(50)
      .required(),
    skills: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(5)
      .max(50)
      .required()
  });
  data.forEach((element, index) => {
    const { error: validationErr } = careerDetailSchema.validate(element);

    if (validationErr) {
      console.log(`Validation error for element at index ${index}:`, element);
      throw new AppError(400, validationErr.toString().replaceAll('"', '`'));
    }

    let { from, to } = element;

    function getMonthIndex(monthName) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthName);
    }

    if (from === 'present') throw new AppError(400, 'From Field in Career Details can not be present');
    const fromParts = from.split(' ');
    const fromMonth = fromParts[0];
    const fromYear = parseInt(fromParts[1]);
    if (fromYear < 1980) throw new AppError(400, 'Date Field in Career Details can not less than 1980');

    let toDate = null;
    if (to === 'present') {
      toDate = new Date();
    } else {
      const toParts = to.split(' ');
      const toMonth = toParts[0];
      const toYear = parseInt(toParts[1]);
      toDate = new Date(toYear, getMonthIndex(toMonth));
    }
    const fromDate = new Date(fromYear, getMonthIndex(fromMonth)); // Helper function getMonthIndex
    const currentDate = new Date();

    if (fromDate > currentDate || toDate > currentDate) {
      throw new AppError(400, 'Dates in Career details cannot be in the future');
    }

    if (fromDate > toDate) {
      throw new AppError(400, 'Invalid Years and months in Career details');
    }
  });

  return data;
};

const validateFacultyAccountDetails = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Faculty account details');

  // validation and sanitation
  const accountSchema = Joi.object({
    facultyCharges: Joi.number().min(0).required(),
    facultyPAN: Joi.string()
      .trim()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      .required(),
    facultyGST: Joi.string()
      .trim()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .allow('')
      .optional(),
    registeredAddress: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[0-9A-Za-z\s\-.,]*$/)
      .min(2)
      .max(300)
      .allow('')
      .optional(),
    paymentPlan: Joi.string().trim().valid('MONTHLY', 'SESSION-WISE').required(),
    bankName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(2)
      .max(50)
      .required(),
    accountHolderName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.]+$/)
      .min(2)
      .max(20)
      .required(),
    accountNumber: Joi.string()
      .min(9)
      .max(18)
      .regex(/^[0-9]{9,18}$/)
      .required(),
    bankIFSCode: Joi.string()
      .min(11)
      .max(11)
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .required(),
    bankBranch: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.,]+$/)
      .min(2)
      .max(20)
      .required(),
    facultyType: Joi.string().trim().valid('EMPLOYEE', 'PROFESSIONAL').required(),
    facultyAvailability: Joi.string().trim().valid('Regular Sessions', 'Rare Sessions', 'General').required()
  });

  const { error: validationErr } = accountSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  return data;
};

// Validate Program
const validateProgram = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Program details');
  const programSchema = Joi.object({
    id: Joi.number().min(0).optional(),
    programName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.]+$/)
      .allow(' ', '.', ',')
      .min(2)
      .max(50)
      .required(),
    type: Joi.string().trim().valid('core', 'elective').required(),
    details: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[a-zA-Z0-9,.\-\s]+$/)
      .allow('')
      .min(2)
      .max(100)
      .required(),
    programCode: Joi.string().optional()
  });

  const { error: validationErr } = programSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  return data;
};

// Validate Topic
const validateTopic = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Topic details');

  const topicSchema = Joi.object({
    topicName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.]+$/)
      .min(2)
      .max(50)
      .required(),
    description: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[a-zA-Z0-9,.\-\s]+$/)
      .min(2)
      .max(100)
      .required(),
    sessionIds: Joi.array().min(1).max(50).items(Joi.number()).optional(), // maximum 50 sessions in Topic are allowed
    courseId: Joi.number().min(1).optional(),
    type: Joi.string().valid('core', 'elective').required(),
    topicCode: Joi.string().optional()
  });

  const { error: validationErr } = topicSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  return data;
};

//Validate Batch
const validateBatch = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Batch details');

  let { startDate, endDate } = data;
  const MIN_DATE = new Date();
  MIN_DATE.setFullYear(MIN_DATE.getFullYear() - 100);
  MIN_DATE.setHours(0, 0, 0, 0);
  const batchSchema = Joi.object({
    id: Joi.number().min(0).positive().optional(),
    academicYearId: Joi.number().positive().min(0).required(),
    type: Joi.string().min(2).max(20).valid('core', 'elective').required(),
    description: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[a-zA-Z0-9,.\-\s]+$/)
      .allow('')
      .min(2)
      .max(200)
      .optional(),
    programId: Joi.number().positive().min(0).required(),
    batchCode: Joi.string().min(2).max(50).required(),
    startDate: Joi.string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    endDate: Joi.string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    capacity: Joi.number().min(0).positive().optional()
  });

  const { error: validationErr } = batchSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  if (
    isNaN(new Date(startDate).getTime()) ||
    isNaN(new Date(endDate).getTime()) ||
    startDate.split('-')[0] === '0000' ||
    endDate.split('-')[0] === '0000'
  ) {
    throw new AppError(400, 'Enter Proper Start or end Date');
  }

  if (new Date(startDate) < MIN_DATE || new Date(endDate) < MIN_DATE) {
    throw new AppError(400, 'Start date or End date can not be less than 1950');
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError(400, 'Start date can not be greater than or equal to End Date');
  }

  return data;
};

//Validate Batch Dates
const validateBatchDates = (ayName, startDate, endDate) => {
  if (!ayName || _.isEmpty(ayName)) throw new AppError(400, 'Missing Academic Year details');
  if (!startDate || _.isEmpty(startDate)) throw new AppError(400, 'Missing Batch Start Date');
  if (!endDate || _.isEmpty(endDate)) throw new AppError(400, 'Missing Batch End Date');

  const yearParts = ayName.split('-');
  if (yearParts.length === 2) {
    startYear = yearParts[0].substring(2);
    endYear = yearParts[1];
    const startYearDate = new Date(startYear, 0, 1);
    const endYearDate = new Date(endYear, 11, 31);
    if (new Date(startDate) < startYearDate) {
      throw new AppError(
        400,
        `Batch Start Date cannot be before Academic Year ${startYearDate.getFullYear()} - ${endYearDate.getFullYear()}`
      );
    }
    if (new Date(startDate) > endYearDate) {
      throw new AppError(
        400,
        `Batch Start Date cannot be after Academic Year ${startYearDate.getFullYear()} - ${endYearDate.getFullYear()}`
      );
    }
    if (new Date(endDate) < startYearDate) {
      throw new AppError(
        400,
        `Batch End Date can not be before Academic Year ${startYearDate.getFullYear()} - ${endYearDate.getFullYear()}`
      );
    }
    if (new Date(endDate) > endYearDate) {
      throw new AppError(
        400,
        `Batch End Date cannot be After Academic Year ${startYearDate.getFullYear()} - ${endYearDate.getFullYear()}`
      );
    }
  } else {
    throw new AppError(400, 'Invalid Academic Year Format');
  }
};

//validate Course
const validateCourse = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Course details');

  const courseSchema = Joi.object({
    courseName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.]+$/)
      .min(2)
      .max(100)
      .required(),
    type: Joi.string().trim().valid('core', 'elective').required(),
    description: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[a-zA-Z0-9\s\-.,]+$/)
      .min(2)
      .max(200)
      .required(),
    programId: Joi.number().min(1).max(10000).optional(),
    courseId: Joi.number().min(1).max(10000).optional(),
    courseCode: Joi.string().max(80).optional()
  });

  const { error: validationErr } = courseSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));
  return data;
};

// Validate Session
const validateSession = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Session details');

  const sessionSchema = Joi.object({
    sessionName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.]+$/)
      .min(2)
      .max(100)
      .required(),
    type: Joi.string().trim().valid('classroom', 'lab', 'studio', 'field visit').required(),
    timeDuration: Joi.string().min(1).max(50).required(),
    description: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[a-zA-Z0-9\s\-.,]+$/)
      .min(2)
      .max(100)
      .required(),
    courseId: Joi.number().min(1).max(1000).required(),
    sessionCode: Joi.string().optional(),
    sequence: Joi.string()
      .regex(/^[a-zA-Z0-9\s\-.,]+$/)
      .optional()
  });

  const { error: validationErr } = sessionSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  return data;
};

//Validate Campus
const validateCampus = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Campus details');

  const campusSchema = Joi.object({
    facilityName: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.]+$/)
      .message('Invalid Campus Name')
      .min(2)
      .max(100)
      .required(),
    facilityAddress: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.,]+$/)
      .message('Invalid Campus Address')
      .min(2)
      .max(100)
      .required(),
    contactPerson: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z\s\-.]+$/)
      .message('Invalid Campus Head Name')
      .min(2)
      .max(100)
      .required(),
    contactPersonPhone: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^(?:\+91-)?\d{10}$/)
      .message('Invalid phone number format')
      .required(),
    contactPersonAddress: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.,]+$/)
      .message('Invalid Campus Address')
      .min(2)
      .max(100)
      .required(),
    contactPersonEmail: Joi.string().trim().min(4).max(50).email().required(),
    city: Joi.string().trim().replace(/\s\s+/g, ' ').min(2).max(50).required()
  });

  const { error: validationErr } = campusSchema.validate(data);
  if (validationErr) throw new AppError(400, validationErr.toString().replaceAll('"', '`'));

  return data;
};

//validate Space
const validateSpace = data => {
  if (!data || _.isEmpty(data)) throw new AppError(400, 'Missing Campus Space details');
  if (data && typeof data !== 'object') throw new AppError(400, '`spaceDetails must be json object`');

  if (!Array.isArray(data)) data = [data];
  const spaceSchema = Joi.object({
    id: Joi.number().min(0).positive().optional(),
    spaceId: Joi.number().min(0).optional(),
    typeOfSpace: Joi.string()
      .trim()
      .replace(/\s\s+/g, ' ')
      .valid(
        'traditional classroom',
        'digital classroom',
        'seminar hall',
        'student lab',
        'recording studio',
        'music recording (small)',
        'music recording (large)',
        'dubbing',
        'foley',
        'film mix theater'
      )
      .required(),
    spaceTitle: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .replace(/\s\s+/g, ' ')
      .regex(/^[A-Za-z0-9\s\-.,]+$/)
      .message('Invalid Space Title')
      .required(),
    spaceCapacity: Joi.number().min(0).positive().required(),
    isActive: Joi.number().min(1).max(1).positive().optional()
  });

  data.forEach(element => {
    const { error: validationErr } = spaceSchema.validate(element);

    if (validationErr) {
      throw new AppError(400, validationErr.toString().replaceAll('"', '`'));
    }
  });
  return data;
};

module.exports = {
  validateUser,
  validateGuardian,
  validateStudentDates,
  validateFacultyDates,
  validateStudentAcademicDetails,
  validateStudentAccountDetails,
  validateFacultyAcademicDetails,
  validateFacultyCareerDetails,
  validateFacultyAccountDetails,
  validateProgram,
  validateTopic,
  validateBatch,
  validateBatchDates,
  validateCourse,
  validateSession,
  validateCampus,
  validateSpace,
  excludeWords
};
