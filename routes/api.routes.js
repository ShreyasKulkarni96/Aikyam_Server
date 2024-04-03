const router = require('express').Router();
const routeGuard = require('../controllers/middlewares/routeGuard');
const { paginationFilter } = require('../controllers/middlewares/queryFilter');
const userCtrl = require('../controllers/userController.js');
const campusCtrl = require('../controllers/campusController');
const programCtrl = require('../controllers/programController');
const courseCtrl = require('../controllers/courseController');
const sessionCtrl = require('../controllers/sessionController');
const topicCtrl = require('../controllers/topicController');
const studentCtrl = require('../controllers/studentController');
const facultyCtrl = require('../controllers/facultyController');
const batchCtrl = require('../controllers/batchController');
const academicYearCtrl = require('../controllers/academicYearController');
const { uploadFile } = require('../controllers/middlewares/bulkUploads');
const eventCtrl = require('../controllers/eventController');
const invoiceCtrl = require('../controllers/invoicesController');
const leaveController = require('../controllers/leaveController.js');


//user routes
router.post('/user/register', userCtrl.registerUser);
router.post('/user/login', userCtrl.loginUser);
router.get('/user/profile', userCtrl.getUserProfile);
router.get('/user/refresh-token', userCtrl.getRefreshToken);

//Campus routes
router
  .route('/campus/:campusId')
  .get(campusCtrl.getCampus)
  .patch(campusCtrl.updateCampus)
  .delete(campusCtrl.deleteCampus);
router.route('/campus').post(campusCtrl.addCampus).get(paginationFilter, campusCtrl.getAllCampuses);

// Academic Year Routes
router
  .route('/academic-year/:yearId')
  .get(academicYearCtrl.getAcademicYear)
  .patch(academicYearCtrl.updateAcademicYear)
  .delete(academicYearCtrl.deleteAcademicYear);
router
  .route('/academic-year')
  .post(academicYearCtrl.addAcademicYear)
  .get(paginationFilter, academicYearCtrl.getAllAcademicYears);

// Batch Routes
router
  .route('/batch/:batchId')
  .get(batchCtrl.getBatch)
  .patch(batchCtrl.updateBatch)
  .delete(batchCtrl.deleteBatch);
router.route('/batch').post(batchCtrl.addBatch).get(paginationFilter, batchCtrl.getAllBatches);

router.route('/batches/:batchId/students/:studentId').post(batchCtrl.AddStudentbatch);

router.route('/batches/:batchId/students').get(batchCtrl.getBatchWithStudents);


//Program routes
router
  .route('/program/:programId')
  .get(programCtrl.getProgram)
  .patch(programCtrl.updateProgram)
  .delete(programCtrl.deleteProgram);
router.route('/program').post(programCtrl.addProgram).get(paginationFilter, programCtrl.getAllPrograms);

//Course routes
router
  .route('/course/:courseId')
  .get(courseCtrl.getCourse)
  .patch(courseCtrl.updateCourse)
  .delete(courseCtrl.deleteCourse);
router.route('/course').post(courseCtrl.addCourse).get(paginationFilter, courseCtrl.getAllCourses);

//Session routes
router
  .route('/session/:sessionId')
  .get(sessionCtrl.getSession)
  .patch(sessionCtrl.updateSession)
  .delete(sessionCtrl.deleteSession);
router.route('/session').post(sessionCtrl.addSession).get(paginationFilter, sessionCtrl.getAllSessions);

//Topic routes
router
  .route('/topic/:topicId')
  .get(topicCtrl.getTopic)
  .patch(topicCtrl.updateTopic)
  .delete(topicCtrl.deleteTopic);
router.route('/topic').post(topicCtrl.addTopic).get(paginationFilter, topicCtrl.getAllTopics);

// Student routes
router
  .route('/student-details/:studentId')
  .get(studentCtrl.getStudentDetails)
  .patch(studentCtrl.updateStudentDetails)
  .delete(studentCtrl.deleteStudentDetails);
router
  .route('/student-details')
  .post(studentCtrl.addStudentDetails)
  .get(paginationFilter, studentCtrl.getAllStudents);
router.route('/student-addBulk').post(uploadFile.single('students_sheet'), studentCtrl.addBulkStudentDetails);
// router.route('/student-addBulk').post( upload.single('file'), fileParser, studentCtrl.addBulkStudentDetails);

// Faculty routes
router
  .route('/faculty/:facultyId')
  .get(facultyCtrl.getFacultyDetails)
  .patch(facultyCtrl.updateFaculty)
  .delete(facultyCtrl.deleteFaculty);
router
  .route('/faculty-experience/:facultyId/:expId?')
  .post(facultyCtrl.addFacultyExp)
  .get(facultyCtrl.getFacultyExperience)
  .patch(facultyCtrl.updateFacultyExp)
  .delete(facultyCtrl.deleteFacultyExp);
router.route('/faculty').post(facultyCtrl.addFaculty).get(paginationFilter, facultyCtrl.getAllFaculties);

//event / schedule routes
router
  .route('/event/:eventId')
  .get(eventCtrl.getEventById)
  .patch(eventCtrl.updateEvent)
  .delete(eventCtrl.deleteEvent);
router.route('/event').post(eventCtrl.addEvent).get(eventCtrl.getAllEvent);
router.route('/scheduleData/event').get(eventCtrl.getAllScheduleDetails);



//iNVOICES routes
router
  .route('/invoices')
  .get(invoiceCtrl.getInvoicesWithQueryParams)
  .patch(invoiceCtrl.updateInvoices)
  .delete(invoiceCtrl.updateInvoices);
router.route('/invoices').post(invoiceCtrl.createInvoices).get(invoiceCtrl.getInvoicesWithQueryParams);


// Leave management
router.post('/leave/:userId', leaveController.postLeaveRequest);
router.get('/leave/approval', leaveController.getLeaveRequestsForApproval);
router.get('/leave/:userId', leaveController.getCurrentMonthsLeaveRequests);
router.put('/leave/:id', leaveController.approveRejectLeaveRequest);




router.get('/test-data', (req, res) => {
  res.json([
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100
    }
  ]);
});

module.exports = router;
