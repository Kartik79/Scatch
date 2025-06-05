const express=require('express');
const userModel = require('../models/user-model');
const isLoggedin = require('../middlewares/isLoggedin');
const productModel = require('../models/product-model');
const router=express.Router();

router.get("/",(req,res)=> {
    let error=req.flash("error");
    res.render("index",{error});
});
router.get("/owners",(req,res)=> {
    let error=req.flash("error");
    res.render("owner-login",{error});
});


module.exports=router;