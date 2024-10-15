const bcrypt = require("bcrypt");
const RoleModel = require("../db/models/RoleModel");
const UserModel = require("../db/models/UserModel");
const logger = require("../utils/logger");

const seedDatabase = async () => {
  try {
    // Check if roles already exist
    const roleCount = await RoleModel.count();

    if (roleCount === 0) {
      await RoleModel.bulkCreate([
        {
          id: 1,
          name: "SUPER_ADMIN",
          description: "Admin role has all permission",
          permissions: "ALL",
          isActive: "A",
        },
        {
          id: 2,
          name: "ADMIN",
          description: "Admin role has all permission",
          permissions: "ALL",
          isActive: "A",
        },
        { id: 3, name: "STAFF", description: "Staff role", isActive: "A" },
        { id: 4, name: "FACULTY", description: "Faculty role", isActive: "A" },
        {
          id: 5,
          name: "STUDENT",
          description: "Student role has limited permissions",
          isActive: "A",
        },
      ]);
      logger.info("Roles have been seeded into the database");
    } else {
      logger.info("Roles already exist, skipping role seeding");
    }

    // Check if superadmin user exists
    const superAdminExists = await UserModel.findOne({ where: { roleId: 1 } });

    if (!superAdminExists) {
      await UserModel.create({
        name: "Super Admin",
        email: "Aik.Prod.01@gmail.com",
        phone1: "+91-9168186699",
        password: "Password@123",
        roleId: 1,
        userRole: "SUPER_ADMIN",
        isActive: "A",
        U_S_ID: "UID-000001",
        localAddress: "Admin Address",
        permanentAddress: "Admin Address",
        gender: "M",
        DOB: "1980-01-01",
      });
      logger.info("Super Admin user has been created");
    } else {
      logger.info("Super Admin already exists, skipping super admin creation");
    }
  } catch (error) {
    logger.error("Error seeding database:", error);
  }
};

module.exports = seedDatabase;
