// MapTrip

var express = require("express");
var app = express();
app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

var db

mongo.Db.connect(mongoUri, function (err, mydb) {
  if (!err) {
	console.log("Connected to mongo");
	db=mydb;
  } else {
	console.log("Not connected to mongo :(");
  }
});

// Routes

app.get('/api/maps/:id', function(req, res) {
  db.collection('maps', function(err, collection) {
    collection.findOne({'_id':req.params.id}, function(err,doc) {
    	res.send(doc);
    });
  });
});

app.get('/api/maps', function(req, res) {
  db.collection('maps', function(err, collection) {
    collection.find({},['_id','title']).toArray(function(err,list) {
    	res.send(list);
    });
  });
});

app.post('/api/maps', function(req, res) {
  var map=req.body;
  db.collection('maps', function(err, collection) {
    collection.save(map,{w:1},function(err,doc) {
      res.send(map);
    });
  });
});

app.put('/api/maps', function(req, res) {
  var map=req.body;
  db.collection('maps', function(err, collection) {
    collection.insert(map,{w:1},function(err,doc) {
    	res.send(doc);
    });
  });
});

app.get('/api/wipeout/', function(req, res) {
  initDB();
  res.send("DB initialitzed!");
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function initDB() {
  maps= [
	 {
    _id:"barcelona",title:"Barcelona",
    description:"Viatge per Barcelona amb punts turístics per ordre",
    sections: [
      {
        name:"Centre",
        description:"Primer dia",
        locations: [
          {type:"point",coords:[41.40401, 2.17454],name:"Sagrada Familia",description:"On van tots els turistes"},
          {type:"route",coords:[[41.3705, 2.1502],[41.40401, 2.17454]],name:"Linia recta",description:"Com no vagis volant..."},
          {type:"point",coords:[41.3705, 2.1502],name:"Pavello mies van der rohe",description:"No se com s'escriu"}
        ]
      },
      {
        name:"Montjuic",
        description:"Segon dia",
        locations: [
          {type:"point",coords:[42.3705, 2.1502],name:"No se",description:"No se com s'escriu"}
        ]
      }
    ]
  },
	{
		_id:"londres",title:"London",
    sections: [
    {
		locations: [
			{type:"point",coords:{x:1,y:2},name:"Big Ben",description:"El rellotge gran"},
			{type:"point",coords:{x:1,y:2},name:"British Museum",description:"La pedra roseta"}
		]
    }
    ]
	},
  {
    _id:"bretanya",title:"Bretanya",
    sections: [
    {
      locations:[]
    }
    ]
  },
  ];

  db.collection('maps', function(er, collection) {
    collection.drop(function (er,rs) {
      console.log("Wiping out db..."+er+rs);
      collection.insert(maps, {safe: true}, function(er,rs) {
        console.log("Populating db..."+er+rs);
      });
    });
  });
};
