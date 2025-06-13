const express=require('express');
const router=express.Router();
const ownerModel=require('../models/owner-model');
const isOwnerLoggedin = require('../middlewares/isOwnerLoggedin');
const { registerOwner, loginOwner, logout } = require('../controllers/ownerAuthController');
const productModel = require('../models/product-model');
const upload = require('../config/multer-config');

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
    try {
        const owner=await ownerModel.findById(req.owner._id).populate("products");
        
        res.render("admin",{products: owner.products});
    } catch (err) {
        res.send("Error fetching owner products: " + err.message);
    }
});
router.get("/deleteall", isOwnerLoggedin, async (req, res) => {
    try {
        const owner = req.owner;
        await productModel.deleteMany({ _id: { $in: owner.products } });
        owner.products = [];
        await owner.save();

        req.flash("success", "All your products have been deleted");
        res.redirect("/owners/admin");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete products");
        res.redirect("/owners/admin");
    }
});

router.post("/create",isOwnerLoggedin,upload.single("image"),async (req,res)=> {
    try {
        let {name,price,discount,quantity,bgcolor,panelcolor,textcolor}=req.body;
        
        let product=await productModel.create({
            image:req.file.buffer,
            name,
            price,
            discount,
            quantity,
            bgcolor,
            panelcolor,
            textcolor
        });
        let owner=req.owner;
        owner.products.push(product._id);
        await owner.save();
        req.flash("success","Product created successfully");
        res.redirect("/owners/admin");
    } catch(err) {
        res.send(err.message);
    }
});

router.get("/add/:id", isOwnerLoggedin, async (req, res) => {
    try {
        await productModel.findByIdAndUpdate(req.params.id, {
            $inc: { quantity: 1 }
        });
        res.redirect("/owners/admin");
    } catch (err) {
        res.send("Failed to add quantity: " + err.message);
    }
});

router.get("/subtract/:id", isOwnerLoggedin, async (req, res) => {
    try {
        let product = await productModel.findById(req.params.id);
        if (product.quantity > 0) {
            product.quantity -= 1;
            await product.save();
        }
        res.redirect("/owners/admin");
    } catch (err) {
        res.send("Failed to subtract quantity: " + err.message);
    }
});

module.exports=router;