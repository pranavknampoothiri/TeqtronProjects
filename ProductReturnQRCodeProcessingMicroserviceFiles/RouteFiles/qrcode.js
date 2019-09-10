var express = require("express");
var bodyParser = require("body-parser");
var router = require('express').Router();
var axios = require('axios');
var assert = require('assert');
var app = express();
const fs = require('fs');

//var qrcode = new QRCode ("qrcode");

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const OutgoingShipment = require('./ModelFiles/OutgoingShipment');

for (var i = 0; i < outgoingshipments.length; i++) {
    OutgoingShipment.find(/*{"consumerserialnum": req.body.consumerserialnum}*/)
        .then(outgoingshipments => {
            outgoingshipments[i]
        })
        .catch(err => {
            res.send({confirmation: 'fail',
            message: err.message
            });
        });
}