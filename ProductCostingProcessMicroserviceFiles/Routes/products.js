var express = require("express");
var router = require('express').Router();
var axios = require('axios');
var assert = require('assert');
var app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
const Product = require('../Models/Product')

router.post('/products', function(req, res){
    // This deletes the current collection in MongoDB everytime this server is run again. 
    // This is so duplicates don't constantly get created every time the server is tested.
    mongoose.connection.db.dropCollection('products', function(err, result) {
        console.log("deleted");
    });

    // This is the link to the third-party API written by Dominic; this gives all the Products and its info.
    var rqqst = 'http://dominicvarakukala-eval-test.apigee.net/tq_products/products';
    // This is the actual request to the third-party products info API.
    axios.get(rqqst,req.body)
    .then(data => {
        console.log(data);
        // This loops through all the products in the API 
        // and stores them as documents with the product 
        // and array of ingredients that make up the product
        // in a products collection.
        for (var i = 0; i < data.data.length; i++){
            let doc1 = new Product({
                "product": data.data[i].product,
                "ingredients": data.data[i].ingredients
            });
            // Stores each document in MongoDB.
            doc1.save().then(() => {
                console.log("Putting products and their ingredients in MongoDB");
                mongoose.connection.close();
            })
            .catch(error => console.log(error));
        }
        // Notifies that the data has been saved in MongoDB.
        res.send("Saved in database");

    })
    .catch(error=> (res.send(error)));
});

module.exports = router;