// const { PrismaClient } = require("@prisma/client");
// const { PrismaMariaDb } = require("@prisma/adapter-mariadb");


// const adapter = new PrismaMariaDb(
//     {
//         host: "127.0.0.1",
//         port: 3306,
//         user: process.env.DATABASE_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DATABASE_NAME,
//     });

// const prisma = new PrismaClient({
//     adapter
// });


// module.exports = prisma;



const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "DATABASE_URL is missing. Check the project-root .env file."
    );
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

module.exports = prisma;
