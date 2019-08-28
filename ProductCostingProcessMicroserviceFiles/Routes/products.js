var express = require("express");
var router = require('express').Router();
var axios = require('axios');
var assert = require('assert');
var app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
const Product = require('../Models/Product')

router.post('/products', function(req, res){
    mongoose.connection.db.dropCollection('products', function(err, result) {
        console.log("deleted");
    });

    var rqqst = 'http://dominicvarakukala-eval-test.apigee.net/tq_products/products';
    axios.get(rqqst,req.body)
    .then(data => {
        console.log(data);
        for (var i = 0; i < data.data.length; i++){
            let doc1 = new Product({
                "product": data.data[i].product,
                "ingredients": data.data[i].ingredients
            });
            doc1.save().then(() => {
                console.log("Putting products and their ingredients in MongoDB");
                mongoose.connection.close();
            })
            .catch(error => console.log(error));
        }
        res.send("Saved in database");

    })
    .catch(error=> (res.send(error)));
});

module.exports = router;