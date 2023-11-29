const UserModel = require('../models/UserModel');
const users = require('./data/users.json');

const resetTables = async () => {
  console.log('Resetting Users...');
  await UserModel.truncate();
  const [u] = users;
  //INSERT INTO roles (`name`, `description`, permissions, isActive, createdAt,updatedAt)
  // VALUES('ADMIN', 'Admin role has all permision', 'ALL', 'A', now(), now());
  const result = await UserModel.bulkCreate(users, { individualHooks: true });

  console.log('Re-seeding Users Done.');
};

resetTables();
