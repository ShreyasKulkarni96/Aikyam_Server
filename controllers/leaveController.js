const asyncWrapper = require('express-async-wrapper');
const { Op } = require('sequelize');
const Leave = require('../db/models/LeaveModel');
const UserModel = require('../db/models/UserModel');
const AppError = require('../utils/AppError');
const { successResp } = require('./middleware/successHandler');

const verifyRole = (role, allowedRoles) => {
    if (!allowedRoles.includes(role)) {
        throw new AppError(403, `Access denied. Allowed roles: ${allowedRoles.join(', ')}`);
    }
};

const postLeaveRequest = asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate, reason } = req.body;
    const userRole = req.headers['userrole'];

    verifyRole(userRole, ['STUDENT']);

    if (!startDate || !endDate || !reason) {
        throw new AppError(400, 'Missing required fields');
    }

    const user = await UserModel.findByPk(userId);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const leaveRequest = await Leave.create({
        userId,
        startDate,
        endDate,
        reason,
    });
    successResp(res, leaveRequest, 'Leave request submitted successfully', 201);
});

const getLeaveRequestsForApproval = asyncWrapper(async (req, res) => {
    const userRole = req.headers['userrole']

    verifyRole(userRole, ['ADMIN', 'SUPER_ADMIN']);

    const leaveRequests = await Leave.findAll({
        where: { status: 'pending' },
        include: [{ model: UserModel, as: 'requester', attributes: ['id', 'name', 'email'] }],
    });

    successResp(res, leaveRequests, 'Leave requests for approval retrieved successfully');
});

const getCurrentMonthsLeaveRequests = asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const leaveRequests = await Leave.findAll({
        where: {
            userId,
            createdAt: { [Op.gte]: firstDayOfMonth },
        },
        include: [{ model: UserModel, as: 'requester', attributes: ['id', 'name', 'email'] }],
    });

    successResp(res, leaveRequests, 'Current month\'s leave requests retrieved successfully');
});

const approveRejectLeaveRequest = asyncWrapper(async (req, res) => {
    const { id: leaveId } = req.params;
    const { status } = req.body;
    const userRole = req.headers['userrole'];
    const { userId } = req.params;

    verifyRole(userRole, ['ADMIN', 'SUPER_ADMIN']);

    if (!['approved', 'rejected'].includes(status)) {
        throw new AppError(400, 'Invalid status. Allowed values: approved, rejected');
    }

    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
        throw new AppError(404, 'Leave request not found');
    }

    leave.status = status;
    leave.approverId = userId;
    leave.updateAt = new Date();
    await leave.save();

    successResp(res, leave, `Leave request ${status} successfully`);
});

const getAllLeaveRequests = asyncWrapper(async (req, res) => {
    const userRole = req.headers['userrole'];

    verifyRole(userRole, ['ADMIN', 'SUPER_ADMIN', 'STAFF']);

    const leaveRequests = await Leave.findAll({
        include: [{ model: UserModel, as: 'requester', attributes: ['id', 'name', 'email'] }],
    });

    successResp(res, leaveRequests, 'All leave requests retrieved successfully');
});


module.exports = {
    postLeaveRequest,
    getLeaveRequestsForApproval,
    getCurrentMonthsLeaveRequests,
    approveRejectLeaveRequest,
    getAllLeaveRequests
};