var express = require("express");
var bodyParser = require("body-parser");
var axios = require('axios');
var assert = require('assert');
var app = express();

const mongoose = require('mongoose')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', function (err, db) {
    app.get("/pricedifference", function(req,res){
        // Cursor is created with a query for the document with the specific fruit requested
        var cursor = db.collection('Fruits').find({"fruit": req.body.fruit});
    
        // This allows a reference to the document currently being referred to, "doc."
        cursor.forEach(function(doc, index) {
            var diff = [];
            console.log(doc);
            console.log(doc.countryPrices.length)
            console.log(doc.countryPrices[3])
            // This is a loop through the countryPrices array item in the documents
            // to go through all the countries in the document and their prices for 
            // the fruit in the document.
            for (i = 1; i < doc.countryPrices.length; i++) {
                var temp = {
                    "country": doc.countryPrices[i].country, // This gets the country using the JSON object syntax
                    // This gets the price difference from the price of the fruit in the United States using the 
                    // JSON object syntax as well.
                    "priceddifference": doc.countryPrices[0].price -doc.countryPrices[i].price 
                }
                // This stores all the price differences of the fruit for each country to the US, in an array.
                diff[diff.length] = temp; 
            }
            // This sort all the price differences in decreasing order.
            diff.sort((a,b) => a.priceddifference-b.priceddifference);
            console.log(diff);
            // The final result is sent over to PostMan, when the server is run.
            res.send({"fruit": doc.fruit, "Price Differences": diff});
        });
    });
});

var server = app.listen(2000, function () {
    console.log("app running on port.", server.address().port);
});