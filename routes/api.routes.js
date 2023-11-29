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

//user routes
router.post('/user/register', routeGuard, userCtrl.registerUser);
router.post('/user/login', userCtrl.loginUser);
router.get('/user/profile', routeGuard, userCtrl.getUserProfile);
router.get('/user/refresh-token', routeGuard, userCtrl.getRefreshToken);

//Campus routes
router
  .route('/campus/:campusId')
  .get(routeGuard, campusCtrl.getCampus)
  .patch(routeGuard, campusCtrl.updateCampus)
  .delete(routeGuard, campusCtrl.deleteCampus);
router.route('/campus').post(routeGuard, campusCtrl.addCampus).get(routeGuard, paginationFilter, campusCtrl.getAllCampuses);

// Academic Year Routes
router
  .route('/academic-year/:yearId')
  .get(routeGuard, academicYearCtrl.getAcademicYear)
  .patch(routeGuard, academicYearCtrl.updateAcademicYear)
  .delete(routeGuard, academicYearCtrl.deleteAcademicYear);
router
  .route('/academic-year')
  .post(routeGuard, academicYearCtrl.addAcademicYear)
  .get(routeGuard, paginationFilter, academicYearCtrl.getAllAcademicYears);

// Batch Routes
router
  .route('/batch/:batchId')
  .get(routeGuard, batchCtrl.getBatch)
  .patch(routeGuard, batchCtrl.updateBatch)
  .delete(routeGuard, batchCtrl.deleteBatch);
router.route('/batch').post(routeGuard, batchCtrl.addBatch).get(routeGuard, paginationFilter, batchCtrl.getAllBatches);

//Program routes
router
  .route('/program/:programId')
  .get(routeGuard, programCtrl.getProgram)
  .patch(routeGuard, programCtrl.updateProgram)
  .delete(routeGuard, programCtrl.deleteProgram);
router.route('/program').post(routeGuard, programCtrl.addProgram).get(routeGuard, paginationFilter, programCtrl.getAllPrograms);

//Course routes
router
  .route('/course/:courseId')
  .get(routeGuard, courseCtrl.getCourse)
  .patch(routeGuard, courseCtrl.updateCourse)
  .delete(routeGuard, courseCtrl.deleteCourse);
router.route('/course').post(routeGuard, courseCtrl.addCourse).get(routeGuard, paginationFilter, courseCtrl.getAllCourses);

//Session routes
router
  .route('/session/:sessionId')
  .get(routeGuard, sessionCtrl.getSession)
  .patch(routeGuard, sessionCtrl.updateSession)
  .delete(routeGuard, sessionCtrl.deleteSession);
router.route('/session').post(routeGuard, sessionCtrl.addSession).get(routeGuard, paginationFilter, sessionCtrl.getAllSessions);

//Topic routes
router
  .route('/topic/:topicId')
  .get(routeGuard, topicCtrl.getTopic)
  .patch(routeGuard, topicCtrl.updateTopic)
  .delete(routeGuard, topicCtrl.deleteTopic);
router.route('/topic').post(routeGuard, topicCtrl.addTopic).get(routeGuard, paginationFilter, topicCtrl.getAllTopics);

// Student routes
router
  .route('/student-details/:studentId')
  .get(routeGuard, studentCtrl.getStudentDetails)
  .patch(routeGuard, studentCtrl.updateStudentDetails)
  .delete(routeGuard, studentCtrl.deleteStudentDetails);
router
  .route('/student-details')
  .post(routeGuard, studentCtrl.addStudentDetails)
  .get(routeGuard, paginationFilter, studentCtrl.getAllStudents);
router.route('/student-addBulk').post(routeGuard, uploadFile.single('students_sheet'), studentCtrl.addBulkStudentDetails);
// router.route('/student-addBulk').post(routeGuard, upload.single('file'), fileParser, studentCtrl.addBulkStudentDetails);

// Faculty routes
router
  .route('/faculty/:facultyId')
  .get(routeGuard, facultyCtrl.getFacultyDetails)
  .patch(routeGuard, facultyCtrl.updateFaculty)
  .delete(routeGuard, facultyCtrl.deleteFaculty);
router
  .route('/faculty-experience/:facultyId/:expId?')
  .post(routeGuard, facultyCtrl.addFacultyExp)
  .get(routeGuard, facultyCtrl.getFacultyExperience)
  .patch(routeGuard, facultyCtrl.updateFacultyExp)
  .delete(routeGuard, facultyCtrl.deleteFacultyExp);
router.route('/faculty').post(routeGuard, facultyCtrl.addFaculty).get(routeGuard, paginationFilter, facultyCtrl.getAllFaculties);

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
