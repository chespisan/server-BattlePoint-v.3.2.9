'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

// creamops nuestro modelo de schema
const UserSchema = new mongoose.Schema({
    email: {type: String, lowercase: true, unique: true, required: true},
    password: {type: String, required: true },
    rol: {type: String, enum: ['reader','creator','editor'], default: 'reader'}
    },  
    {
        // esto sera para q nos muestre en json cuando y a q hroas etc fue creado el user
    timestamps: true
    }
);

//utilizamos el metodo pre de Schema para  encriptar la contraseña y despues guardarla
UserSchema.pre('save', (next)=>{
    const user = this;
    const SALT_FACTOR = 5 ;

    if(!user.isModified('password')){
        return next();
    }

    // añadimos   elmodulo de bcrypt para encriptar elpassword
    bcrypt.genSalt(SALT_FACTOR, (err, salt)=>{
        // si da error
        if(err){
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, (err, hash)=>{
            // si da error
            if(err){
                return next(err);
            }
            // si no
            user.password = hash;
            next();
        });
    });
});

// añadimos el metodo de comparePassword para comparar la versiosn hash de contraseña que hemos almacenado con la q intentar iniciar sesion
UserSchema.methods.comparePassword = function(passwordAttemp, cb){
    bcrypt.compare(passwordAttemp, this.password, (err, isMach)=>{
        // si da erro
        if(err){
            return cb(err);
        }
        // si no
        else {
            cb(null, isMach)
        }
    });
};

// exportamos el Schema UserSchema
module.exports = mongoose.model('User', UserSchema);