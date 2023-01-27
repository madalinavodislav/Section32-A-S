//jshint esversion:8

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

main().catch(err => console.log(err));

async function main() {
  mongoose.set('strictQuery', false);
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
    useNewUrlParser: true
  });
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render('secrets');
    }
  });
});

app.post('login', (req, res) => {
  const username = res.body.username;
  const password = res.body.password;

  User.findOne({email: username}, (err, foundUser) => {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        if (foundUser.password === password) {
          res.render('secrets');
        }
      }
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
