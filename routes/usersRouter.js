const express=require('express');
const { registerUser,loginUser,logout } = require('../controllers/authController');
const isLoggedin = require('../middlewares/isLoggedin');
const userModel = require('../models/user-model');
const productModel = require('../models/product-model');
const router=express.Router();
const upload = require('../config/multer-config');

router.get("/",(req,res)=> {
    res.send("hey");
});
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logout);

router.get("/shop", isLoggedin, async (req, res) => {
    const products = await productModel.find();
    const success = req.flash("success");

    const user = await userModel.findOne({ email: req.user.email }).populate("cart");

    const quantityMap = {};
    if (user.cart && user.cart.length) {
        user.cart.forEach(item => {
            const id = item._id.toString();
            quantityMap[id] = (quantityMap[id] || 0) + 1;
        });
    }

    res.render("shop", {
        products,
        success,
        quantityMap
    });
});


router.get("/cart", isLoggedin, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email }).populate("cart");

    const productMap = {};
    user.cart.forEach(product => {
        const key = product._id.toString();
        if (!productMap[key]) {
            productMap[key] = { ...product.toObject(), quantity: 1 };
        } else {
            productMap[key].quantity += 1;
        }
    });

    const platformFee = 20;

    const cartWithBill = Object.values(productMap).map(item => ({
        ...item,
        bill: item.quantity * (item.price + platformFee - item.discount)
    }));

    const subtotal = cartWithBill.reduce((sum, item) => sum + item.bill, 0);
    const shippingFee = subtotal < 1000 ? 35 : 0;
    const totalAmount = subtotal + shippingFee;

    res.render("cart", {
        user,
        cart: cartWithBill,
        subtotal,
        shippingFee,
        totalAmount
    });
});

router.get("/addtocart/:id",isLoggedin,async (req,res)=> {
    let user=await userModel.findOne({email:req.user.email})
    user.cart.push(req.params.id);
    await user.save();
    req.flash("success","Added to cart");
    res.redirect("/users/shop");
});

router.get("/add/:id", isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        user.cart.push(req.params.id);
        await user.save();
        res.redirect("/users/cart");
    } catch (err) {
        res.send("Error adding product to cart: " + err.message);
    }
});

router.get("/subtract/:id", isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const index = user.cart.indexOf(req.params.id);
        if (index > -1) {
            user.cart.splice(index, 1);
            await user.save();
        }
        res.redirect("/users/cart");
    } catch (err) {
        res.send("Error subtracting product from cart: " + err.message);
    }
});

router.get("/profile", isLoggedin, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email }).populate("cart");
    let success = req.flash("success");
    res.render("profile", { user, success });
});

router.post("/profile/update", isLoggedin, upload.single("picture"), async (req, res) => {
    const { fullname, email, contact } = req.body;
    const updates = {
        fullname,
        email,
        contact
    };

    if (req.file) {
        updates.picture = req.file.buffer;
    }

    await userModel.findByIdAndUpdate(req.user._id, updates);
    req.flash("success", "Profile updated successfully!");
    res.redirect("/users/profile");
});

router.get('/orders', isLoggedin, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  res.render('orders', { user });
});




module.exports=router;