// MapTrip

var express = require("express");
var app = express();
app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

// Routes

app.get('/api/maps/', function(req, res) {
  res.send([
  {
    id:"barcelona",title:"Barcelona"
  },
  {
    id:"londres",title:"London"
  }]
);
});

app.get('/api/maps/:id', function(req, res) {
  res.send(
      {
    id:"barcelona",title:"Barcelona",
    description:"Viatge per Barcelona i per algun altre lloc que no sé exactament com posaré",
    sections: [
      {
        name:"Barcelona",
        description:"Primer dia",
        locations: [
          {type:"point",coords:[41.40401, 2.17454],name:"Sagrada Familia",description:"On van tots els turistes"},
          {type:"route",coords:[[41.3705, 2.1502],[41.40401, 2.17454]],name:"Linia recta",description:"Com no vagis volant..."},
          {type:"point",coords:[41.3705, 2.1502],name:"Pavello mies van der rohe",description:"No se com s'escriu"}
        ]
      },
      {
        name:"Madrid",
        description:"Segon dia",
        locations: [
          {type:"point",coords:[40.40401, 1.17454],name:"Sagrada Familia",description:"On van tots els turistes"},
          {type:"point",coords:[40.3705, 1.1502],name:"Pavello mies van der rohe",description:"No se com s'escriu"},
          {type:"route",coords:[[40.3705, 1.1502],[40.40401, 1.17454]],name:"Linia recta",description:"Com no vagis volant..."}
        ]
      }
    ]
  }
  );
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
