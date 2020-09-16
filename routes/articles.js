const express = require('express');
const router=express.Router();

const { check, validationResult } = require('express-validator');

//User Model
let User = require('../models/user');
//Bringing Article models
let Article = require('../models/article');

//add Route
router.get('/add',ensureAunthenticated, function(req,res){
    res.render('add_article',{
        title:'Add Articles'
    });
});

//Add submit POST route
router.post('/add',
 [
  check('title').isLength({min:1}).trim().withMessage('Title required'),
  check('body').isLength({min:1}).trim().withMessage('Body required')
 ],
  (req,res,next)=>{

  let article = new Article();

 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  console.log(errors);
     res.render('add_article',
      { 
       article:article,
       errors: errors.mapped()
      });
   }
   else{
  article.title = req.body.title;
  article.body = req.body.body;
  article.author=req.user._id;

  article.save(err=>{
   if(err)throw err;
   req.flash('success','Article Added');
   res.redirect('/');
  });
 }
});



//Load edit form 
router.get('/edit/:id', ensureAunthenticated, function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(article.author !=req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }
        else
        res.render('edit_article',{
            title:'Edit Article',
            article:article
        });
    });
})



//Update Submit
router.post('/edit/:id', function(req,res){
    
    let article={};

     article.title =req.body.title;
     article.author =req.body.author;
     article.body=req.body.body;

     let query = {_id:req.params.id}

     Article.update(query, article, function(err){
        if(err)
        {
            console.log(err);return;
        }
        else
        {
            req.flash('success','Article updated');
            res.redirect('/');
        }

     })
     
});

//Delete Article
router.delete('/:id',function(req,res){

    if(!req.user.id){
        res.status(500).send();
    }

    else   
    {
        let query ={_id: req.params.id};
        Article.findById(req.params.id,function(err,article){
            if(article.author!=req.user._id){
             res.status(500).send();
            }
            else{
                Article.remove(query,function(err){
                    if(err){
                        console.log(err);
                    }
                    res.send('Success');
                })
            }
        })
        
    }
})

//get single article
router.get('/:id',function(req,res){

    Article.findById(req.params.id,function(err,article){
        
        User.findById(article.author,function(err,user){
            res.render('article',{
                article:article,
                author:user.name
            });
        });
    });
});



//Access Control
function ensureAunthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
        
    }
    else{
            req.flash('danger','Please login');
            res.redirect('/users/login')
        }
    

}

module.exports =router;
