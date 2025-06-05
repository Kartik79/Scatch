const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utills/generateToken');
const ownerModel = require('../models/owner-model');

module.exports.registerOwner = async (req, res) => {
    try {
        const { email, password, fullname, gstin } = req.body;

        let owner = await ownerModel.findOne({ email });
        if (owner) return res.status(401).send("You already have an account");

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.send(err.message);
                const newOwner = await ownerModel.create({
                    email,
                    password: hash,
                    fullname,
                    gstin
                });
                const ownerToken = generateToken(newOwner,"owner");
                res.cookie("token_owner", ownerToken, {
                httpOnly:true,
                path:'/owners'
                });
                res.redirect("/owners/admin");
            });
        });

    } catch (err) {
        res.send(err.message);
    }
};

module.exports.loginOwner = async (req, res) => {
    const { email, password } = req.body;

    const owner = await ownerModel.findOne({ email });
    if (!owner) return res.send("Email or Password incorrect");

    bcrypt.compare(password, owner.password, (err, result) => {
        if (result) {
            const ownerToken = generateToken(owner,"owner");
            res.cookie("token_owner", ownerToken, {
                httpOnly:true,
                path:'/owners'
            }); 
            res.redirect("/owners/admin");
        } else {
            res.send("Email or Password incorrect");
        }
    });
};

module.exports.logout = (req, res) => {
    res.clearCookie("token_owner",{path:"/owners"});
    res.redirect("/owners");
};
