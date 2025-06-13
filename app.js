const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const path=require('path');
const db=require("./config/mongoose-connection");
const ownersRouter=require("./routes/ownersRouter");
const usersRouter=require("./routes/usersRouter");
const productsRouter=require("./routes/productsRouter");
const indexRouter=require("./routes/index");
const expressSession=require('express-session');
const flash=require('connect-flash');
const isLoggedin = require('./middlewares/isLoggedin');
const isOwnerLoggedin = require('./middlewares/isOwnerLoggedin');
const jwt=require('jsonwebtoken');

require('dotenv').config();

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());
app.use(
    expressSession({
        resave:false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET
    })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.loggedin = false;
    res.locals.userType = null;

    if (req.cookies.token_user) {
        const decoded = jwt.verify(req.cookies.token_user, process.env.JWT_KEY);
        res.locals.loggedin = true;
        res.locals.userType = "user";
    } else if (req.cookies.token_owner) {
        const decoded = jwt.verify(req.cookies.token_owner, process.env.JWT_KEY);
        res.locals.loggedin = true;
        res.locals.userType = "owner";
    }

    next();
});

app.use("/", indexRouter);
app.use("/owners",ownersRouter);
app.use("/users",usersRouter);
app.use("/products",productsRouter);

app.listen(3000);