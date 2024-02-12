const asyncWrapper = require('express-async-wrapper');
const Joi = require('joi');
const _ = require('lodash');
const {Op}= require('sequelize');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');
const CampusModel = require('../db/models/CampusModel');
const EventModel = require('../db/models/EventModel');
const BatchModel=require('../db/models/BatchModel');
const sessionModel=require('../db/models/SessionModel');
const programModel=require('../db/models/ProgramModel');
const topicModel=require('../db/models//TopicModel');
const CourseModel=require('../db/models/CourseModel');


const { validateCampus, validateSpace } = require('../utils/validations');

// CREATE
const addEvent = asyncWrapper(async (req, res, next) => {
    // Uncomment the following line if you want to restrict access to admins
    // if (req.userRole !== 'ADMIN') throw new AppError(400, 'You are unauthorized to add an Event');
  
    const reqBody = { ...req.body };
  
    // VALIDATIONS
    if (!reqBody.locationId || !reqBody.startDate || !reqBody.endDate || !reqBody.batchId ||
        !reqBody.batchType || !reqBody.programType || !reqBody.programId || !reqBody.courseId ||
        !reqBody.sessionId) {
      throw new AppError(400, 'All fields are required');
    }
  
    // Check if the event already exists with the same parameters
    const existingEvent = await EventModel.findOne({
      where: {
        startDate: reqBody.startDate,
        endDate: reqBody.endDate,
        batchId: reqBody.batchId,
        // Add other conditions as needed
      },
    });
  
    if (existingEvent) {
      throw new AppError(400, 'An event with the same parameters already exists');
    }
  
    // Insert into DB
    const newEvent = {
      locationId: reqBody.locationId,
      startDate: reqBody.startDate,
      endDate: reqBody.endDate,
      batchId: reqBody.batchId,
      batchType: reqBody.batchType,
      programType: reqBody.programType,
      programId: reqBody.programId,
      courseId: reqBody.courseId,
      sessionId: reqBody.sessionId,
      topics: reqBody.topics,
    };
  
    const result = await EventModel.create(newEvent);
    successResp(res, result, 'Event created successfully', 201);
  });
  
  const getAllEvent = asyncWrapper(async (req, res, next) => {
    const events = await EventModel.findAll({
      offset: req.query.offset,
      limit: req.query.limit,
      attributes: req.query.fields,
      include: [
        { model: BatchModel, attributes: ['id', 'batchCode'] },   // Include Batch data
        { model:sessionModel, attributes: ['id', 'sessionName'] }, // Include Session data
        { model: programModel, attributes: ['id', 'programName'] }, // Include Program data
      ],
    });
  
    successResp(res, events, 'Fetched successfully');
  });
                                                           

// READ all events
// const getAllEvent= asyncWrapper(async (req, res, next) => {
//     const events = await EventModel.findAll({
//         offset: req.query.offset,
//         limit: req.query.limit,
//         attributes: req.query.fields,
//       });


//       successResp(res, events, 'fetched successfully');
// });

// READ event by ID
const getEventById = asyncWrapper(async (req, res, next) => {
    if (!req.params.eventId) throw new AppError(400, 'Missing required `eventId` ');
    if (!req.params.eventId < 0) throw new AppError(400, 'Invalid required `eventId` ');
  
    const campus = await EventModel.findByPk(req.params.eventId);
    if (!campus) throw new AppError(400, `Event with id ${req.params.eventId} does not exist`);
  
    successResp(res, campus, 'fetched successfully');
  });

  // get all the details data 
const getAllScheduleDetails = asyncWrapper(async (req, res, next) => {
   
    
    const location = await CampusModel.findAll({});
    let locationData = location.map(el => ({ id: el.id, name: el.city }));

    const courses = await CourseModel.findAll({});
    let courseData = courses.map(el => ({ id: el.id, name: el.courseName }));

    const batch = await BatchModel.findAll({});
    let batchData = batch.map(el => ({ id: el.id, name: el.batchCode }));

    const session = await sessionModel.findAll({});
    let sessionData = session.map(el => ({ id: el.id, sessionName: el.sessionName }));

    const program = await programModel.findAll({});
    let programData = program.map(el => ({ id: el.id, programName: el.programName }));

    const topic = await topicModel.findAll({});
    let topicData = topic.map(el => ({ id: el.id, topicName: el.topicName }));

    const result={
        "location":locationData,
        "batch":batchData,
        "program":programData,
        "session":sessionData,
        "topic":topicData,
        "Courses":courseData

    }

    successResp(res, result, 'fetched successfully');
  });

