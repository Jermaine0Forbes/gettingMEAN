var request = require("request");
var apiOptions = {
  server: "http://localhost:3000"
};
if(process.env.NODE_ENV === 'production'){
  apiOptions.server = "https://stormy-shore-42538.herokuapp.com/"
}

var renderHomepage = function(req, res, responseBody){
  res.render('locations-list',{
    title:'Loc8r - find a place to work with wifi',
    pageHeader:{
      title: "Loc8r",
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar:"Looking for wifi and a seat? Loc8r helps you find places to work when \
    out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for"
    ,
    locations:responseBody
    // locations:[{
    //     name: 'Starcups',
    //     address: '125 High Street, Reading, RG6 1PS',
    //     rating: 3,
    //     facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //     distance:'100m'
    //     },{
    //     name: 'Cafe Hero',
    //     address: '125 High Street, Reading, RG6 1PS',
    //     rating: 4,
    //     facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //     distance:'200m'
    //     },{
    //     name: 'Burger Queen',
    //     address: '125 High Street, Reading, RG6 1PS',
    //     rating: 2,
    //     facilities: [ 'Food', 'Premium wifi'],
    //     distance:'250m'
    //   }
    // ]
  });
}

module.exports = {
  // GET home page
  homelist: function(req,res){
    var requestOptions, path;
    path = '/api/locations';
    requestOptions = {
      url: apiOptions.server+path,
      method: "GET",
      json: {},
      qs:{
        lng: -0.7992599,
        lat: 51.378091,
      maxDistance: 20
      }
    };

	var _formatDistance = function(distance){
		var numDistance, unit;
		if (distance > 1){
			numDistance = parseFloat(distance).toFixed(1);
			unit = 'km';

		}else{
			numDistance = parseInt(distance *1000,10);
			unit = 'm'
		}
		return numDistance + unit;
	}// end formatDistance

    request( requestOptions, function(err,response, body){
		 var i, data;
		 data = body;
     if(err){
       console.error(err);
     }
     if(response.statusCode == 200 && data.length){
         for(i = 0; i < data.length; i++){
        data[i].distance = _formatDistance(data[i].distance);
         console.log(data[i].distance);

        }

       renderHomepage(req,res, data)
     }
    //  else{
    //     console.log(res);
    //    console.log("There is no data here");
    //  }
	})//end request

  },
  // GET Location Info Page
  locationInfo: function(req,res){
    res.render('location-info',{
        title: 'Starcups',
        pageHeader: {
            title: 'Starcups'
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: {
            name: 'Starcups',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            coords: {
                lat: 51.455041,
                lng: -0.9690884
            },
            openingTimes: [{
                days: 'Monday - Friday',
                opening: '7:00am',
                closing: '7:00pm',
                closed: false
            }, {
                days: 'Saturday',
                opening: '8:00am',
                closing: '5:00pm',
                closed: false
            }, {
                days: 'Sunday',
                closed: true
            }],
            reviews: [{
                author: 'Simon Holmes',
                rating: 5,
                timestamp: '16 July 2013',
                reviewText: 'What a great place. I can\'t say enough good things about it.'
            }, {
                author: 'Charlie Chaplin',
                rating: 3,
                timestamp: '16 June 2013',
                reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
            }]
        }
    })
  },
  // GET Add Review page
  addReview: function(req,res){
    res.render('location-review-form',{
        title: 'Review Starcups on Loc8r',
        pageHeader: {
            title: 'Review Starcups'
        }
    })
  },
}
