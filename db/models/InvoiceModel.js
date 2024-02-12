const { DataTypes } = require('sequelize');
const DB = require('../connection');


const Invoices = DB.define('invoices', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    invoice_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    batch_code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'student_details',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    paymentPlan: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    balanceAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
  
}, {
freezeTableName: true,
tableName: 'invoices',
timestamps: true,
indexes: [
  {
    name: 'Invoice_ID_Unique',
    unique: true,
    fields: ['invoice_number']
  }
]
});

module.exports = Invoices;
