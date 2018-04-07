'use strict';

// passport, nos dara las estrategias para configurar las autenticaciones
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy;

// requerimos  el User de Schema
const User = require('../app/models/user');


// requerimos el config de auth
const config = require('../config/auth');

const localOptions = {
    usernameField: 'email'
};

// creamos la estrategia para login local
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
    // llamamos el metodo de mongo para buscar un bbjeto del usuario
    User.findOne({
        email: email
    },(err, user)=>{
        // si existe un error
        if(err){
            return done(err);
        }
        // si el usuario no existe
        if(!user){
            return done(null, false, {error: 'Login fallido, intente de nuevo!'});
        }
        // añadimos la funcion para comparar el pass del usuario con el que viene del modelo User
        user.comparePassword(password,(err, isMatch)=>{
            // si nos da error
            if(err){
                return done(err)
            }
            // si es diferente al password
            if(!isMatch){
                return done(null, false, {error: 'La contraseña es incorrecta'});
            }

            // despues de pasar por los filtros, que nos retorne el usuario
            return done(null, user);
        });
        
    });

});

// configuracion jsonwebtoken
const jwtOptions = {
    jwtFromRequest:ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.secret
};
 

// añadimos jwt al al login
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done)=>{
    // buscamos un usuario por su id y si coincide no lo devuelva
    User.findById(payload._id, (err, user)=>{
        // si da error
        if(err){
            return done(err, false);
        }
        // si existe el user
        if(user){
            done(null, user);
        }
        // si no
        else {
            done(null, false);
        }
    });
});

// establecemos las estrategias
passport.use(localLogin);
passport.use(jwtLogin);