// UPDATE event by ID
const updateEvent = asyncWrapper(async (req, res, next) => {
    // Validate eventId
    if (req.params.eventId < 0) throw new AppError(400, `Invalid Event Id`);

    // Make a copy of the request body
    const reqBodyCopy = { ...req.body };

    // Check for overlapping events
    const overlappingEvent = await EventModel.findOne({
        where: {
            locationId: reqBodyCopy.locationId,
            batchId: reqBodyCopy.batchId,
            id: { [Op.not]: req.params.eventId }, // Exclude the current event being updated
            startDate: { [Op.lt]: reqBodyCopy.endDate },
            endDate: { [Op.gt]: reqBodyCopy.startDate },
        },
    });

    if (overlappingEvent) {
        throw new AppError(400, `Another event already exists with the same location, batch, and overlapping time`);
    }

    // Update the Event
    await EventModel.update(
        {
            locationId: reqBodyCopy.locationId,
            startDate: reqBodyCopy.startDate,
            endDate: reqBodyCopy.endDate,
            batchId:reqBodyCopy.batchId,
            batchType: reqBodyCopy.batchType,
            programType:reqBodyCopy.programType,
            programId:reqBodyCopy.programId,
            courseId:reqBodyCopy.courseId,
            sessionId:reqBodyCopy.sessionId,
            updatedAt: new Date().toString(),
            // Add other fields to update as needed
        },
        { where: { id: req.params.eventId } }
    );

    successResp(res, overlappingEvent, 'Event updated successfully');
}); 

// const updateEvent = asyncWrapper(async (req, res, next) => {
//     if (req.params.eventId < 0) throw new AppError(400, `Invalid Batch Id`);
//     const reqBodyCopy = { ...req.body };
//     // const validatedEventDetails = validateBatch(reqBodyCopy);
  
//     // 1.) Check if AY exists with the given ayId
//     // const ayExists = await AcademicYear.findByPk(validatedBatchDetails.academicYearId);
//     // if (!ayExists) throw new AppError(400, `Academic Year with Id: ${validatedBatchDetails.academicYearId} does not exist`);
  
//     // // 2.) Check if Program exists with the given programId
//     // const program = await Program.findByPk(validatedBatchDetails.programId);
//     // if (!program) throw new AppError(400, `Program with Id: ${validatedBatchDetails.academicYearId} does not exist`);
  
//     //3. Get Batch
//     const event = await EventModel.findByPk(req.params.eventId);
//     if (!event) throw new AppError(400, `Batch with Id: ${req.params.eventId} does not exist`);
  
//     validateBatchDates(ayExists.name, validatedBatchDetails.startDate, validatedBatchDetails.endDate);
  
//     const overlappingEvent = await EventModel.findOne({
//         where: {
//             locationId: reqBodyCopy.locationId,
//             id: { [Op.not]: req.params.eventId }, // Exclude the current event being updated
//             startDate: { [Op.lt]: reqBodyCopy.endDate },
//             endDate: { [Op.gt]: reqBodyCopy.startDate },
//         },
//     });

//     if (overlappingEvent) {
//         throw new AppError(400, `Another event already exists with the same location and overlapping time`);
//     }

//     // Update the Event
//     await EventModel.update(
//         {
//             locationId: reqBodyCopy.locationId,
//             startDate: reqBodyCopy.startDate,
//             endDate: reqBodyCopy.endDate,
//             topics: reqBodyCopy.topics,
//             updatedAt: new Date().toString(),
//             // Add other fields to update as needed
//         },
//         { where: { id: req.params.eventId } }
//     )
//     successResp(res, batch, 'Event updated successfully');
// });



// DELETE event by ID
const deleteEvent = asyncWrapper(async (req, res, next) => {
    if (!req.params.eventId) throw new AppError(400, 'Missing required `event Id` param');
    const event = await EventModel.findByPk(req.params.eventId);
    if (!event) throw new AppError(400, `event with Id ${req.params.eventId} does not exist`);
  
   
    try {
      await EventModel.destroy({ where: { id: req.params.eventId } });
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        throw new AppError(403, `Cannot delete Event as it's already in use`);
      }
      throw err;
    }
  
    successResp(res, {}, 'Event deleted successfully');
});

module.exports = {
    addEvent,
    getAllEvent,
    getEventById,
    getAllScheduleDetails,
    updateEvent,
    deleteEvent
  };
