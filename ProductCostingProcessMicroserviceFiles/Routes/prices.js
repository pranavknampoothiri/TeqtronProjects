var express = require("express");
var router = require('express').Router();
var bodyParser = require("body-parser");
var axios = require('axios');
var assert = require('assert');
var app = express();

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
const Price = require('../Models/Price')
const Product = require('../Models/Product')

// This is a function that has the HTTP request to the third-party API giving the prices of ingredients.
// The function takes as a parameter an ingredient input, which is used as the API link parameter.
// The ingredient input is in fact a request body passed as an argument to the function call to the 
// third-party API call function.
const getPrice = (ingredient)=> axios.get('http://sdp394-eval-test.apigee.net/v1/priceapi/Food/Items/' + ingredient)
      .then((data)=> {
        // This stores the data retrieved from the ingredient prices third-party API, into a document/instance
        // in a prices collection.
        let doc2 = new Price({
            "name" : data.data.name,
            "unitPriceInUSD" : data.data.unitPriceInUSD,
            "unitOfMeasurement" : data.data.unitOfMeasurement,
            "countryOfOrigin" : data.data.countryOfOrigin
         });
         // The document is then saved/written into MongoDB.
         doc2.save().then(() => {
            console.log(data.data);
         });
      })
      .catch(error=> (res.send(error)))

router.get("/ingprice", function(req,res){
    // This deletes the current collection in MongoDB everytime this server is run again. 
    // This is so duplicates don't constantly get created every time the server is tested.
    mongoose.connection.db.dropCollection('prices', function(err, result) {
        console.log("deleted");
    });
    console.log(req.body.product);
    // This queries the MongoDB "products" collection, using the Product Model.
    Product.find()
        .then(async (products) => {
            console.log(products);
            // This loops through the documents of the product collection.
            // Whenever the product encountered in the collection, matches 
            // the product put in as a request body when running the server
            // with this route, a variable local to the entire query is assigned
            // the value of the index of the products collection array (the 
            // collection is viewed as an array when queried).
            a = 0;
            for (var i = 0; products.length; i++) {
                if (products[i].product == req.body.product) {
                    a = i;
                    break;
                }
            }
            // The variable local to the query, is then used as the index of the 
            // products collection array to identify the document in the products
            // collection to find the prices of the ingredients for.
            for(var j = 0; j < products[a].ingredients.length; j++){
                let price = await getPrice(products[a].ingredients[j].Ingredient)
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