const express =require('express');
const path=require('path');
const mongoose =require('mongoose');
const bodyParser =require('body-parser');
const expressValidator =require('express-validator');
const flash=require('connect-flash');
const session=require('express-session')
const { check, validationResult } = require('express-validator');
const config = require('./config/database');
const passport =require('passport');


mongoose.connect(config.database,{ useNewUrlParser: true, useUnifiedTopology: true });
let db =mongoose.connection;

//check connection
db.once('open',function(){
    console.log('Connected to MongoDB');
})

//check for db error
db.on('error',function(err){
    console.log(err);
})


//init app
const app =express();


//Bringing models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname,'views') );
app.set('view engine','pug');



//BODY PARSER MIDDLE LAYER
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//set public folder as static
app.use(express.static(path.join(__dirname,'public')));

//EXpress Session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))

//EXpress Messages Middle layer
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport Config

require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());



app.get('*',function(req,res,next){

    res.locals.user =req.user || null;
    next();
})

//home route
app.get('/',function(req,res){

    Article.find({},function(err,articles){
        if(err){
            console.log(err);

        }
        else {
        res.render('index',{
            title:'Articles',
            articles: articles
        });
        }
    })
   

});

//route files
 let articles=require('./routes/articles');
 let users=require('./routes/users');

 app.use('/articles',articles);
 app.use('/users',users);




//Start server
app.listen(3000, function(){
    console.log('server started on port 3000');
});