require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Attach Socket.IO to the same HTTP server.
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Socket.IO initialized");
});


// require("dotenv").config();

// const app = require("./src/app");

// const PORT = 5000;

// ==============================================================
// const { Queue, Worker } = require("bullmq");

// const connection = {
//     url: process.env.REDIS_URL,
// }

// const queue = new Queue("demo_analysis", {
//     connection: {
//         url: process.env.REDIS_URL,
//     }
// });

// const user_queue = new Queue("users_queue", {
//     connection: {
//         url: process.env.REDIS_URL,
//     }
// });

// async function main() {
//     let response = await fetch('https://dummyjson.com/products');
//     let products = await response.json();

//     let responseUsers = await fetch('https://dummyjson.com/users');
//     let users = await responseUsers.json();

//     await queue.add("demo_analysis", products);
//     await user_queue.add("users_queue", users);
//     await queue.close();
//     await user_queue.close();
// }

// main().catch(console.error);

// ==============================================================
// const worker = new Worker(
//     "demo_analysis",
//     async (job) => {
//         console.log("Job processing");
//         await new Promise((resolve, reject) => {
//             setTimeout(resolve, 5000);
//         })
//         console.log(await job.data);
//         console.log("Job processing completed!");
//         return { success: true };
//     },
//     {
//         connection
//     }
// );

// const user_Wroker = new Worker("users_queue",
//     async (users) => {
//         console.log("Users are processing...");
//         await new Promise((resolve, reject) => {
//             setTimeout(resolve, 5000);
//         })
//         console.log(await users.data);
//         console.log("Users processing completed");
//         return { success: true };
//     },
//     {
//         connection
//     }
// )

// worker.on("completed", (job, result) => {
//     console.log("Completed:", job.id, result);
// });

// worker.on("failed", (job, error) => {
//     console.error("Failed:", job?.id, error.message);
// });

// user_Wroker.on("completed", (users, result) => {
//     console.log("Completed:", users.id, result);
// });

// user_Wroker.on("failed", (users, error) => {
//     console.error("Failed:", users?.id, error.message);
// });
// ==============================================================


// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });