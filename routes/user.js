const express = require('express');
const User = require('../model/User');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
const Category = require('../model/Category')



/* GET users listing. */
router.get('/adm/register', async (req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  res.render('register', { title: `Ro'yhatdan o'tish`, headercourse });
});


router.post('/adm/register', function (req, res, next) {
    req.checkBody('name', 'Ism kiritilmadi').notEmpty()
    req.checkBody('username', 'Username kiritilmadi').notEmpty()
    req.checkBody('email', 'email manzil kiritilmadi').notEmpty()
    req.checkBody('password', 'Parol kiritilmadi').notEmpty()
    req.checkBody('password_verify', 'Parol qayta kiritilmadi').equals(req.body.password)

    const errors = req.validationErrors()

    if (errors) {
        res.render('register', {
            title: "Ro'yhatdan o'tishda hato",
            errors: errors
        })
    } else {

        const name = req.body.name
        const username = req.body.username
        const email = req.body.email
        const password = req.body.password
        const password_verify = req.body.password_verify


        const user = new User({
            name: name,
            username: username,
            email: email,
            password: password,

        })



        bcrypt.genSalt(10, (err, pass) => {
            bcrypt.hash(user.password, pass, (err, hash) => {
                if (err) console.log(err);
                user.password = hash;
                user.save((err) => {
                    if (err) console.log(err);
                    else {
                        req.flash('alert alert-success', `Ro'yhatdan otdingiz`)
                        res.redirect('/adm/login')
                    }
                })
            })
        })
    }
});


/* GET users listing. */
router.get('/adm/login', async (req, res, next) => {
  const headercourse = await Category.aggregate([
    {
      $lookup : {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'course'
      }
    }
  ])
  res.render('login', { title: `Kirish`, headercourse });
});
/* Post users listing. */
router.post('/adm/login', (req, res, next) => {
    passport.authenticate('local',  {
        successRedirect: '/',
        failureRedirect: '/adm/login',
        failureFlash: true
    })(req,res,next);
})


router.get('/logout', (req, res, next) => {
    req.logout()
    req.flash('alert alert-success', 'Tizimdan chiqdingiz')
    res.redirect('/adm/login')
})






module.exports = router