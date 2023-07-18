var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require("passport-local");
var userModel = require("./users");
var productModel = require("./products");
var orderModel = require("./order");
require("dotenv").config();
var nodemailer = require('nodemailer');
var { google } = require('googleapis');
var mailer = require("../routes/nodemailer");
const multer  = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const cors = require('cors');
const flash = require('connect-flash');
var crypto = require("crypto");
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var firebase = require("firebase");
const session = require('express-session');
const cookieParser = require('cookie-parser');
var serviceAccount = require("../serviceAccountKey.json");
router.use(cors());
// router.use(bodyparser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use(flash());

//cart items
var cartItems = [];

//-----------------------------------------------------------------------------------
//firebase GoogleAuth



//--------------------------------------------------------------------------------------------

//PAYMENT GATEWAY
const Razorpay = require("razorpay");


var instance = new Razorpay({
  key_id: 'rzp_test_PCIwXguS5ffBCG',
  key_secret: 'NbuBBPdNMiBejAITkjNeVHds',
});



 
var vendorId = [];

router.use("/payment", async (req, res, next) => {

  // let {amount} = req.body;
try{
  
  var instance = new Razorpay({ key_id: 'rzp_test_PCIwXguS5ffBCG', key_secret: 'NbuBBPdNMiBejAITkjNeVHds' })
 
  var order = await instance.orders.create({
    amount: req.body.amount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  });



res.status(201).json({
  success: true,
  order,
});




}catch(err){
  next(err);
}

});



  router.get("/check", isLoggedIn, async (req, res, next) => {
    try{
     const user = await userModel.findOne({email: req.session.passport.user});
     cartItems.forEach(async item => {
       const userItem = new orderModel({
         pname: item.pname,
         pdesc: item.pdesc,
         price: item.price,
         pimage: item.pimage,
         ptype: item.ptype,
         userid: user._id,
         vendor: item.userid
       });
       await userItem.save()
       vendorId = await item.userid;
      //  await vendorId.save()
       console.log("Data Saved In DataBase");
     });

     res.redirect("/home");
   
    }catch(err){
     console.log("there is some error from the server side.");
    }
   
   })
    




router.get("/vendorView/:vendorid", isLoggedIn, async (req, res, next) => {
  let user = await  userModel.findOne({email: req.session.passport.user});
  var productId =  await orderModel.find({vendor: req.params.vendorid});
 
  res.render("order", {productId, user, count}) 
})

router.get("/user-information/:userid", isLoggedIn, async (req, res, next) => {
  let user = await  userModel.findOne({email: req.session.passport.user});
  var userDets = await userModel.findById({_id: req.params.userid});
  
  res.render("customerInfo", {userDets, user, count})
})


router.get("/your-order/:uid", isLoggedIn, async (req, res, next) => {
 try{
  let user = await  userModel.findOne({email: req.session.passport.user});
  let yourOrder = await orderModel.findById({userid: req.params.uid});
 res.render("your-order", {user, yourOrder})
 }
 catch(error){
  res.send("We are having problem in showing details of this page, We'll be making it fix soon");
 }
})


router.post('/pay-verify', async (req,res, next) => {

   var expectedSignature = crypto.createHmac('sha256', 'NbuBBPdNMiBejAITkjNeVHds')
                                   .update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id)
                                   .digest('hex');
                                   console.log("sig"+req.body.razorpay_signature);
                                   console.log("sig"+expectedSignature);
  
   if(expectedSignature === req.body.razorpay_signature){
     console.log("Payment Success");
     //sending product details to its owner
   }else{
     console.log("Payment Fail");
     res.redirect("/home");
   }
  
})




/* LOCAL PASSPORT STRATEGY */
passport.use(
  new localStrategy(
    {
      usernameField: "email",
    },
    userModel.authenticate()
  )
);

//REGISTER USER -->
router.post("/register", function (req, res, next) {
  var usersRouter = new userModel({
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    address: req.body.address,
    postal: req.body.postal,
  });
  userModel.register(usersRouter, req.body.password).then(function (dets) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/home");
    });
  });
});


/* LOGIN ROUTE */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res, next) {
    req.flash("error", "Invalid Email or Password");
    res.redirect("/");
  }
);



/* LOGOUT ROUTE */
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});



/* MIDDLEWARE */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}


/* GET REGISTER PAGE */
router.get('/', function(req, res, next) {
  res.render("register", {error: req.flash('error')});
});

//cart count
var count = 0;


/* GET HOME PAGE */
router.get("/home", isLoggedIn, async function(req, res, next){
let user = await userModel.findOne({email:req.session.passport.user});
let userName = user.name;
let charCount = 7;
let usernameLimit = userName.slice(0, charCount);

//about product --->
let productTypeOne = await productModel.find({ptype:1});
let productTypeTwo = await productModel.find({ptype:2});
let productTypeThree = await productModel.find({ptype:3});

res.render("home", {count, usernameLimit, productTypeOne, productTypeTwo, productTypeThree, user});
})


