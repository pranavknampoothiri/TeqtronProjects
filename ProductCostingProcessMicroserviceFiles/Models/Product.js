const mongoose = require('mongoose');
const Product = new mongoose.Schema({
    "product": String,
    "ingredients": [
        {
            "Ingredient": String,
            "UoM": String,
            "Quantity": Number
        }
    ]
});

module.exports = mongoose.model("products", Product);