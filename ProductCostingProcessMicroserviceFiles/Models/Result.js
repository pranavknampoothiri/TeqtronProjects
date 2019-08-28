const mongoose = require('mongoose');
const Result = new mongoose.Schema({
    "Product" : String,
    "ProductPriceOneItemInUSDollars" : Number
})
module.exports = mongoose.model("results", Result);