/* Nodemailer Route */
router.get('/sendmail', async function(req, res, next){
  try{
    let user = await userModel.findOne({ email: req.session.passport.user });
    if(user.verified === false){
      const userEmail = user.email;
      const userID = user._id;

      await mailer(userEmail, userID);
      res.send("Mail Sent to Your Email")
    }else{
      res.send("You Already Verified!")
    }

  }catch(error){
    console.log(error);
  }

 })




 const verifyMail  = async function(req, res, next){
  try{
  const updateVerified = await user.updateOne({_id: req.query.id},{$set:{verified: true}});
  console.log(updateVerified);
 res.send("Your email is now verified!");


  }catch(error){
   console.log(error);
  }
  }

  /* VERIFY LINK PROCESS ---> */
  router.get('/verify/:id', async function(req, res, next){
    const { id } = req.params;
    const user = await userModel.findOne({_id:id});
   if(user.verified){
    res.send("Your email is already verified!");
   }else{

      user.verified = true;
      await user.save();
      res.send("user is now verified");

   }
  })



  /*CLICK ON SELL BUTTON, CREATE PRODUCT PAGE ---> */
  router.get('/create', async function(req, res, next){
   try{
    let user = await userModel.findOne({email: req.session.passport.user});

    if(user.verified){
      res.render("productForm", {count, user})
    }
    else{
      res.send("You need to verify your account first")
    }
   }
   catch(err){
    res.send("There is some Error, Please try back later")
   }

  })

  // /*CREATE PRODUCT FORM */
  // router.get('/product-info',isLoggedIn, async function(req, res, next){
  // try{
  //   let user = await userModel.findOne({email: req.session.passport.user});
  //   res.render("productForm", {user})
  // }
  // catch(err){
  //   console.log(err);
  //   res.status(500).send('Internal Server Error');
  // }
  // })


  /*CREATE PRODUCT ROUTE ---> */

  router.post("/create/product",isLoggedIn, async function(req, res, next){

    const user = await userModel.findOne({email: req.session.passport.user}).populate();

    const product = new productModel({
      pname:  req.body.pname,
      pdesc:  req.body.pdesc,
      price:  req.body.price,
      pimage: req.body.pimage,
      ptype:  req.body.ptype,
      userid: user._id
    });

    await productModel.findById(product._id).populate("userid");
    await product.save();
    res.redirect('/home');

  })

  // router.get('/allproducts', isLoggedIn, async function(req, res, next){
  //   let user = await userModel.findOne({email: req.session.passport.user});
  //   let productTypeOne = await productModel.find({ptype:1});
  //   let productTypeTwo = await productModel.find({ptype:2});
  //   let productTypeThree = await productModel.find({ptype:3});

  //   res.render("home", {productTypeOne, productTypeTwo, productTypeThree});
  // })



  router.get('/your-products/:id', isLoggedIn, async function(req,res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    let AllProducts = await productModel.find({userid: req.params.id});

    res.render("allProducts", {user, AllProducts, count});
  })

  router.get('/delete/:productId',isLoggedIn,  async function(req, res, next){
    try{

      let product = await productModel.findOneAndDelete({_id:req.params.productId});
      res.redirect('/home')

    }
    catch(err){
      res.send(err);
    }
  })


  router.get('/edit-product/:id', isLoggedIn, async function(req, res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    let product = await productModel.findById({_id: req.params.id});
    res.render("editProduct", {user, product, count});
  })


  router.post("/edit/:prdid", isLoggedIn, async function(req, res, next){
    try {
      let updatedProduct = await productModel.findOneAndUpdate(
        { _id: req.params.prdid }, // Filter based on the product ID
        {
            pname: req.body.pname,
            pdesc: req.body.pdesc,
            price: req.body.price,
            pimage: req.body.pimage,
            ptype: req.body.ptype
        },
        { new: true }
      );
      res.redirect("/home");
    } catch(err) {
      res.send("There might be some error, check back later");
    }
  });


  router.get("/product/:productID", isLoggedIn, async function(req, res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    let product = await productModel.findById({_id: req.params.productID});
    res.render("productBuy", {user, product, count});
  })



    
  router.get("/addtocart/:productID", isLoggedIn, async function(req, res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    let newItems = await productModel.findById({_id: req.params.productID});
    cartItems.push(newItems);

    count++;

     res.render("cart", {count, cartItems, user});
   })

   router.get("/remove/:productID", isLoggedIn, async function(req, res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    let newItems = await productModel.findById({_id: req.params.productID});
    cartItems.pop(newItems);

    count--;
    res.redirect("/cart");
   })

  router.get("/cart", isLoggedIn, async function(req, res, next){
    let user = await userModel.findOne({email: req.session.passport.user});
    res.render("cart", {user, count, cartItems})
  })


module.exports = router;

