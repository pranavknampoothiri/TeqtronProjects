var express = require("express");
var bodyParser = require("body-parser");
var products = require("./Routes/products");
var prices = require("./Routes/prices");
var calcs = require("./Routes/calcs");
var assert = require('assert');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// This is the main file being run for the Product Cost Calculation Microservice,
// using the three main routes below, in the order as listed.
app.use(products);
app.use(prices);
app.use(calcs);

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});