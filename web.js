// MapIt

var express = require("express");
var app = express();
app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
app.use(express.bodyParser());
var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

var db

mongo.Db.connect(mongoUri, function (err, mydb) {
  if (!err) {
	console.log("Connected to mongo");
	db=mydb;
	initDB();
  } else {
	console.log("Not connected to mongo :(");
  }
});

// Routes

app.get('/', function(req, res) {
  res.send('Hello MapIt! Lots of things to do');
});

app.get('/maps/:id', function(req, res) {
  db.collection('maps', function(err, collection) {
    collection.findOne({'id':req.params.id}, function(err,doc) {
    	res.send(doc);
    });
  });
});

app.get('/maps/', function(req, res) {
  db.collection('maps', function(err, collection) {
    collection.find({},['id','title']).toArray(function(err,list) {
    	res.send(lis);
    });
  });
});

app.put('/maps/:id', function(req, res) {
  var id=req.params.id;
  var map=req.body;
  db.collection('maps', function(err, collection) {
    collection.update({'id':id},map,{safe:true},function(err,doc) {
    	res.send(doc);
    });
  });
});

app.post('/maps/', function(req, res) {
  var map=req.body;
  db.collection('maps', function(err, collection) {
    collection.insert(map,{safe:true},function(err,doc) {
    	res.send(doc);
    });
  });
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function initDB() {
  maps= [
	{
		id:"barcelona",title:"Barcelona",
		locations: [
			{type:"point",coords:{x:1,y:2},name:"casa",description:"Casa meva"},
			{type:"point",coords:{x:1,y:2},name:"altre lloc",description:"On sigui"}
		]
	},
	{
		id:"londres",title:"London",
		locations: [
			{type:"point",coords:{x:1,y:2},name:"Big Ben",description:"El rellotge gran"},
			{type:"point",coords:{x:1,y:2},name:"British Museum",description:"La pedra roseta"}
		]
	}
  ];

  db.collection('maps', function(er, collection) {
    collection.drop(function (er,rs) {
      console.log("Wiping out db...");
      collection.insert(maps, {safe: true}, function(er,rs) {
        console.log("Populating db...");
      });
    });
  });
};
