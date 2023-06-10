const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require('./routes/index.routes');
const auth = require('./routes/auth.routes');
const profile = require('./routes/user.routes')
const users = require('./routes/user.routes');
const app = express();
mongoose.set('strictQuery', false);
const session =require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');

const port = process.env.PORT || 4000;

// using morgan
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// init session
app.use(
    session({
    secret:'mysecreet',
    resave:false,
    saveUninitialized:false,
    cookie:{
    // secure:true, if https
    maxAge:60000,
    httpOnly:true,
    }
}))
// for passport authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');
// protecting routes
app.use((req,res,next)=>{
res.locals.user=req.user;
next();
})

app.use(connectFlash());
app.use((req,res,next)=>{
res.locals.messages=req.flash()
next();
})

// routes
app.use('/',router);
app.use('/user', profile);
app.use('/auth',auth);


// creating http errors
app.use((req,res,next)=>{
    next(createHttpError.NotFound())
})

app.use((error,req,res,next)=>{
    error.status = error.status || 500
    res.status(error.status);
    res.render('error_40x',{error})
})
// error middlewares ends here

mongoose.connect(process.env.MONGO_URI) .then(()=>{
    console.log(' 💾　 connected ...')
    app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}`)
    })
}). catch(err => console.log(err.message));










