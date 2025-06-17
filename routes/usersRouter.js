const express=require('express');
const { registerUser,loginUser,logout } = require('../controllers/authController');
const isLoggedin = require('../middlewares/isLoggedin');
const userModel = require('../models/user-model');
const productModel = require('../models/product-model');
const router=express.Router();
const upload = require('../config/multer-config');
const { default: mongoose } = require('mongoose');

router.get("/",(req,res)=> {
    res.send("hey");
});
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logout);

router.get("/shop", isLoggedin, async (req, res) => {
    const products = await productModel.find();
    const success = req.flash("success");

    const user = await userModel.findOne({ email: req.user.email }).populate("cart.product");

    const quantityMap = {};
    if (user.cart && user.cart.length) {
        user.cart.forEach(item => {
            const id = item.product._id.toString();
            quantityMap[id] = (quantityMap[id] || 0) + item.quantity;
        });
    }

    res.render("shop", {
        products,
        success,
        quantityMap
    });
});



router.get("/cart", isLoggedin, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  
  const cartWithBill = user.cart.map(item => {
    const product = item.product;

    // In case product was deleted from DB but still exists in cart
    if (!product) return null;

    const quantity = item.quantity || 1;
    const bill = quantity * (product.price + 20 - product.discount);

    return {
      ...product.toObject(),
      quantity,
      bill
    };
  }).filter(item => item !== null); // Remove nulls

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



router.get("/addtocart/:id", isLoggedin, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  const existingItem = user.cart.find(item => item.product.toString() === req.params.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cart.push({
      product: req.params.id,
      quantity: 1
    });
  }

  await user.save();
  req.flash("success", "Added to cart");
  res.redirect("/users/shop");
});


router.get("/add/:id", isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });

    const existingItem = user.cart.find(item => item.product.toString() === req.params.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: req.params.id, quantity: 1 });
    }

    await user.save();
    req.flash("success", "Product added to cart");
    res.redirect("/users/cart");

  } catch (err) {
    res.send("Error adding product to cart: " + err.message);
  }
});


router.get("/subtract/:id", isLoggedin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });

    const cartItem = user.cart.find(item => item.product.toString() === req.params.id);

    if (cartItem) {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        user.cart = user.cart.filter(item => item.product.toString() !== req.params.id);
      }

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

router.post("/placeorder", isLoggedin, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");

  const orderItems = user.cart.map(item => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    discount: item.product.discount,
    total: item.quantity * (item.product.price - item.product.discount)
  }));

  const totalAmount = orderItems.reduce((acc, item) => acc + item.total, 0);

  user.orders.push({
    items: orderItems,
    totalAmount: totalAmount,
    status: 'Pending',       
    createdAt: new Date()    
  });

  user.cart = [];

  await user.save();

  req.flash("success", "Order placed successfully!");
  res.redirect("/users/orders");
});






module.exports=router;