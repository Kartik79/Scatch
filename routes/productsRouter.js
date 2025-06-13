const express=require('express');
const upload = require('../config/multer-config');
const productModel = require('../models/product-model');
const ownerModel = require('../models/owner-model');
const isOwnerLoggedin = require('../middlewares/isOwnerLoggedin');
const router=express.Router();


router.get("/",(req,res)=> {
    res.send('Under Maintenance');
});

module.exports=router;