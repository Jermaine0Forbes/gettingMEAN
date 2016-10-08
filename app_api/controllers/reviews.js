var mongoose = require("mongoose");
var Loc = mongoose.model("Location");
var request = require("request");

sendJsonResponse = function(res, status, content){
  res.status(status);
  res.json(content);
}

var doAddReview = function(req, res, location) {
  if (!location) {
    sendJSONresponse(res, 404, "locationid not found");
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
      var thisReview;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};



var updateAverageRating = function(locationid) {
  console.log("Update rating average for", locationid);
  Loc
    .findById(locationid)
    .select('reviews')
    .exec(
      function(err, location) {
        if (!err) {
          doSetAverageRating(location);
        }
      });
};

var doSetAverageRating = function(location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

module.exports ={
  reviewsCreate:function(req,res){

                  if (req.params.locationid) {
              Loc
              .findById(req.params.locationid)
              .select('reviews')
              .exec(
                  function(err, location) {
                      if (err) {
                       sendJSONresponse(res, 400, err);
                      } else {
                       doAddReview(req, res, location);
                      }
                  }
              );
              } else {
                  sendJSONresponse(res, 404, {
                  "message": "Not found, locationid required"
                  });
              }

              },
  reviewsReadOne:function(req,res){
    if(req.params && req.params.locationid && req.params.reviewid){

      Loc.findById(req.params.locationid)
         .select('name reviews')
         .exec(
           function(error,location){
            var response, review;

             if (!location){
               sendJsonResponse(res,404,{
                 "message" : "locationid not found"
               });
             }else if (error){
               sendJsonResponse(res,404,error);
               return;
             }

            if (location.reviews && location.reviews.length > 0){
               var index, x =location.reviews.length;


               for(var i = 0; i < x; i++){
                 if( location.reviews[i].id == req.params.reviewid){
                   index = i;
                   console.log("index is "+index)

                 }
               }



              review = location.reviews[index] ;


              if(!review){
                sendJsonResponse(res,404,{"message":"reviewid not found"});
              }else{

                response = {
                  location : {
                    name: location.name,
                    id: req.params.locationid
                  },
                  author: review.author,
                  review :review.reviewText
                };

                sendJsonResponse(res,200,response);
              }
            } else {
               sendJsonResponse(res,200,{"message":"No reviews found"});
            }
           });//end exec
    } else {

      sendJsonResponse(res,404,{"message":"Not found,  locationid and reviewid are both required"});
    }


  },
  reviewsUpdateOne:function(req, res) {
                  if (!req.params.locationid || !req.params.reviewid) {
                    sendJSONresponse(res, 404, {
                      "message": "Not found, locationid and reviewid are both required"
                    });
                    return;
                  }
                  Loc
                    .findById(req.params.locationid)
                    .select('reviews')
                    .exec(
                      function(err, location) {
                        var thisReview;
                        if (!location) {
                          sendJSONresponse(res, 404, {
                            "message": "locationid not found"
                          });
                          return;
                        } else if (err) {
                          sendJSONresponse(res, 400, err);
                          return;
                        }
                        if (location.reviews && location.reviews.length > 0) {
                          thisReview = location.reviews.id(req.params.reviewid);
                          if (!thisReview) {
                            sendJSONresponse(res, 404, {
                              "message": "reviewid not found"
                            });
                          } else {
                            thisReview.author = req.body.author;
                            thisReview.rating = req.body.rating;
                            thisReview.reviewText = req.body.reviewText;
                            location.save(function(err, location) {
                              if (err) {
                                sendJSONresponse(res, 404, err);
                              } else {
                                updateAverageRating(location._id);
                                sendJSONresponse(res, 200, thisReview);
                              }
                            });
                          }
                        } else {
                          sendJSONresponse(res, 404, {
                            "message": "No review to update"
                          });
                        }
                      }
                  );
},
  reviewsDeleteOne:function(req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
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
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            location.reviews.id(req.params.reviewid).remove();
            location.save(function(err) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
  );
}


}
