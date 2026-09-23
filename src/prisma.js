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


const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter
});

module.exports = prisma;