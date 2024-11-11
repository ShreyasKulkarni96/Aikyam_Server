const generateRandomUserID = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const userID = `UID-${randomNumber}`;
    return userID;
};

module.exports = generateRandomUserID;