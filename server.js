require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// Middleware setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup
app.use(
    session({
        secret: process.env.SECRET || "defaultSecret", // Fallback for development
        resave: false,
        saveUninitialized: false,
    })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to the database successfully"))
    .catch((error) => console.error("Cannot connect to the database:", error));

// Schema and model setup
const userSchema = new mongoose.Schema({
    fullname: String,
    username: String,
    email: { type: String, unique: true, required: true },
    dob: String,
    phone: Number,
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

// Passport configuration
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get("/", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { fullname, username, email, dob, phone, password } = req.body;

    User.findOne({ $or: [{ email }, { username }] })
        .then((existingUser) => {
            if (existingUser) {
                console.log("User already exists.");
                return res.redirect("/register");
            }

            User.register(new User({ fullname, username, email, dob, phone }), password)
                .then(() => {
                    passport.authenticate("local")(req, res, () => {
                        console.log("New user added and logged in.");
                        res.render("/user", { user: existingUser });
                    });
                })
                .catch((error) => {
                    console.error("Error during registration:", error);
                    res.redirect("/register");
                });
        })
        .catch((error) => {
            console.error("Error checking for existing user:", error);
            res.redirect("/register");
        });
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Error during authentication:", err);
            return next(err);
        }
        if (!user) {
            console.log("Invalid email or password.");
            return res.redirect("/login");
        }
        req.login(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return next(err);
            }
            console.log("Login successful.");
            return res.render("user", { user: user });
        });
    })(req, res, next);
});

app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("user");
    } else {
        res.redirect("login");
    }
});

//logout user
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
