require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("../src/prisma");

const seedAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "System Admin";

    if (!adminEmail || !adminPassword) {
        throw new Error(
            "ADMIN_EMAIL and ADMIN_PASSWORD are required"
        );
    }

    const existingAdmin = await prisma.user.findUnique({
        where: {
            email: adminEmail
        }
    });

    if (existingAdmin) {
        console.log("Admin already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(
        adminPassword,
        12
    );

    const admin = await prisma.user.create({
        data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN"
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    console.log("Admin created successfully:");
    console.log(admin);
};

seedAdmin()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });