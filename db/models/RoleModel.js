const { DataTypes } = require("sequelize");
const DB = require("../connection");

const Role = DB.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    permissions: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.ENUM("A", "I"),
      allowNull: false,
      defaultValue: "A",
    },
  },
  {
    freezeTableName: true,
    tableName: "roles",
    timestamps: true,
    indexes: [
      // Create a unique index on email
      {
        name: "roleName",
        unique: true,
        fields: ["name"],
      },
    ],
  }
);

module.exports = Role;
