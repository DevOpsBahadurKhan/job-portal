const { Queue } = require("bullmq");

const connection = {
    url: process.env.REDIS_URL,
};

const resumeQueue = new Queue("resume-processing", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
    },
});

module.exports = resumeQueue;