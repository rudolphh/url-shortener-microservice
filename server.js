'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dotenv = require('dotenv'); dotenv.load();
var AutoIncrement = require('mongoose-sequence');


var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = Promise;

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

///////////  our URL schema and model
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: {
    type: String,
    required: true
  }
});

// we're using mongoose-sequence to make short_url auto-increment on every save
urlSchema.plugin(AutoIncrement, {inc_field: 'short_url'});
var URL = mongoose.model('URL', urlSchema);


function urlFindOrSave(url, res){
  URL.findOne({ original_url: url }, function(err, urlDoc){
    if(err) { console.log(err); }
    else { // success
      if(urlDoc){ // found
        res.json({
          original_url: urlDoc.original_url,
          short_url: urlDoc.short_url
        });
      } else { // its a new url so we're going to save in our db

        var newURL = new URL({
          original_url: url // note short_url is handled for us on save
        });
        newURL.save(function(err, newDoc){
          if(err) { console.log(err); }
          else {
            // after we save we want to respond with json containing our new short_url index
            res.json({
              original_url: newDoc.original_url,
              short_url: newDoc.short_url
            });
          }
        });
      }
    }// end else (success)
  })
}

const dns = require('dns');

// our url shortener API endpoint
app.post('/api/shorturl/new', function(req, res) {

  var protocolReg = /(^\w+:|^)\/\//;
  var url = req.body.url;

  // if we have a protocol great
  if(url.match(protocolReg)){
    var result = url.replace(protocolReg, '');// strip the protocol first
    var domain = result.split('/')[0];// remove any routes

    dns.lookup(domain, function(err, addr, fam) {
      // if the domain isn't valid
      if(err) { res.json({ error: 'invalid URL' }); }
      else { urlFindOrSave(url, res); }
    });
  } else { // if no protocol, fail
    res.json({ error: 'invalid URL' });
  }

});

app.get('/api/shorturl/:index', function(req, res){

  // TODO use req.params.index with our mongoose instance and find by index key

  // if found
    // res.redirect('https://www.google.com'); obv with original_url value

  // else if no short_url is found for the given index
    // res.json({ error: 'No short url found for given index' });

});

var listener = app.listen(port, function () {
  console.log('Node.js listening on ' + listener.address().port );
});
