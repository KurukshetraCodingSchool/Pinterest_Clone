const mongoose = require('mongoose')
mongoose.connect('mongodb://0.0.0.0/Pinterest').then(()=>{
    console.log('db connected');
});