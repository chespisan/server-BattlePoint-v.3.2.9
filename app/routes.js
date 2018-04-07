'use strict';

const AuthenticationController = require('./controllers/authentication'), 
      express = require('express'),
      passportService = require('../config/passport'),
      passport = require('passport');
 
const requireAuth =  passport.authenticate('jwt', {session: false}),
      requireLogin = passport.authenticate('local', {session: false});
 
module.exports = function(app){
 
    const apiRoutes = express.Router(),
          authRoutes = express.Router()
         
 
    // Auth Routes
    apiRoutes.use('/auth', authRoutes);
 
    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);
 
    authRoutes.get('/protected', requireAuth, function(req, res){
        res.send({ content: 'Success'});
    });
 
 
    // Set up routes
    app.use('/api', apiRoutes);
 
}