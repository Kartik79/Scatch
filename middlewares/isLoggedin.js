const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

module.exports = async (req, res, next) => {
    if (!req.cookies.token_user) {
        req.flash("error", "You need to log in first");
        return res.redirect("/");
    }
    try {
        const decoded = jwt.verify(req.cookies.token_user, process.env.JWT_KEY);
        const user = await userModel.findOne({ email: decoded.email }).select("-password");

        if (!user) {
            req.flash("error", "User not found");
            res.clearCookie("token_user");
            return res.redirect("/");
        }

        req.user = user;
        req.userType = "user";
        next();
    } catch (err) {
        res.clearCookie("token_user");
        req.flash("error", "Something went wrong");
        return res.redirect("/");
    }
};
