var express = require('express');
const User = require('../models/user')
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));
var router = express.Router();

/* GET home page. */
router.get('/', async(req, res, next)=> {
  res.render('index');
});
router.get('/signup', async(req, res, next)=> {
  res.render('signup' );
});
router.post("/signup", async function (req, res, next) {
    try {
        await User.register(
            { username:req.body.username,
              email: req.body.email ,
              Dob:req.body.Dob
            },
            req.body.password
        );
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
router.get('/login', async(req, res, next)=> {
  res.render('login');
});
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    function (req, res, next) { }
);

router.get('/profile',isLoggedIn, async(req, res, next)=> {
  res.render('profile',{user:req.user});
});



// AUTHENTICATED ROUTE MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin");
    }
}
module.exports = router;
