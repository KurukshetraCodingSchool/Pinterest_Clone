var express = require('express');
const User = require('../models/user')
const Post = require('../models/post');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

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
        req.flash('success_msg', '✅User Signup successfully!');
        res.redirect("/login");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
router.get('/login', async(req, res, next)=> {
  res.render('login');
});
router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      req.flash("error", err.message);
      return next(err);
    }
    if (!user) {
      req.flash("error", "❌ Invalid email or password");
      return res.redirect("/login");
    }

    req.logIn(user, function (err) {
      if (err) {
        req.flash("error", err.message);
        return next(err);
      }

      req.flash("success_msg", "✅ Logged in successfully!");
      return res.redirect("/profile");
    });
  })(req, res, next);
});

router.get('/forget',async(req,res,next)=>{
  res.render("forget");
})

router.post("/forget", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.redirect("/forget?error=User not found!");

        await user.setPassword(req.body.newpassword);
        await user.save();
        req.flash("success_msg", "✅ password Changed Successfully")
        res.redirect("/login?msg=Password reset successfully!");
    } catch (error) {
        res.redirect("/forget?error=" + encodeURIComponent(error.message));
    }
});


router.get('/Reset-password',async(req,res)=>{
  res.render("Reset");
})

router.post('/Reset-password',async(req,res)=>{
   try {
        await req.user.changePassword(
            req.body.oldpassword,
            req.body.newpassword
        );
        await req.user.save();
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
})

router.get("/logout", isLoggedIn, function (req, res, next) {
    req.logout(() => {
      req.flash("success_msg", "Logout Succesfully")
        res.redirect("/login");
    });
});

router.get('/profile',isLoggedIn, async(req, res, next)=> {
  res.render('profile',{user:req.user});
});
router.get('/createpost',isLoggedIn, async(req, res, next)=> {
  res.render('createpost');
});


router.post('/createpost', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
      user: req.user._id
    });
    console.log('pst created',post);
    
    res.redirect('/feed'); // or redirect to /posts or the new post page
  } catch (err) {
    console.error(err);
    res.send("Failed to create post: " + err.message);
  }
});
router.get('/feed', isLoggedIn, async (req, res) => {
  const posts = await Post.find().populate('user').sort({ createdAt: -1 });
  res.render('feed', { posts });
});
// AUTHENTICATED ROUTE MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login"); 
}

module.exports = router;
