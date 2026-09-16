const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const strategy = new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback"
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("GitHub Profile:", profile);

            // Yahan Prisma se user find/create karenge

            return done(null, profile);

        } catch (error) {
            return done(error, false);
        }
    }
);

passport.use("github", strategy);

module.exports = strategy;