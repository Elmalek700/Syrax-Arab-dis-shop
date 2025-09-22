// server.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// بيانات المستخدم مؤقتة (يمكن استبدالها بقاعدة بيانات لاحقًا)
let users = [];

// Passport Discord Strategy
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    let user = users.find(u => u.id === profile.id);
    if (!user) {
      user = { id: profile.id, username: profile.username, avatar: profile.avatar };
      users.push(user);
    }
    return done(null, user);
  }
));

// Routes
app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    // بعد تسجيل الدخول، نرسل المستخدم إلى الصفحة الرئيسية
    res.redirect("/index.html");
  }
);

// Endpoint لتأكيد تسجيل الدخول
app.get("/api/user", (req, res) => {
  if (!req.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, username: req.user.username, avatar: req.user.avatar });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));