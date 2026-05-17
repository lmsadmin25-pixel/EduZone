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
          const avatarUrl = profile.photos?.[0]?.value || '';

          // 1. Check Student collection first
          let user = await Student.findOne({ email });
          let role = 'student';

          if (user) {
            // Link Google ID if not already linked
            if (!user.googleId) {
              user.googleId = profile.id;
              if (!user.avatar) user.avatar = avatarUrl;
              await user.save();
            }
            return done(null, { ...user.toObject(), role: 'student' });
          }

          // 2. Check Educator collection
          user = await Educator.findOne({ email });
          if (user) {
            role = 'educator';
            if (!user.googleId) {
              user.googleId = profile.id;
              if (!user.avatar) user.avatar = avatarUrl;
              await user.save();
            }
            // Educator must be approved to login
            if (!user.isApproved) {
              return done(null, false, { message: 'Educator account pending approval' });
            }
            return done(null, { ...user.toObject(), role: 'educator' });
          }

          // 3. New user — create as Student by default
          const newUser = await Student.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatar: avatarUrl,
            password: 'google-oauth-no-password'
          });

          return done(null, { ...newUser.toObject(), role: 'student' });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Not needed for session:false / JWT strategy, but kept for compatibility
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
