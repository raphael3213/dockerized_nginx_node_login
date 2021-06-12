const mongoose = require('mongoose');
mongoose.promise = global.Promise;
mongoose.connect('mongodb://mongodb:27017/board-infinity', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('debug', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to",db)
});

module.exports = db;