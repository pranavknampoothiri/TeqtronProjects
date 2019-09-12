var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const fs = require('fs');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Mongoclient = mongodb.MongoClient
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const IncomingShipment = require('./ModelFiles/IncomingShipment');
const OutgoingShipment = require('./ModelFiles/OutgoingShipment');
const random = require('random')

var QRCode = require('qrcode');

// This queries my incoming bulk package shipment data from MongoDB.
function bulkPackageData() {
    return IncomingShipment.find()
        .then(incomingshipments => {
            console.log(incomingshipments[0]);
            console.log(incomingshipments[0].LotID);
            return incomingshipments;
        })
        .catch(err => {
            res.send({confirmation: 'fail',
            message: err.message
            });
        });
}

app.post('/incoming', async function(req,res) {
    // This deletes the current collection in MongoDB everytime this server is run again. 
    // This is so duplicates don't constantly get created every time the server is tested.
    mongoose.connection.db.dropCollection('outgoingshipments', function(err, result) {
        console.log("deleted");
    });
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){
        incomingArray = await bulkPackageData();
        console.log(incomingArray[0].BatchID);
        // This is a calculation of the number of packets the bulk shipment is going to be split up into.
        // It uses the manufacturer data from the bulk shipment, stating the incoming quantity and outgoing
        // quantity.
        var packages = incomingArray[0].incomingquantity/incomingArray[0].outgoingquantity;
        // This loops over the number of packages, and creates JSON data with all the manufacturer info,
        // along with a randomly-generated consumer serial number. 
        for (let i = 0; i < packages; i++) {    
            var temp = {
                "MFRID": incomingArray[0].MFRID,
                "BatchID": incomingArray[0].BatchID,
                "LotID": incomingArray[0].LotID,
                "ProductSerialNumber": incomingArray[0].ProductSerialNumber,
                "incomingquantity": incomingArray[0].incomingquantity,
                "outgoingquantity": incomingArray[0].outgoingquantity,
                "UoM": incomingArray[0].UoM,
                "consumerserialnum": random.int(min = 10000000, max = 99999999),
            };
            // This is the url that will be created for each QR Code to store and point to the appropriate data.
            var link = "127.0.0.1:3000/item/" + temp.consumerserialnum
            // This is the QR Code library and function that will create the QR Code as an HTML file. 
            QRCode.toDataURL(link, function (err, qrcodeurl) {
                if (err) console.log('error: ' + err)
                fs.writeFileSync('./qr.html', `<img src="${qrcodeurl}">`);
                console.log('Wrote to ./qr.html');
                // This identifies the particular database and collection, to store the outgoing shipments QR Codes and respective data to. 
                let db = client.db("test");
                let collection = db.collection("outgoingshipments");
                collection.insertOne(
                    {
                        "MFRID": incomingArray[0].MFRID,
                        "BatchID": incomingArray[0].BatchID,
                        "LotID": incomingArray[0].LotID,
                        "ProductSerialNumber": incomingArray[0].ProductSerialNumber,
                        "incomingquantity": incomingArray[0].incomingquantity,
                        "outgoingquantity": incomingArray[0].outgoingquantity,
                        "UoM": incomingArray[0].UoM,
                        "consumerserialnum": random.int(min = 10000000, max = 99999999),
                        "file": fs.readFileSync('./qr.html')
                    }
                ),(err,res)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log("uploaded");
                    }
                }
            });
        }
    });
});

app.get('/item/:consumerserialnum', (req,res)=>{
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){

    // This identifies the particular database and collection, in order to query and retrieve the QR Codes for 
    // situation of an item getting returned or recalled. 
    let db = client.db("test");
    let collection = db.collection("outgoingshipments");
        collection.find({}).toArray((err,doc) => {
            if (err) {
                console.log("error in finding the document:", err)
            }
            // If there is no error, write the file to a qrcode.html file, to retrieve the QR Code for a returned product. 
            else {
                let buffer =doc[0].file.buffer
                fs.writeFileSync('qrcode.html', buffer);
            }
        });
    });
});

// This is the function that queries the outgoing shipments collection for returned items.
function returnData(consum) {
    return OutgoingShipment.find({"consumerserialnum": consum})
        .then(outgoingshipments => {
            console.log(outgoingshipments);
            return outgoingshipments;
        })
        .catch(err => {
            res.send({confirmation: 'fail',
            message: err.message
            });
        });
}

app.post('/return', async function (req, res) {
    // This HTTP request stores the data for a returned item into a collection for returned items.
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){
        // This is the call to the function that queries the outgoingshipments collection for returned items.
        returnArray = await returnData(req.body.consumerserialnum);   
        let db = client.db("test");
        let collection = db.collection("productsreturned");
        collection.insertOne(
            {
                "MFRID": returnArray[0].MFRID,
                "BatchID": returnArray[0].BatchID,
                "LotID": returnArray[0].LotID,
                "ProductSerialNumber": returnArray[0].ProductSerialNumber,
                "incomingquantity": returnArray[0].incomingquantity,
                "outgoingquantity": returnArray[0].outgoingquantity,
                "UoM": returnArray[0].UoM,
                "consumerserialnum": returnArray[0].consumerserialnum,
                "file": returnArray[0].qrCode
            }
        ),(err,res)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log("uploaded");
            }
        }
    });
});

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});