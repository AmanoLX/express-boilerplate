const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Recipe = require('../models/Recipe.model');

/* GET home page */
router.get('/', (req, res, next) => res.render('index'));

/* GET signup page */
router.get('/signup', (req, res, next) => res.render('auth/signup'));

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword
      });
    })
    .then(userFromDB => {
      console.log('Newly created user is: ', userFromDB);
      req.session.currentUser = userFromDB;

      res.redirect('/recipes');
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('auth/signup', {
          errorMessage: 'Username and email need to be unique. Either username or email is already used.'
        });
      } else {
        next(error);
      }
    });
});



/* GET login page */
router.get('/login', (req, res, next) => res.render('auth/login'));


router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {

        req.session.currentUser = user;

        res.redirect('/recipes');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

<<<<<<< HEAD
=======
router.get('/user-profile', (req, res, next) => res.render('user/user-profile', { userInSession: req.session.currentUser }));

>>>>>>> 1d8bf77c4ca1e32dcd7ab0101c4baf6cdf220802
/* GET user profile page */
router.get('/users/profile', (req, res) => {
  console.log(req.session)
  const { currentUser } = req.session;

  User.findById(currentUser._id)
    .then(userToDisplay => {
      console.log('this' + userToDisplay)
      Recipe.find({ creator: userToDisplay._id })
        .then(recipesToDisplay => {
                console.log('recipesToDisplay' + recipesToDisplay)
          res.render('user/userProfile', { recipesToDisplay, userToDisplay, userInSession: req.session.currentUser } );
        })
      })
    .catch(err =>
      console.log(`Err while getting the specific user profile from the  DB: ${err}`)
    );
});

<<<<<<< HEAD
/* Delete a recipe*/

router.post('/users/profile/:id/delete', (req, res) => {
  const { id } = req.params;

  Recipe.findByIdAndDelete(id)
    .then(() => res.redirect('/users/profile'))
    .catch(error => console.log(`Error while deleting a recipe: ${error}`));
});

/* Edit a recipe*/

router.get('/recipes/:id/edit', (req, res) => {
  const { id } = req.params;
  Recipe.findById(id)
    .then(recipeToEdit => {
      res.render('recipe-edit', recipeToEdit);
    })
    .catch(error =>
      console.log(`Error while getting a single recipe for edit: ${error}`)
    );
});

// router.post('/books/:id/edit', (req, res) => {
//   const { id } = req.params;
//   const { title, description, author, rating } = req.body;
//
//   Book.findByIdAndUpdate(
//     id,
//     { title, description, author, rating },
//     { new: true }
//   )
//     .then(updatedBook => res.redirect(`/books/${updatedBook._id}`))
//     .catch(error =>
//       console.log(`Error while updating a single book: ${error}`)
//     );
// });
=======
// EDIT PROFILE
router.get('/users/:id/edit', (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then(userToEdit => {
      res.render('./users/edit', userToEdit);
    })
    .catch((err) => {
      console.log(`Error while editing a profile: ${err}`);
      next();
    });
});

router.post('/users/:id/edit', (req, res, next) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  User.findByIdAndUpdate(
    id,
    { username, email, password },
    { new: true }
  )
  .then(() => res.redirect('/users/user-profile'))
  .catch((err) => {
    console.log(`Error while editing a celebrity: ${err}`);
    next();
  });
});
>>>>>>> 1d8bf77c4ca1e32dcd7ab0101c4baf6cdf220802


// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


module.exports = router;
