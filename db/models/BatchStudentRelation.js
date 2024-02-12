const { DataTypes } = require('sequelize');
const DB = require('../connection');
// const Student = require('./StudentModel');
// const Batch = require('./BatchModel');

const BatchStudentRelation = DB.define('batch_student_relation', {
    batchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
}, {
    tableName: 'batch_student_relation',
    timestamps:true
});



module.exports = BatchStudentRelation;
