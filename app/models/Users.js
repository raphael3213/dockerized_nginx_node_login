const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var uniqueValidator = require('mongoose-unique-validator')

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: { type: String, required: true, unique: true},
  name: String,
  hash: String,
  salt: String,
  role: String,
});

UsersSchema.plugin(uniqueValidator)

UsersSchema.methods.setPassword = function (password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function (password){
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};


UsersSchema.methods.generateJWT = function (){

    this.token = jwt.sign({ email: this.email, id: this._id, name: this.name, role: this.role}, 'my_secret_key' ,{expiresIn:'1h'});
    return this.token;
    
}

UsersSchema.methods.toAuthJSON = function() {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      role:this.role,
      token: this.generateJWT(),
    };
  };

  
mongoose.model('Users', UsersSchema);
