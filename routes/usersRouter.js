const express=require('express');
const { registerUser,loginUser,logout } = require('../controllers/authController');
const isLoggedin = require('../middlewares/isLoggedin');
const userModel = require('../models/user-model');
const productModel = require('../models/product-model');
const router=express.Router();

router.get("/",(req,res)=> {
    res.send("hey");
});
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logout);

router.get("/shop",isLoggedin,async (req,res)=> {
    let products=await productModel.find();
    let success=req.flash("success")
    res.render("shop",{products,success});
});
router.get("/cart",isLoggedin,async (req,res)=> {
    console.log(req.user);
    let user=await userModel.findOne({email:req.user.email}).populate("cart");
    const cartWithBill=user.cart.map(item => ({
        ...item.toObject(),
        bill: item.price+20-item.discount
    }));

    res.render("cart",{user,cart:cartWithBill});
});
router.get("/addtocart/:id",isLoggedin,async (req,res)=> {
    let user=await userModel.findOne({email:req.user.email})
    user.cart.push(req.params.id);
    await user.save();
    req.flash("success","Added to cart");
    res.redirect("/users/shop");
});


module.exports=router;