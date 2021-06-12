const cluster = require('cluster');
const os = require('os');

const numCPU = os.cpus().length;

// const mongoose = require('mongoose');

if(cluster.isMaster){


// mongoose.promise = global.Promise;
// mongoose.connect('mongodb://mongodb:27017/board-infinity', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set('debug', true);

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
//   console.log("connected to",db)
// });
  for(let i=0;i<4;i++){
    cluster.fork()
  }

  cluster.on('exit',(worker,code,signal) => {
    if(code) console.log("code",code)
    console.log("killed",worker);
    cluster.fork();
  })
} else{

  require('./app');

  
}



