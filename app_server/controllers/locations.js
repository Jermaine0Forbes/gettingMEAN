module.exports = {
  // GET home page
  homelist: function(req,res){
    res.render('locations-list',{title:'Home'});
  },
  // GET Location Info Page
  locationInfo: function(req,res){
    res.render('location-info',{title: 'Location Info'})
  },
  // GET Add Review page
  addReview: function(req,res){
    res.render('location-review-form',{title: 'Add Review'})
  },
}
