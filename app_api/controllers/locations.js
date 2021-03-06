var mongoose = require("mongoose");
var Loc = mongoose.model("Location");
var request = require("request");

var theEarth = (function(){
  var earthRadius = 6371;//km not miles around the earth
  var getDistanceFromRads = function(rads){
    return parseFloat(rads*earthRadius)
  };

  var getRadsFromDistance = function(distance){
    return parseFloat(distance/earthRadius);
  };

  return{
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };

})();

sendJsonResponse = function(res, status, content){
  res.status(status);
  res.json(content);
}

module.exports ={
    locationsListByDistance: function(req,res){

                var lng = parseFloat(req.query.lng);
                var lat = parseFloat(req.query.lat);
                var point = {
                  type:"Point",
                  coordinates:[lat,lng]
                };
                var geoOptions = {
                  spherical:true,
                  maxDistance: theEarth.getRadsFromDistance(20),
                  num:10
                };

                if(!lng || !lat ){

                    sendJsonResponse(res,404,{"message":"lng, lat, and maxDistance  parameters are required"});
                    return;
                }
                Loc.geoNear(point, geoOptions,function(err,results, stats){
                var locations = [];
                if (err){
                  sendJsonResponse(res,404,err)

                }else if (results.length === 0){

                  sendJsonResponse(res, 404, {
                    "message": "No locations returned."
                  });

                }else{
                  results.forEach(function(doc){
                    locations.push({
                      distance:theEarth.getDistanceFromRads(doc.dis),
                      name: doc.obj.name,
                      address: doc.obj.address,
                      rating:doc.obj.rating,
                      facilties: doc.obj.facilities,
                      _id:doc.obj._id
                    });
                  })

                    sendJsonResponse(res,200,locations)
                }

                })



                },
      locationsCreate:function(req,res){

                        console.log(req.body);
                Loc.create({
                  name: req.body.name,
                  address: req.body.address,
                  facilities: req.body.facilities.split(","),
                  coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
                  openingTimes: [{
                      days: req.body.days1,
                      opening: req.body.opening1,
                      closing: req.body.closing1,
                      closed: req.body.closed1,
                      }, {
                      days: req.body.days2,
                      opening: req.body.opening2,
                      closing: req.body.closing2,
                      closed: req.body.closed2,
                  }]
                }, function(err, location) {
                if (err) {
                  console.log(err);
                  sendJSONresponse(res, 400, err);
                } else {
                  console.log(location);
                  sendJSONresponse(res, 201, location);
                }
                });
                },
      locationsReadOne:function(req,res){

                if(req.params && req.params.locationid){

                  Loc.findById(req.params.locationid)
                   .exec(
                     function(error,location){


                       if (!location){
                         sendJsonResponse(res,404,{
                           "message" : "locationid not found"
                         });
                       }else if (error){
                         sendJsonResponse(res,404,error);
                         return;
                       }


                       sendJsonResponse(res,200,location);
                     });//end exec
              } else {

                sendJsonResponse(res,404,{"message":"No locationid in request"});
              }


            },
locationsUpdateOne:function(req, res) {
                  if (!req.params.locationid) {
                    sendJSONresponse(res, 404, {
                      "message": "Not found, locationid is required"
                    });
                    return;
                  }
                  Loc
                    .findById(req.params.locationid)
                    .select('-reviews -rating')
                    .exec(
                      function(err, location) {
                        if (!location) {
                          sendJSONresponse(res, 404, {
                            "message": "locationid not found"
                          });
                          return;
                        } else if (err) {
                          sendJSONresponse(res, 400, err);
                          return;
                        }
                        location.name = req.body.name;
                        location.address = req.body.address;
                        location.facilities = req.body.facilities.split(",");
                        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                        location.openingTimes = [{
                          days: req.body.days1,
                          opening: req.body.opening1,
                          closing: req.body.closing1,
                          closed: req.body.closed1,
                        }, {
                          days: req.body.days2,
                          opening: req.body.opening2,
                          closing: req.body.closing2,
                          closed: req.body.closed2,
                        }];
                        location.save(function(err, location) {
                          if (err) {
                            sendJSONresponse(res, 404, err);
                          } else {
                            sendJSONresponse(res, 200, location);
                          }
                        });
                      }
                  );
},
locationsDeleteOne:function(req, res) {
                  var locationid = req.params.locationid;
                  if (locationid) {
                    Loc
                      .findByIdAndRemove(locationid)
                      .exec(
                        function(err, location) {
                          if (err) {
                            console.log(err);
                            sendJSONresponse(res, 404, err);
                            return;
                          }
                          console.log("Location id " + locationid + " deleted");
                          sendJSONresponse(res, 204, null);
                        }
                    );
                  } else {
                    sendJSONresponse(res, 404, {
                      "message": "No locationid"
                    });
                  }
                }
}
