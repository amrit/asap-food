var express = require('express')
var request = require('superagent')
var cors = require('cors')
var app = express()
var corsOptions = {
  origin: 'http://localhost'
};

app.use(cors(corsOptions));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));



var async = require('async')

var keys = require('./apikeys')

var locu = require('locu')
var vclient = new locu.VenueClient(keys.locu_api_key)
var yelp = require("yelp").createClient({
	consumer_key: keys.yelp_consumer_key,
	consumer_secret: keys.yelp_consumer_secret,
	token: keys.yelp_token,
	token_secret: keys.yelp_token_secret
})


app.get('/bills', function (req, res) {
	var sumBills = 0
	request.get('http://api.reimaginebanking.com/accounts/54e9465d1386a86c6b9acc01/bills?key=CUST4c74200dd76b7afb386a9fa0c4e3b0af').end(function (result) {
		response = result.body;


		


		for (var i = 0; i < response.length; i ++) {
			if (response[i].status == 'unpaid') {
				sumBills += response[i]["payment amount"];
			}
		}
		res.json(sumBills);

		
	
	});
	
});



app.get('/budget', function(req, res) {

	request.get('http://api.reimaginebanking.com/accounts/54e9465d1386a86c6b9acc01?key=CUST4c74200dd76b7afb386a9fa0c4e3b0af').end(function (result) {
		response = result.body;


		var balance = response.balance;

		var foodSpending = (.3 * balance) / 30.0
		
		res.json(foodSpending);
		
	});
	
});

app.get('/api/search', function(req, res) {
	yelp.search({term: "food", location: "Berkeley, CA"}, function(error, data) {
  		//console.log(error);
  		//console.log(data.businesses);
  		var return_array = []
  		var business_names = []
  		var b = Math.floor(Math.random()*data.businesses.length);
  		console.log(b)
  		business = data.businesses[b];
  		business_names.push(business.name)
  		

  		vsearch = function(bname, callback){
  			vclient.search({name: bname, locality: 'Berkeley' }, function(response){
  					callback(null, response.objects);
  				});	
  		}

  		async.map(business_names, vsearch, function(err, results){
  			if(err){
  				console.log("error while searching for venues")
  			} else {
  				var venue_ids = results.map(function(item){
  					if(item.length > 0 && item[0].has_menu == true){
  						return item[0].id
  					} else {
  						return null
  					}
  				})

  				msearch = function(id, callback){
  					vclient.get_details([id], function(detail_data){
  						//console.log(detail_data)
  						var objects = detail_data.objects || [];
  						for(obj in objects){
  							for(m in objects[obj].menus){
  								menu = objects[obj].menus[m];
  								for(s in menu.sections){
  									for(ss in menu.sections[s].subsections){
  										subsection = menu.sections[s].subsections[ss]
  										for(c in subsection.contents){
  											if(subsection.contents[c].price){
  												console.log(subsection.contents[c])
  												return_array.push({price: subsection.contents[c].price, name: subsection.contents[c].name})
  											}

  										}
  									}
  								}
  							}	
  						}
  						callback(null, 1)	
  					})  					
  				}

  				async.map(venue_ids, msearch, function(err, results){
  					res.json({restaurant_name: business.name, location: business.location, menu_items: return_array})
  				})

  			}
  		})

  		
	});
})

app.get('/process', function (req, res) {
	var sys = require('sys')
	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) { sys.puts(stdout) }

	menu = [{"price":"5.00","name":"Quiche"},{"price":"6.50","name":"Cold Sandwiches"},{"price":"6.50","name":"Croque Monsieur"}]

	total = 15

	console.log("python combos.py " + "\'"+JSON.stringify(menu)+"\'" + " " + "\""+total+"\"")

	exec("python combos.py " + "\'"+JSON.stringify(menu)+"\'" + " " + "\""+total+"\""  , function(error, stdout, stderr){
		console.log("stdout" + stdout)
		res.json(stdout)
	});
});



app.use(express.static(__dirname))

var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})
