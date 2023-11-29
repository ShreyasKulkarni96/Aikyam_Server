// const { uploadPath } = require('../../config'); // Path to upload file
const multer = require('multer');
const AppError = require('../../utils/AppError');
const path = require('path');

const uploadPath = path.join(__dirname, '../../static/uploads');

const excelFilter = (req, file, cb) => {
  if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Please upload only excel file.'), false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Use the uploadPath variable here
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-sms-${file.originalname}`);
  }
});

var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = { uploadFile, uploadPath };
