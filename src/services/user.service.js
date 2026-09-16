const prisma = require("../prisma");

const readUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
};

module.exports = {
    readUsers
};