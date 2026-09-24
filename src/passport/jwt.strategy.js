const passport = require("passport");
const passportJwt = require("passport-jwt");

const prisma = require("../prisma");

const { Strategy, ExtractJwt } = passportJwt;


// Cookie se JWT nikalne ke liye
const cookieExtractor = (req) => {
    return req.cookies?.accessToken || null;
};

const params = {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: cookieExtractor
};


const strategy = new Strategy(params, async (payload, done) => {

    try {

        const user = await prisma.user.findUnique({

            where: { id: payload.id },
            select: {
                id: true, name: true, email: true, role: true
            }

        });

        if (!user) {
            return done(null, false);
        }
        return done(null, user);

    } catch (error) {
        return done(error, false);
    }
}
);


passport.use("jwt", strategy);


module.exports = strategy;