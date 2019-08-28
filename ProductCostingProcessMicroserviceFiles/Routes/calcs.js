var express = require("express");
var router = require('express').Router();
var bodyParser = require("body-parser");
var axios = require('axios');
var assert = require('assert');
var app = express();

//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority';
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true})
const Price = require('../Models/Price')
const Product = require('../Models/Product')
const Result = require('../Models/Result')
const Conversion = require('../Models/Conversion')

function priceQuery() {
    return Price.find()
        .then((prices) => {
            let priceArray = [];
            for (var i = 0; i < prices.length; i++){
                var a = prices[i].unitOfMeasurement
                var b = prices[i].unitPriceInUSD
                priceArray[priceArray.length] = {"price" : b, "units" : a}
            }
            return priceArray;
        }).catch(err => {
            console.log(err);
        });
}

function productsQuery(productName) {
    return Product.find({"product": productName})
        .then((products) => {
            productsArray = [];
            l = 0;
            for (var j = 0; j < products.length; j++) {
                if (products[j].product == productName) {
                    l = j;
                    break;
                }
            }
            for (var k = 0; k < products[l].ingredients.length; k++) {
                var c = products[l].ingredients[k].UoM
                var d = products[l].ingredients[k].Quantity
                productsArray[productsArray.length] = {"Quantity" : d, "units" : c}
            } 
        return productsArray;
        }).catch(err => {
            console.log(err);
        });
}

function conversionsQuery() {
    return Conversion.find()
        .then((conversions) => {
            conversionsArray = [];
            for (var a = 0; a < conversions.length; a++) {
                var e = conversions[a].FromUoM;
                var f = conversions[a].ToUoM;
                var g = conversions[a].Value;
                var h = conversions[a].Operation;
                conversionsArray[conversionsArray.length] = {"From_UoM" : e, "To_UoM" : f, "value" : g, "operation" : h};
            }
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
    for (var i = 0; i < priceArray.length; i++) {
        // console.log(priceArray[i].units);
        // console.log(productsArray[i].units);
        // console.log(priceArray[i].price);
        // console.log(productsArray[i].Quantity);
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
        /*
        if (priceArray[i].units != productsArray[i].units) {
            if ((productsArray[i].units == 'gram') && (priceArray[i].units == 'kilogram')) {
                p = (priceArray[i].price/1000)*productsArray[i].Quantity
            }
            else if((productsArray[i].units == 'gram') && (priceArray[i].units == 'liter')) {
                p = (priceArray[i].price/1000)*productsArray[i].Quantity
            }
            else if ((productsArray[i].units == 'gram') && (priceArray[i].units == 'box')) {
                p = (priceArray[i].price/120)*productsArray[i].Quantity
            }  
        }
        */
        sum = sum + p;
    }
    let doc = new Result({
        "Product": req.body.product,
        "ProductPriceOneItemInUSDollars" : sum
    })
    doc.save().then(() => {
        console.log(sum)
    })
});

module.exports = router;