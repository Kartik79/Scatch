const express=require('express');
const router=express.Router();
const ownerModel=require('../models/owner-model');
const isOwnerLoggedin = require('../middlewares/isOwnerLoggedin');
const { registerOwner, loginOwner, logout } = require('../controllers/ownerAuthController');
const productModel = require('../models/product-model');

// if(process.env.NODE_ENV==="development") {
//     router.post("/create",async (req,res)=> {
//         let owners=await ownerModel.find();
//         if(owners.length>0) return res.status(503).send("You don't have permission to create new owner.");
//         let {fullname,email,password}=req.body;
//         let createdOwner=await ownerModel.create({
//             fullname,
//             email,
//             password,
//         })
//         res.status(201).send(createdOwner);
//     });
// }
router.post("/register",registerOwner);
router.post("/login",loginOwner);
router.get("/logout",logout);

router.get("/",(req,res)=> {
    res.render("owner-login");
});
router.get("/createproducts",isOwnerLoggedin,(req,res)=> {
    let success=req.flash("success");
    res.render("createproducts",{success});
});
router.get("/admin",isOwnerLoggedin,async (req,res)=> {
    let products=await productModel.find();
    res.render("admin",{products});
});


module.exports=router;