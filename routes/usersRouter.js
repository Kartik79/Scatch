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
// router.get("/cart",isLoggedin,async (req,res)=> {
//     let user=await userModel.findOne({email:req.user.email}).populate("cart");
//     // const cartWithBill=user.cart.map(item => ({
//     //     ...item.toObject(),
//     //     bill: item.price+20-item.discount
//     // }));

//     // res.render("cart",{user,cart:cartWithBill});
//     const cart = user.cart;

//     // Group by product content (name, price, discount etc.)
//     const groupedCart = [];

//     for (let product of cart) {
//         const existing = groupedCart.find(item =>
//             item.name === product.name &&
//             item.price === product.price &&
//             item.discount === product.discount &&
//             item.bgcolor === product.bgcolor &&
//             item.panelcolor === product.panelcolor &&
//             item.textcolor === product.textcolor
//         );

//         if (existing) {
//             existing.quantity += 1;
//         } else {
//             groupedCart.push({
//                 ...product.toObject(),
//                 quantity: 1
//             });
//         }
//     }

//     const cartWithBill = groupedCart.map(item => ({
//         ...item,
//         bill: item.quantity * (item.price + 20 - item.discount)
//     }));

//     res.render("cart", { user, cart: cartWithBill });
// });
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

    const cartWithBill = Object.values(productMap).map(item => ({
        ...item,
        bill: item.quantity * (item.price + 20 - item.discount)
    }));

    res.render("cart", { user, cart: cartWithBill });
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

module.exports=router;