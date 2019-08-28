const mongoose = require('mongoose');
const Conversion = new mongoose.Schema({
    "FromUoM" : String,
    "ToUoM" : String,
    "Value" : Number,
    "Operation" : String
})
module.exports = mongoose.model("conversions", Conversion);