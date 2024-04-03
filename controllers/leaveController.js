const asyncWrapper = require('express-async-wrapper');
const { Op } = require('sequelize');
const Leave = require('../db/models/LeaveModel');
const UserModel = require('../db/models/UserModel');
const AppError = require('../utils/AppError');
const { successResp } = require('./middlewares/successHandler');


const postLeaveRequest = asyncWrapper(async (req, res) => {
    const createdByUserRole = req.headers['userrole'];

    const { startDate, endDate, reason } = req.body;

    const userId = req.params.userId
    console.log('user id --->', userId);

    const user = await UserModel.findByPk(userId);
    if (!user || createdByUserRole !== 'STUDENT') {
        throw new AppError(403, 'Only students are allowed to submit leave requests');
    }

    if (!startDate || !endDate || !reason) {
        throw new AppError(400, 'Missing required fields');
    }

    const leave = await Leave.create({ startDate, endDate, reason, userId });
    successResp(res, leave, 'Leave request submitted successfully', 201);
});

// GET leave requests for approval (accessible to admins and superadmins)
const getLeaveRequestsForApproval = asyncWrapper(async (req, res) => {
    const role = req.userRole; // Assuming user role is stored in the JWT payload
    console.log('role id --->', role);
    // Check if the user role is admin or superadmin
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        throw new AppError(403, 'Only admins and superadmins are allowed to view leave requests for approval');
    }

    const leaveRequests = await Leave.findAll({ where: { status: 'pending' } });
    successResp(res, leaveRequests, 'Leave requests for approval retrieved successfully');
});

// GET current month's leave requests for the logged-in user
const getCurrentMonthsLeaveRequests = asyncWrapper(async (req, res) => {
    const userId = req.params.userId;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const leaveRequests = await Leave.findAll({
        where: {
            userId,
            createdAt: { [Op.gte]: firstDayOfMonth }
        }
    });
    successResp(res, leaveRequests, 'Current month\'s leave requests retrieved successfully');
});

// PUT to approve/reject a leave request (accessible to admins and superadmins)
const approveRejectLeaveRequest = asyncWrapper(async (req, res) => {
    const leaveId = req.params.id;
    const { status } = req.body;

    // Check if the user role is admin or superadmin
    const role = req.userRole; // Assuming user role is stored in the JWT payload
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        throw new AppError(403, 'Only admins and superadmins are allowed to approve/reject leave requests');
    }

    // Validations
    if (!leaveId || !status || !['approved', 'rejected'].includes(status)) {
        throw new AppError(400, 'Invalid request');
    }

    const leave = await Leave.findByPk(leaveId);
    if (!leave) {
        throw new AppError(404, 'Leave request not found');
    }

    leave.status = status;
    leave.approverId = req.userId;
    leave.updateAt = new Date();
    await leave.save();

    successResp(res, leave, `Leave request ${status} successfully`);
});

module.exports = {
    postLeaveRequest,
    getLeaveRequestsForApproval,
    getCurrentMonthsLeaveRequests,
    approveRejectLeaveRequest
};
