const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
require("dotenv").config();

const app = express();

// خدمة ملفات Frontend (HTML/CSS/JS) من root
app.use(express.static(__dirname));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Discord
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, {id}));

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://syrax-arab-dis-shop.vercel.app/auth/discord/callback",
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Routes
app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/discord/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/");
});

// صفحة رئيسية
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// تشغيل السيرفر على PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
