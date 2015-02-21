var express = require('express')
var app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    if(req.query.budget) {
		res.sendFile('index.html', {'root':__dirname});
	}
    else {
    	res.sendFile('index.html', {'root':__dirname});
    }
});

app.post('/food', function(req, res) {
	console.log("BUDGET: " + req.body.budget);
});

app.use(express.static(__dirname))

var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})
