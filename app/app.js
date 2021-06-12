const express = require('express')
const app = express();
const port = process.env.PUBLISHED_PORT || 3000;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

require('./models/Users');
require('./config/passport');
const auth = require('./config/auth');


mongoose.promise = global.Promise;

const isProduction = process.env.NODE_ENV === 'production';


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Configure Mongoose
mongoose.connect('mongodb://mongodb_1:27017/board-infinity', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb://localhost:27017/board-infinity', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('debug', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongo db" )
});




const Users = mongoose.model('Users');

function routeGuard(req,res,next){
    const baseRoute = req.route.path.split('/')[1];
    const role = req.payload.role;
    if(role == 'Owner'){
        if(baseRoute != 'user')
            next();
        else res.json({error:"Not Authorized"});
    }
    else if(role == 'Admin'){
        if(baseRoute == 'admin'){
            next();
        }
        else{
            res.json({error:"Not Authorized"});
        }
    }
    else if(role == 'User'){
        if(baseRoute == 'user'){
            next();
        }
        else{
            res.json({error:"Not Authorized"});
        }
    }
    else{
        res.json({error:"Please login again"});
    }

}


app.get('/user/hello',auth.required,routeGuard,(req,res)=>{
    res.json(req.payload);
})

app.get('/admin/listUsers',auth.required,routeGuard,async (req,res)=>{
    const users = await Users.find().select('email').select('name').select('role');
    console.log(users);
    res.json({'users':users});
})

app.delete('/owner/deleteUser',auth.required,routeGuard,async (req,res)=>{
    Users.findOneAndRemove({email: req.body.email}, (err,data) => {
        if (err) {
        //   req.flash("error", err);
          res.json({"error": err});
        }
        else if (data){
            
            res.json({"message": `${req.body.email} deleted successfully`,"data":data});
        }
        else{
            res.json({"error": "No such user"});
        }
    
      });
    
})

app.post('/signup', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    console.log(user)
    // user.role = "user"; // only users allowed to signup
  
    const finalUser = new Users(user);
  
    finalUser.setPassword(user.password);
  
    return finalUser.save()
      .then(() => res.json({ user: finalUser.toAuthJSON() }))
      .catch((error)=> res.json({"error":error}))
});





app.post('/login', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if(err) {
        return next(err);
      }
  
      if(passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();
  
        return res.json({ user: user.toAuthJSON() });
      }
  
      return res.json({err: err});
    })(req, res, next);
  });


  app.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;
  
    return Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }
  
        return res.json({ user: user.toAuthJSON() });
      });
  });
  

  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
  });