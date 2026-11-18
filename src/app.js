
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./queues/resume.worker");
const elasticClient = require("./config/elasticsearch");

const app = express();



app.use(
    require("helmet")({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "https://checkout.razorpay.com",
                ],
                scriptSrcElem: [
                    "'self'",
                    "https://checkout.razorpay.com",
                ],
                connectSrc: [
                    "'self'",
                    "https://api.razorpay.com",
                    "https://checkout.razorpay.com",
                ],
                frameSrc: [
                    "'self'",
                    "https://api.razorpay.com",
                    "https://checkout.razorpay.com",
                ],
                imgSrc: ["'self'", "data:", "https:"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                formAction: ["'self'", "https:"],
            },
        },
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);


elasticClient.info()
    .then((info) => {
        console.log("Elasticsearch connected:", info.version.number);
    })
    .catch((error) => {
        console.error("Elasticsearch connection failed:", error.message);
    });

// 1. Security headers
// app.use(
//     require("helmet")({
//         crossOriginResourcePolicy: {
//             policy: "cross-origin",
//         },
//     })
// );

// CORS Configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL?.trim().replace(/\/$/, ""),
].filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("CORS blocked:", origin);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    require("./razorpay/payment.webhook.routes")
);

// Body parser
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "../public")));

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
app.use("/api/auth", require("./routes/csrf.routes"));
app.use("/api/resumes", require("./resume/resume.routes"));
app.use("/api/skill-gap", require("./skill-gap/skillGap.routes"));
app.use("/api/career-guidance", require("./career-guidance/careerGuidance.routes"));
app.use("/api/plans", require("./plan/plan.routes"));
app.use("/api/subscriptions", require("./subscription/subscription.routes"));
app.use("/api/usage", require("./usage/usage.routes"));
app.use("/api/interviews", require("./routes/interview.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/payments", require("./razorpay/payment.routes"));
// Error handler (must be last)
app.use(require("./middleware/errorHandler"));

module.exports = app;
