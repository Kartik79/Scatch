const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports = async (req, res, next) => {
    const token=req.cookies.token_owner;
    if (!token) {
        req.flash("error", "You need to log in as owner");
        return res.redirect("/owners");
    }
    try {
        const decoded = jwt.verify(req.cookies.token_owner, process.env.JWT_KEY);
        const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");

        if (!owner) {
            req.flash("error", "Owner not found");
            res.clearCookie("token_owner");
            return res.redirect("/owners");
        }
        console.log(owner);
        req.owner = owner;
        req.userType = "owner";
        next();
    } catch (err) {
        res.clearCookie("token_owner");
        req.flash("error", "Something went wrong");
        return res.redirect("/owners");
    }
};
