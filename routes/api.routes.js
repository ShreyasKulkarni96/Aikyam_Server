const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const campusCtrl = require("../controllers/campusController");
const { paginationFilter } = require('../controllers/middleware/queryFilter');
const academicYearCtrl = require('../controllers/academicYearController');
const batchCtrl = require('../controllers/batchController');
const programCtrl = require('../controllers/programController');
const courseCtrl = require('../controllers/courseController');
const sessionCtrl = require('../controllers/sessionController');
const topicCtrl = require('../controllers/topicController');
const studentCtrl = require('../controllers/studentController');
const facultyCtrl = require('../controllers/facultyController');
const { uploadFile } = require('../controllers/middleware/bulkUploads');
const eventCtrl = require('../controllers/eventController');
const invoiceCtrl = require('../controllers/invoiceController.js');
const leaveController = require('../controllers/leaveController.js');
const reportsController = require('../controllers/reportsController.js')

// USER
router.post("/user/register", userCtrl.registerUser);
router.post("/user/login", userCtrl.loginUser);
router.get("/user/profile", userCtrl.getUserProfile);
router.route("/verify/otp")
    .post(userCtrl.verifyOtp);
router.post("/user/resend-otp", userCtrl.resendOtp);

// CAMPUS
router.route('/campus/:campusId')
    .get(campusCtrl.getCampus)
    .patch(campusCtrl.updateCampus)
    .delete(campusCtrl.deleteCampus);
router.route('/campus')
    .post(campusCtrl.addCampus)
    .get(paginationFilter, campusCtrl.getAllCampuses);

// ACADEMIC YEAR
router.route('/academic-year/:yearId')
    .get(academicYearCtrl.getAcademicYear)
    .patch(academicYearCtrl.updateAcademicYear)
    .delete(academicYearCtrl.deleteAcademicYear);
router.route('/academic-year')
    .post(academicYearCtrl.addAcademicYear)
    .get(paginationFilter, academicYearCtrl.getAllAcademicYears);

// BATCH
router.route('/batch/:batchId')
    .get(batchCtrl.getBatch)
    .patch(batchCtrl.updateBatch)
    .delete(batchCtrl.deleteBatch);
router.route('/batch')
    .post(batchCtrl.addBatch)
    .get(paginationFilter, batchCtrl.getAllBatches);
router.route('/batches/:batchId/students/:studentId')
    .post(batchCtrl.AddStudentbatch);
router.route('/batches/:batchId/students')
    .get(batchCtrl.getBatchWithStudents);

// PROGAM
router.route('/program/:programId')
    .get(programCtrl.getProgram)
    .patch(programCtrl.updateProgram)
    .delete(programCtrl.deleteProgram);
router.route('/program')
    .post(programCtrl.addProgram)
    .get(paginationFilter, programCtrl.getAllPrograms);

// COURSE
router.route('/course/:courseId')
    .get(courseCtrl.getCourse)
    .patch(courseCtrl.updateCourse)
    .delete(courseCtrl.deleteCourse);
router.route('/course')
    .post(courseCtrl.addCourse)
    .get(paginationFilter, courseCtrl.getAllCourses);

// SESSION
router
    .route('/session/:sessionId')
    .get(sessionCtrl.getSession)
    .patch(sessionCtrl.updateSession)
    .delete(sessionCtrl.deleteSession);
router.route('/session')
    .post(sessionCtrl.addSession)
    .get(paginationFilter, sessionCtrl.getAllSessions);

// TOPIC
router.route('/topic/:topicId')
    .get(topicCtrl.getTopic)
    .patch(topicCtrl.updateTopic)
    .delete(topicCtrl.deleteTopic);
router.route('/topic')
    .post(topicCtrl.addTopic)
    .get(paginationFilter, topicCtrl.getAllTopics);

// STUDENT
router
    .route('/student-details/:studentId')
    .get(studentCtrl.getStudentDetails)
    .patch(studentCtrl.updateStudentDetails)
    .delete(studentCtrl.deleteStudentDetails);
router.route('/student-details')
    .post(studentCtrl.addStudentDetails)
    .get(paginationFilter, studentCtrl.getAllStudents);
router.route('/student-addBulk')
    .post(uploadFile.single('students_sheet'), studentCtrl.addBulkStudentDetails);

// FACULTY
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
router.route('/faculty')
    .post(facultyCtrl.addFaculty)
    .get(paginationFilter, facultyCtrl.getAllFaculties);

// EVENT
router.route('/event/:eventId')
    .get(eventCtrl.getEventById)
    .patch(eventCtrl.updateEvent)
    .delete(eventCtrl.deleteEvent);
router.route('/event')
    .post(eventCtrl.addEvent)
    .get(eventCtrl.getAllEvent);
router.route('/scheduleData/event')
    .get(eventCtrl.getAllScheduleDetails);

// INVOICE
router
    .route('/invoices')
    .get(invoiceCtrl.getInvoicesWithQueryParams)
    .patch(invoiceCtrl.updateInvoices)
    .delete(invoiceCtrl.updateInvoices);
router.route('/invoices')
    .post(invoiceCtrl.createInvoices)
    .get(invoiceCtrl.getInvoicesWithQueryParams);

// LEAVE
router.post('/leave/:userId', leaveController.postLeaveRequest);
router.get('/leave/approval', leaveController.getLeaveRequestsForApproval);
router.get('/leave/:userId', leaveController.getCurrentMonthsLeaveRequests);
router.put('/leave/:id', leaveController.approveRejectLeaveRequest);
router.get('/leave', leaveController.getAllLeaveRequests);

router.get('/reports/:reportType', reportsController.getReports);


module.exports = router;