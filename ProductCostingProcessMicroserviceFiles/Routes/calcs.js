var express = require("express");
var router = require('express').Router();
var bodyParser = require("body-parser");
var axios = require('axios');
var assert = require('assert');
var app = express();

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true})
const Price = require('../Models/Price')
const Product = require('../Models/Product')
const Result = require('../Models/Result')
const Conversion = require('../Models/Conversion')

// This function queries the price collectionn.
function priceQuery() {
    return Price.find()
        .then((prices) => {
            let priceArray = [];
            // This loop goes through the prices collection array and assigns the UoM and price of the ingredient
            // to two different variables. The variables are then stored as 2 items in a JSON object and added to an
            // array.
            for (var i = 0; i < prices.length; i++){
                var a = prices[i].unitOfMeasurement
                var b = prices[i].unitPriceInUSD
                priceArray[priceArray.length] = {"price" : b, "units" : a}
            }
            // The array is returned after having gone through all the ingredient documents.
            return priceArray;
        }).catch(err => {
            console.log(err);
        });
}

// This function queries the products collection.
function productsQuery(productName) {
    return Product.find({"product": productName})
        .then((products) => {
            productsArray = [];
            // This loops through the documents of the product collection.
            // Whenever the product encountered in the collection, matches 
            // the product put in as a request body when running the server
            // with this route, a variable local to the entire query is assigned
            // the value of the index of the products collection array (the 
            // collection is viewed as an array when queried).
            l = 0;
            for (var j = 0; j < products.length; j++) {
                if (products[j].product == productName) {
                    l = j;
                    break;
                }
            }
            // The variable local to the query, is then used as the index of the 
            // products collection array to identify the document in the products
            // collection for which you find the measurement and quantity of each
            // of the ingredients. 
            // This loop goes through the products collection ingredients array and
            // assigns the UoM and quantity of the ingredient to two different variables.
            // The variables are then stored as 2 items in a JSON object and added to an
            // array.
            for (var k = 0; k < products[l].ingredients.length; k++) {
                var c = products[l].ingredients[k].UoM
                var d = products[l].ingredients[k].Quantity
                productsArray[productsArray.length] = {"Quantity" : d, "units" : c}
            } 
        // The array is returned after having gone through all the elements of the ingredients array item.
        return productsArray;
        }).catch(err => {
            console.log(err);
        });
}

// This function queries the conversions collection.
function conversionsQuery() {
    return Conversion.find()
        .then((conversions) => {
            conversionsArray = [];
            // This loop goes through all the different conversions in the conversions collection
            // and stores the measurement being converted from, the measurement being converted to, 
            // the conversion factor, and the operation all in 4 different variables. All these 
            // variables are then put together as a JSON object, and each object for each conversion
            // (including the reverse of the same measurements, since the operation changes) is stored
            // in an array. 
            for (var a = 0; a < conversions.length; a++) {
                var e = conversions[a].FromUoM;
                var f = conversions[a].ToUoM;
                var g = conversions[a].Value;
                var h = conversions[a].Operation;
                conversionsArray[conversionsArray.length] = {"From_UoM" : e, "To_UoM" : f, "value" : g, "operation" : h};
            }
            // The array is returned after having gone through all the different conversions, each stored in a document.
            return conversionsArray;
        }).catch(err => {
            console.log(err);
        });
}



router.post("/calculation", async function(req,res){
    priceArray = await priceQuery();
    productsArray = await productsQuery(req.body.product);
    conversionsArray = await conversionsQuery();
    p = 0;
    sum = 0
    console.log(priceArray);
    console.log(productsArray);
    console.log(conversionsArray);
    // This loops through the different prices for the ingredients of the product at hand.
    for (var i = 0; i < priceArray.length; i++) {
        // This loops through all the conversions to find the appropriate conversion units and do the converting.
        for (var j = 0; j < conversionsArray.length; j++) {
            if ((priceArray[i].units == conversionsArray[j].From_UoM) && (productsArray[i].units == conversionsArray[j].To_UoM)) {
                if (conversionsArray[j].operation == "*") {
                    p = (priceArray[i].price*(conversionsArray[j].value))*productsArray[i].Quantity; 
                }
                else if (conversionsArray[j].operation == "/") {
                    p = (priceArray[i].price/(conversionsArray[j].value))*productsArray[i].Quantity;
                }
                break;
            }
            else if (priceArray[i].units == productsArray[i].units) {
                p = priceArray[i].price*productsArray[i].Quantity
                break;
            }
        }
        // This accumulates all the converted prices.
        sum = sum + p;
    }
    // This stores the final result in a last collection. 
    let doc = new Result({
        "Product": req.body.product,
        "ProductPriceOneItemInUSDollars" : sum
    })
    doc.save().then(() => {
        console.log(sum)
    })
});

module.exports = router;