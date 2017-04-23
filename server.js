'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dotenv = require('dotenv'); dotenv.load();

var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// our url shortener API endpoint
//app.get()


var listener = app.listen(port, function () {
  console.log('Node.js listening on ' + listener.address().port );
});
