var express = require("express");
var bodyParser = require("body-parser");
var app = express();
//var json = JSON.parse(data);
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const Result = require('../Models/Result');

app.get("/finalprice", function(req,res) {
    Result.find({"Product": req.body.Product})
        .then((results) => {
            console.log("Sending the final price of the product.")
            res.send(results);
            // mongoose.connection.close();
        })
})

var server = app.listen(1000, function () {
    console.log("app running on port.", server.address().port);
});
