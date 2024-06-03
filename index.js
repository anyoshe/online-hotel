require('dotenv').config();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const cors = require('cors');
const shortid = require('shortid')
const { connect, connection, Schema, model, Types} = mongoose;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');

 
const mongoString = process.env.DATABASE_URL;
 mongoose.connect(mongoString);
const database = mongoose.connection

const app = express(); 

app.use(express.json());   
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false, 
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors()); 
app.use('/api', routes);

// Passport Config
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
    const user = await User.findOne({ email });
     if (!user) return done(null, false, { message: 'Incorrect email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect password.' }); 

    return done(null, user);
} catch (err) {
    return done(err);
}
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});



app.listen(3000, () => {
    console.log(`Server Started at ${3000}`) 
})
database.on('error', (error) => {
    console.log(error)
})  

database.once('connected', () => {
    console.log('Database Connected');
})

