require("dotenv").config();
const express = require("express");
const passport = require("./passport");

const app = express();

// Body parser
app.use(express.json());

// initialize passport
app.use(passport.initialize());

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/companies", require("./routes/company.routes"));
app.use("/api", require("./routes/application.routes")
);
// error handler
app.use(require("./middleware/errorHandler"));

module.exports = app;