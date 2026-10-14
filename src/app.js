
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./queues/resume.worker");

const app = express();

// 1. Security headers
app.use(
    require("helmet")({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

// CORS Configuration
const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL?.trim().replace(/\/$/, ""),
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("CORS blocked:", origin);
        return callback(null, false);
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-CSRF-Token",
    ],
};

// Apply CORS to all routes
app.use(cors(corsOptions));
// Handle CORS preflight requests
app.options(/.*/, cors(corsOptions));

// Body parser
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(
    express.static(path.join(__dirname, "../public"))
);

// Initialize Passport
app.use(require("./passport").initialize());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/companies", require("./routes/company.routes"));
app.use("/api/application", require("./routes/application.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/auth", require("./routes/google.route"));
app.use("/api/ai", require("./routes/ai.routes"));
// app.use("/api/subscriptions", require("./routes/subscription.routes")); pushSubscription
app.use("/api/auth", require("./routes/csrf.routes"));
app.use("/api/resumes", require("./resume/resume.routes"));
app.use("/api/skill-gap", require("./skill-gap/skillGap.routes"));
app.use("/api/career-guidance", require("./career-guidance/careerGuidance.routes"));
app.use("/api/plans", require("./plan/plan.routes"));
app.use("/api/subscriptions", require("./subscription/subscription.routes"));
app.use("/api/usage", require("./usage/usage.routes"));
app.use("/api/interviews", require("./routes/interview.routes"));
app.use("/api/search", require("./routes/search.routes"));

// Error handler (must be last)
app.use(require("./middleware/errorHandler"));

module.exports = app;