var mongoose = require("mongoose");
var dbURI = 'mongodb://localhost/Loc8r';
if(process.env.NODE_ENV === 'production'){
  dbURI = "mongodb://heroku_rklrcl64:1dqo12namli22f1lfc63ube6s@ds035766.mlab.com:35766/heroku_rklrcl64";

  // dbURI = process.env.MONGOLAB_URI;
}
var readline = require('readline');
mongoose.connect(dbURI);

// if( process.platform === "win32"){
//   var rl = readline.createInterface({
//      input: process.stdin,
//      output: process.stdout
//   });
//
//   rl.on("SIGINT", function(){
//     process.emit("SIGINT");
//   });
// }


mongoose.connection.on('connected', function(){
  console.log('Mongoose connected to '+dbURI);
})
mongoose.connection.on('error', function(err){
  console.log('Mongoose connection error: '+err);
})
mongoose.connection.on('disconnected', function(){
  console.log('Mongoose disconnected ');
})

var gracefulShutdown = function(msg, callback){
  mongoose.connection.close(function(){
    console.log('Mongoose disconnected through '+msg);
    callback();
  });
};

process.once('SIGUSR2',function(){
   gracefulShutdown('nodemon restart', function(){
     process.kill(process.pid,'SIGUSR2');
   });
});

process.on('SIGINT', function(){
  gracefulShutdown('app termination',function(){
    process.exit(0);
  });
});


process.on('SIGTERM',function(){
  gracefulShutdown('Heroku app shutdown', function(){
    process.exit(0);
  })
})

require('./locations')
