const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

// const adapter = new PrismaMariaDb(process.env.DATABASE_URL);


const adapter = new PrismaMariaDb(
    {
        host: "localhost",
        port: 3306,
        user: "root",
        password: process.env.DB_PASSWORD,
        database: "job_portal"
    });

const prisma = new PrismaClient({
    adapter
});

module.exports = prisma;