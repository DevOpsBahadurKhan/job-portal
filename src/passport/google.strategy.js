const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const strategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google Profile:", profile);

            // Yahan Prisma se user find/create karenge

            return done(null, profile);

        } catch (error) {
            return done(error, false);
        }
    }
);

passport.use("google", strategy);

module.exports = strategy;