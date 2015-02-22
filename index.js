var express = require('express')
var app = express()

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

app.use(express.static(__dirname))

var server = app.listen(3000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

})

/*
vclient.get_details([response.objects[0].id], function(detail_data){
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
  					})*/