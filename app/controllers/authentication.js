'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const autoConfig = require('../../config/auth');


// función que generará un JWT para un usuario,
function generateToken(user){
    return jwt.sign(user, autoConfig.secret, {
        expiresIn: 10080
    });
};


//unción que se encarga de configurar solo la información requerida para el JWT.
function setUserInfo(request){
    return {
        _id: request._id,
        email: request.email,
        role: request.role
    };
};


// función maneja el envío del JWT de vuelta al usuario (que eventualmente almacenaremos en la aplicación Ionic 2) para que puedan usarlo para autenticar cada solicitud que hacen a nuestro servidor.
exports.login = (req, res, next)=>{
    const userInfo = setUserInfo( req.user);

    res.status(200).json({
        token: 'jwt' + generateToken(userInfo),
        user: userInfo
    });
};



// función solo acepta una solicitud y crea un nuevo usuario siempre que los datos sean válidos y que un usuario con la misma dirección de correo electrónico aún no exista
exports.register = (req, res, next)=>{

    const email = req.body.email
    const password = req.body.password
    const role = req.body.role

    //si esta mal el email
    if(!email){
        return res.status(422).send({ error: 'Debe ingresar un correo válido'})
    }
    // si esta mal el pass
    if(!password){
        return res.status(422).send({ error: 'Gebe ingresar un passwoed válido'})
    }


    User.findOne({email: email}, (err, existeUser)=>{
        // si da error
        if(err){
            return next(err);
        }
        // si existe el email
        if(existeUser){
            return res.status(422).send({error: 'El email ya esta utilizado'})
        }

        const user = new User({
            email: email,
            password: password,
            role: role
        });

        user.save((err, user)=>{
            // si da error
            if(err){
                return next(err)
            }

            const userInfo = setUserInfo(user);

            res.status(201).json({
                token : 'token' + generateToken(userInfo),
                user: userInfo
            });
        });
    });
};



//Esta función nos permite definir una matriz de roles en cada ruta, y solo permitirá el acceso a la ruta si el usuario tiene la función adecuada almacenada en su JWT. La función primero encuentra al usuario apropiado usando su _id y luego verifica si role están en la matriz de roles suministro a esta función.
exports.roleAuthorization = function(roles){
    return function(req, res, next){
        const user = req.user;

        User.findById(user_id, (err, foundUser)=>{
            //si hay error
            if(err){
                res.status.send({error: 'Usuario no encontrado'})
                return next(err);
            }

            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.status(401).json({error: 'ud no esta autorizado para ver el contenido'});
            return  next('no Autorizado');
        });
    };
};
