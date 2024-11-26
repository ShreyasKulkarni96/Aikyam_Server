const asyncWrapper = require('express-async-wrapper');
const Student = require('../db/models/StudentModel');
const Batch = require('../db/models/BatchModel');
const Program = require('../db/models/ProgramModel');
const Invoices = require('../db/models/InvoicesModel');
const User = require('../db/models/UserModel');
const Campus = require('../db/models/CampusModel');

const reportRegistry = {
    StudentReports: {
        fetchData: async (id) => {
            return Student.findAll({
                where: id ? { id } : {},
                include: [
                    { model: Batch, attributes: ['batchCode'] },
                    { model: Program, attributes: ['programName'] },
                    { model: Invoices, attributes: ['balanceAmount', 'amount'] }
                ]
            });
        },
        formatData: (data) => {
            return data.map((student) => ({
                id: student.id,
                studentName: student.User?.name || 'N/A',
                enrollDate: student.createdAt, // Assuming createdAt is the enroll date
                programName: student.Program?.programName || 'N/A',
                batch: student.Batches?.[0]?.batchCode || 'N/A',
                contactNumber: student.User?.contact || 'N/A',
                emailAddress: student.User?.email || 'N/A',
                feeStatus:
                    student.Invoices.reduce((acc, invoice) => acc + parseFloat(invoice.balanceAmount), 0) === 0
                        ? 'Paid'
                        : 'Pending',
                totalFees: student.Invoices.reduce((acc, invoice) => acc + parseFloat(invoice.amount), 0),
                pendingFees: student.Invoices.reduce((acc, invoice) => acc + parseFloat(invoice.balanceAmount), 0),
                attendance: student.attendanceDetails?.attendancePercentage || 'N/A',
                enrollStatus: student.enrollStatus || 'Active',
                lastPaymentDate: student.Invoices?.[0]?.invoice_date || 'N/A'
            }));
        }
    },
    // Add more report types here
    FacultyReports: {
        fetchData: async (id) => {
            return Faculty.findAll({
                where: id ? { id } : {},
                include: [
                    { model: User, attributes: ['name', 'email', 'contact'] },
                    { model: Campus, attributes: ['facilityName', 'city', 'state'] }
                ]
            });
        },
        formatData: (data) => {
            return data.map((faculty) => ({
                id: faculty.id,
                employeeId: faculty.employeeId,
                facultyName: faculty.User?.name || 'N/A',
                email: faculty.User?.email || 'N/A',
                contact: faculty.User?.contact || 'N/A',
                facultyType: faculty.facultyType || 'N/A',
                availability: faculty.availability || 'N/A',
                remunerationPlan: faculty.remunerationPlan || 'N/A',
                campus: faculty.Campus?.facilityName || 'N/A',
                city: faculty.Campus?.city || 'N/A',
                state: faculty.Campus?.state || 'N/A',
                academicDetails: faculty.academicDetails || {},
                accountDetails: faculty.accountDetails || {},
                careerDetails: faculty.careerDetails || {}
            }));
        }
    },

    CampusReports: {
        fetchData: async (id) => {
            return Campus.findAll({
                where: id ? { id } : {}
            });
        },
        formatData: (data) => {
            return data.map((campus) => ({
                id: campus.id,
                facilityName: campus.facilityName,
                city: campus.city,
                state: campus.state || 'N/A',
                facilityAddress: campus.facilityAddress,
                contactPerson: campus.contactPerson,
                contactPersonAddress: campus.contactPersonAddress,
                contactPersonEmail: campus.contactPersonEmail,
                contactPersonPhone: campus.contactPersonPhone,
                spaceDetails: campus.spaceDetails || {},
                isActive: campus.isActive === 'A' ? 'Active' : 'Inactive'
            }));
        }
    }

};

const getReports = asyncWrapper(async (req, res) => {
    const reportType = req.params.reportType;
    const id = req.query.id;

    const report = reportRegistry[reportType];

    if (!report) {
        return res.status(400).json({ error: `Invalid report type: ${reportType}` });
    }
    try {
        const data = await report.fetchData(id);
        const formattedData = report.formatData(data);

        return res.status(200).json({
            success: true,
            reportType,
            data: formattedData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    getReports
}