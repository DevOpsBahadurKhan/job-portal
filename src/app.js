const express = require("express");
const path = require('path');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app = express();



// CORS
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

// initialize passport
app.use(require("./passport").initialize());

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/companies", require("./routes/company.routes"));
app.use("/api", require("./routes/application.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));


// error handler
app.use(require("./middleware/errorHandler"));


module.exports = app;