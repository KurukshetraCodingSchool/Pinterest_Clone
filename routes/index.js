var express = require('express');
const User = require('../models/user')
const Post = require('../models/post');
const passport = require("passport");
const upload = require('../utils/multer');
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


router.post('/createpost', isLoggedIn, upload.single("postImage"), async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      postImage: req.file ? req.file.filename : null,  // multer se aayi file ka naam
      description: req.body.description,
      user: req.user._id
    });
    console.log('✅ Post created', post);

    req.flash("success_msg", "✅ Post Created Successfully!");
    res.redirect('/feed');
  } catch (err) {
    console.error(err);
    res.send("Failed to create post: " + err.message);
  }
});

router.get('/feed', isLoggedIn, async (req, res) => {
  const posts = await Post.find().populate('user').sort({ createdAt: -1 });
  res.render('feed', { posts});
});
router.post('/delete/:id',async (req,res,next)=>{
  try {
    const posts = await Post.findByIdAndDelete(req.params.id);
req.flash('success_msg', '❌Deleted successfully!');
    res.redirect('/feed')
  } catch (error) {
    console.error("❌ Deleting Error",error);
    res.status(500).send('❌ Error The Delteing Books')
  }
})

router.get('/updatePost/:id', async(req, res, next) => {
  try {
    const posts = await Post.findById(req.params.id);
    res.render('updatePost',{post:posts});
  } catch (error) {
    console.log(error);
    res.send(error)
  }
})
// UPDATE Post
router.post('/update/:id', isLoggedIn, upload.single("postImage"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash("error_msg", "❌ Post not found!");
      return res.redirect("/feed");
    }

    // Update fields
    post.title = req.body.title;
    post.description = req.body.description;

    // Agar user ne nayi image upload ki hai
    if (req.file) {
      post.postImage = req.file.filename;
    }

    await post.save();

    req.flash("success_msg", "✅ Post Updated Successfully!");
    res.redirect("/feed");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "❌ Failed to update post!");
    res.redirect("/feed");
  }
});

// DELETE Post
router.get("/deletepost/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/posts");
  } catch (err) {
    res.status(500).send("Error deleting post: " + err.message);
  }
});

// AUTHENTICATED ROUTE MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login"); 
}

module.exports = router;
