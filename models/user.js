const mongoose = require("mongoose")
const plm = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    Dob:Date
})
userSchema.plugin(plm);

module.exports = mongoose.model('pinterst_user',userSchema);