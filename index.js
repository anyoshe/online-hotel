require('dotenv').config();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const cors = require('cors');
const shortid = require('shortid')
const { connect, connection, Schema, model, Types} = mongoose;


const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection

const app = express(); 

app.use(express.json());   
app.use(bodyParser.json());
app.use(cors()); 
app.use('/api', routes);



app.listen(3000, () => {
    console.log(`Server Started at ${3000}`) 
})
database.on('error', (error) => {
    console.log(error)
})  

database.once('connected', () => {
    console.log('Database Connected');
})

