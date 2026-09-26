const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prisma");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                const googleId = profile.id;

                const emailVerified =
                    profile._json?.email_verified === true;

                if (!email || !emailVerified) {
                    return done(null, false, {
                        message: "Google email is not verified",
                    });
                }

                // 1. Find user by Google ID
                let user = await prisma.user.findUnique({
                    where: {
                        googleId,
                    },
                });

                // 2. If Google ID is not linked, check email
                if (!user) {
                    user = await prisma.user.findUnique({
                        where: {
                            email,
                        },
                    });

                    if (user) {
                        // Link Google account to existing user
                        if (user.googleId && user.googleId !== googleId) {
                            return done(null, false, {
                                message: "Account is linked to another Google account",
                            });
                        }

                        user = await prisma.user.update({
                            where: {
                                id: user.id,
                            },
                            data: {
                                googleId,
                            },
                        });
                    } else {
                        // 3. Create new Google user
                        user = await prisma.user.create({
                            data: {
                                name: profile.displayName,
                                email,
                                googleId,
                                password: null,
                                role: "CANDIDATE",
                            },
                        });
                    }
                }

                return done(null, user);

            } catch (error) {
                return done(error, null);
            }
        }
    )
);