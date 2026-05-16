const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Student = require('../models/Student');
const Educator = require('../models/Educator');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Check if user exists in any collection
          let user = await Student.findOne({ email });
          let role = 'student';

          if (!user) {
            user = await Educator.findOne({ email });
            role = 'educator';
          }

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.avatar = user.avatar || profile.photos[0]?.value;
              await user.save();
            }
            return done(null, { ...user.toObject(), role });
          }

          // Create new student by default for Google OAuth
          const newUser = await Student.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            avatar: profile.photos[0]?.value,
            password: 'google-oauth-no-password'
          });

          return done(null, { ...newUser.toObject(), role: 'student' });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
