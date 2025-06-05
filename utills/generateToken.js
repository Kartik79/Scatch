const jwt=require('jsonwebtoken');

const generateToken=(user,role="users")=> {
    return jwt.sign({email:user.email,id:user._id,role:role},process.env.JWT_KEY);
};

module.exports.generateToken=generateToken;