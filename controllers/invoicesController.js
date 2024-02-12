const asyncWrapper = require('express-async-wrapper');
const { successResp } = require('./middlewares/successHandler');
const InvoicesModel = require('../db/models/InvoiceModel');
const UserModel = require('../db/models//UserModel');
const DB = require('../db/connection');

const AppError = require('../utils/AppError');
const { Op } = require('sequelize')

const StudentModel = require('../db/models/StudentModel');

// Create Invoice - POST
const createInvoices = asyncWrapper(async (req, res) => {

    console.log("Invoice number", req.body);
    //1.  Check if the request body is a valid JSON
    if (typeof req.body !== 'object' || req.body === null) {
        return res.status(400).json({ error: 'Invalid JSON in the request body' });
    }
    //2. Generate a random invoice number
    const invoiceNumber = generateRandomInvoiceNumber();
    console.log("Invoice number", invoiceNumber);
    //3. Check if the generated invoice number is unique
    const isUnique = await InvoicesModel.findOne({
        where: { invoice_number: invoiceNumber }
    });

    if (isUnique) {
        return res.status(400).json({ error: 'Invoice number must be unique.' });
    }
    //4. Extract data from the validated request body
    const {
        invoice_date,
        batch_code,
        student_id,
        paymentPlan,
        amount,
        balanceAmount
    } = req.body;

    const transaction = await DB.transaction();

    try {

        // Create the invoice
        const invoice = {
            invoice_number: invoiceNumber,
            invoice_date: invoice_date,
            batch_code: batch_code,
            student_id: student_id,
            paymentPlan: paymentPlan,
            amount: amount,
            balanceAmount: balanceAmount-amount
        };

        await InvoicesModel.create(invoice, { transaction });

        // Update installmentDetails in the corresponding student's model within the transaction
        const student = await StudentModel.findByPk(student_id, { transaction });

        if (student) {
            const studentInstallmentDetails = Array.isArray(student.installmentDetails) ? student.installmentDetails : [];

            const newInstallmentDetailsEntry = {
                invoiceNumber,
                invoice_date,
                paymentPlan,
                amount,
                balanceAmount

            };
            const updatedInstallmentDetails = [...studentInstallmentDetails, newInstallmentDetailsEntry];

            
           // Calculate the updated balance and paid fees based on the new invoice amount
           const currentPaidFees = student.accountDetails?.paidFees || 0;
           const totalFees = student.accountDetails?.Totalpayable || 0;

           const updatedPaidFees = currentPaidFees + amount;
           const updatedBalance = totalFees - updatedPaidFees;

           // Update the student's installmentDetails and accountDetails columns
           await student.update({
               installmentDetails: updatedInstallmentDetails,
               accountDetails: {
                   ...student.accountDetails,
                   paidFees: updatedPaidFees,
                   balanceAmount: balanceAmount?balanceAmount:updatedBalance,
               },
               balanceAmount:balanceAmount?balanceAmount:updatedBalance
           }, { transaction });

        }

        await transaction.commit();

        successResp(res, invoice, 'Invoice created successfully', 201);

    } catch (error) {
        // Rollback the transaction if an error occurs
        await transaction.rollback();

        if (error.name === 'SequelizeValidationError') {
            console.error('Validation Errors:', error.errors.map(err => err.message));
            return res.status(400).json({ error: 'Validation Errors', details: error.errors });
        }

        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

// Get Invoices - GET with filters
const getInvoicesWithQueryParams = asyncWrapper(async (req, res) => {
    const { studentId, invoiceNumber, batchCode } = req.query;

    // Initialize whereClause with conditions related to invoices
    const whereClause = {};

    // Check if any query parameters are provided
    if (invoiceNumber) {
        whereClause.invoice_number = invoiceNumber;
    }
    if (batchCode) {
        whereClause.batch_code = batchCode;
    }

    // Include student name filtering if provided
    if (studentId) {
        const studentDetails = await StudentModel.findOne({
            where: { id: studentId },
            attributes: ['id', 'academicDetails', 'accountDetails'],
            include: [
                { model: UserModel, attributes: ['id', 'name'], required: true }
            ]
        });

        if (!studentDetails) {
            return res.status(404).json({ error: 'No student found for the given student ID' });
        }

        whereClause.student_id = studentDetails.id;
    }

    // Perform the query with the constructed whereClause
    const invoices = await InvoicesModel.findAll({
        where: Object.keys(whereClause).length === 0 ? null : whereClause,
        include: [
            { 
                model: StudentModel, 
                attributes: ['id', 'academicDetails', 'accountDetails'],
                include: [
                    {
                        model: UserModel, // Use the actual Sequelize model
                        attributes: ['id', 'name'],
                        required: true
                    }
                ]
            }
        ]
    });

    // Return the invoices in the response
    successResp(res, { invoices }, 'Invoices retrieved successfully', 200);
});




// Update Invoice - PUT
const updateInvoices = asyncWrapper(async (req, res) => {
    const { invoiceNumber } = req.params;

    // Find the invoice by invoice number
    const invoice = await Invoices.findOne({
        where: { invoice_number: invoiceNumber }
    });

    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update the invoice fields
    // For example:
    // invoice.invoice_date = req.body.invoice_date;
    // invoice.amount = req.body.amount;
    // ...

    // Save the updated invoice
    await invoice.save();

    successResp(res, invoice, 'Invoice updated successfully', 200);
})

// Delete Invoice - DELETE
const deleteInvoices = asyncWrapper(async (req, res) => {
    const { invoiceNumber } = req.params;

    // Find the invoice by invoice number
    const invoice = await Invoices.findOne({
        where: { invoice_number: invoiceNumber }
    });

    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete the invoice
    await invoice.destroy();

    successResp(res, null, 'Invoice deleted successfully', 200);
})

function generateRandomInvoiceNumber() {
    const currentDate = new Date();
    const datePart = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    const timePart = currentDate.toISOString().slice(11, 19).replace(/:/g, '');
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Adjust as needed

    const invoiceNumber = `${datePart}${timePart}${randomPart}`;
    return invoiceNumber;
}

// Function to calculate nextDueDate based on installmentNo
function calculateNextDueDate(invoiceDate, installmentNo) {

    // Assuming each installment is due every 30 days
    const daysToAdd = installmentNo * 30;

    // Calculate the nextDueDate
    const nextDueDate = new Date(invoiceDate);
    nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);

    // Check if it's the last installment for a 6-month period
    const isLastInstallmentFor6Months = installmentNo % 6 === 0;

    // If it's the last installment for a 6-month period, adjust the nextDueDate logic
    if (isLastInstallmentFor6Months) {
        // Adjust the logic as needed
        // For example, you might add a different number of days for the last installment
        const daysToAddForLastInstallment = 10; // Adjust as needed
        nextDueDate.setDate(nextDueDate.getDate() + daysToAddForLastInstallment);
    }

    return nextDueDate;
}





module.exports = {
    createInvoices,
    getInvoicesWithQueryParams,
    updateInvoices,
    deleteInvoices
};
