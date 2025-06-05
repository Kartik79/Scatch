const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utills/generateToken');

module.exports.registerUser = async (req, res) => {
    try {
        let { email, password, fullname } = req.body;

        let user = await userModel.findOne({ email });
        if (user) return res.status(401).send("You already have an account");

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.send(err.message);
                let newUser = await userModel.create({
                    email,
                    password: hash,
                    fullname
                });
                let token = generateToken(newUser,"user");
                res.cookie("token_user", token, {
                httpOnly:true,
                path:'/'
                });
                res.redirect("/users/shop");
            });
        });
    } catch (err) {
        res.send(err.message);
    }
};

module.exports.loginUser = async (req, res) => {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) return res.send("Email or Password incorrect");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = generateToken(user,"user");
            res.cookie("token_user", token, {
                httpOnly:true,
                path:'/'
            });
            res.redirect("/users/shop");
        } else {
            res.send("Email or Password incorrect");
        }
    });
};

module.exports.logout = (req, res) => {
    res.clearCookie("token_user",{path:"/"});
    res.redirect("/");
};
