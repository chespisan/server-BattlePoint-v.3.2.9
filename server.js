'use strict';

// requerimos los modulos de express 
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan =  require('morgan');

//  creamos instancia de express
const app = express();

// requerimos ubicacion de la db
const dataBase = require('./config/database');

// requerimos ubicacion de las rutas
const router = require('./app/routes');

// conexion a mongoose 
mongoose.connect(dataBase.url);

// Settings
app.set('port', process.env.PORT || 8080);

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors()); //-> para que no tengamos errores cors localmente!

// Routes
router(app);


// Server on
app.listen(app.get('port'), ()=>{
    console.log(`Server on port ${app.get('port')}`);
})
