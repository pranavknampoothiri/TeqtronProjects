const mongoose = require('mongoose');
const Price = new mongoose.Schema({
    "name" : String,
    "unitPriceInUSD" : Number,
    "unitOfMeasurement" : String,
    "countryOfOrigin" : String
});

module.exports = mongoose.model("prices", Price);