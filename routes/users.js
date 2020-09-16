const express = require('express');
const router=express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')

const { check, validationResult } = require('express-validator');


//Bringing user models 
let User = require('../models/user');
const { Passport } = require('passport');


//Register form:
router.get('/register', function(req,res){
    res.render('register');
})


//Register process
router.post('/register',
 [
    check('name').isLength({min:1}).trim().withMessage('Title required'),
    check('email').isEmail().withMessage('Not a valid Email'),
    check('email').isLength({min:1}).trim().withMessage('Email required'),
    check('username').isLength({min:1}).trim().withMessage('Username required'),
    check('password').isLength({min:1}).trim().withMessage('Password is required'),
    check('password2').isLength({min:1}).trim().withMessage('Password is required'),
   
    check('password2').custom( (password,{req})=>{
        const pass=req.body.password
        if(pass!==password)
            throw new Error('Passwords must be same');
            else
            return true;
    })
 ],
  (req,res,next)=>{

    let newUser = new User({
        name:req.body.name,
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        password2:req.body.password2,
    });


    
 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  console.log(errors);
    res.render('register',
      { 
       errors: errors.mapped()
      });
  
   }
   else{
       bcrypt.genSalt(10,function(err,salt){
           bcrypt.hash(newUser.password,salt,function(err,hash){
               if(err)
               {
                   console.log(err);
               }
               else{
                   newUser.password=hash;
                   newUser.save(function(errr){
                       if(err){
                           console.log(err);
                           return;
                       }
                       else{
                           req.flash('success','you are now registered');
                           res.redirect('/users/login');
                       }
                   })
               }
           });
       })


   }
  
    
 

});
//Login form
router.get('/login',function(req,res){
    res.render('login');
})


router.post('/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});


//logout
router.get('/logout',function(req,res){
    req.logout();
    req.flash('success','You are logged out');
    res.redirect('/users/login');

})

module.exports = router;