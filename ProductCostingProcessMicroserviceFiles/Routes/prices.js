var express = require("express");
var router = require('express').Router();
var bodyParser = require("body-parser");
var axios = require('axios');
var assert = require('assert');
var app = express();

//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority';
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
const Price = require('../Models/Price')
const Product = require('../Models/Product')

const getPrice = (ingredient)=> axios.get('http://sdp394-eval-test.apigee.net/v1/priceapi/Food/Items/' + ingredient)
      .then((data)=> {
         //return data.data
         let doc2 = new Price({
            "name" : data.data.name,
            "unitPriceInUSD" : data.data.unitPriceInUSD,
            "unitOfMeasurement" : data.data.unitOfMeasurement,
            "countryOfOrigin" : data.data.countryOfOrigin
         });
         doc2.save().then(() => {
            console.log(data.data);
            //console.log('Putting ingredient prices in MongoDB.')
            //console.log("Saved in Database again.")
         });
         //return data.data.name
      })
      .catch(error=> (res.send(error)))

router.get("/ingprice", function(req,res){
    mongoose.connection.db.dropCollection('prices', function(err, result) {
        console.log("deleted");
    });
    console.log(req.body.product);
    Product.find(/*{"product": req.body.product}*/)
        .then(async (products) => {
            console.log(products);
            //console.log(products.ingredients[i].Ingredient);
            a = 0;
            for (var i = 0; products.length; i++) {
                if (products[i].product == req.body.product) {
                    a = i;
                    break;
                }
            }
            //console.log(a);
            //console.log(products[a].ingredients);
            for(var j = 0; j < products[a].ingredients.length; j++){
                let price = await getPrice(products[a].ingredients[j].Ingredient)
                //console.log(price)
            }
            mongoose.connection.close()
        }).catch(err => {
            res.send({confirmation: 'fail',
            message: err.message
            });
        });
});

module.exports = router;

//route
//Argument is product name
//Get product from Mongodb
//Get ingredidents
//For loop ingriedients
//Call smits api for Each ingridient




//req.body Product with a list 