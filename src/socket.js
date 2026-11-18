
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const prisma = require("../src/prisma");

let io;

const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL?.trim().replace(/\/$/, ""),
].filter(Boolean);

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) {
                return next(new Error("Authentication required"));
            }

            const cookies = cookie.parse(cookieHeader);
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error("Access token missing"));
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: {
                    id: true,
                    role: true,
                },
            });

            if (!user) {
                return next(new Error("Unauthorized"));
            }

            socket.data.userId = String(user.id);
            socket.data.role = user.role;

            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        socket.join(`user:${userId}`);

        console.log(`Socket connected for user: ${userId}`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected for user: ${userId}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
}

function emitApplicationStatusUpdated(candidateId, application) {
    getIO()
        .to(`user:${candidateId}`)
        .emit("application:status-updated", application);
}

module.exports = {
    initSocket,
    getIO,
    emitApplicationStatusUpdated,
};
