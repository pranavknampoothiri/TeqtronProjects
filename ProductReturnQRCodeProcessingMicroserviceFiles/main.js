var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const fs = require('fs');
var multer = require('multer');
const htmlToImage = require('html-to-image');

//var qrcode = new QRCode ("qrcode");
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Mongoclient = mongodb.MongoClient
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const IncomingShipment = require('./ModelFiles/IncomingShipment');
const OutgoingShipment = require('./ModelFiles/OutgoingShipment');
//const ProductsReturned = require('./ModelFiles/ProductsReturned');
const random = require('random')

var QRCode = require('qrcode');
var qrcode = require('qrcode-generator');
//var Grid = require('gridfs');
//var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var fileId = new mongoose.mongo.ObjectId();

//var express = require('express');
//var connect = express();

/*
app.get('/', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    var sometext='hi my name is saurav ghadai';

// QRCode.QRCodeDraw.color.dark = '#d4d4d4';
    QRCode.toDataURL(sometext, function (err, url) {
        if (err) console.log('error: ' + err)
        fs.writeFileSync('./qr.html', `<img src="${url}">`);
        console.log('Wrote to ./qr.html');
    });
    
});
*/

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
    mongoose.connection.db.dropCollection('outgoingshipments', function(err, result) {
        console.log("deleted");
    });
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){
        incomingArray = await bulkPackageData();
        console.log(incomingArray[0].BatchID);
    var packages = incomingArray[0].incomingquantity/incomingArray[0].outgoingquantity;
    qrCodeImage = [];
        for (let i = 0; i < packages; i++) {
            //var temp = incomingshipments[0];
    
            var temp = {
                "MFRID": incomingArray[0].MFRID,
                "BatchID": incomingArray[0].BatchID,
                "LotID": incomingArray[0].LotID,
                "ProductSerialNumber": incomingArray[0].ProductSerialNumber,
                "incomingquantity": incomingArray[0].incomingquantity,
                "outgoingquantity": incomingArray[0].outgoingquantity,
                "UoM": incomingArray[0].UoM,
                "consumerserialnum": random.int(min = 10000000, max = 99999999),
                //"qrCode":qrCodeImage,
            };
            var link = "127.0.0.1:3000/item/" + temp.consumerserialnum

            /*
            gfs.writeFile({_id: fileId, content_type : 'image/png'}, image, function (err, file) {
                console.log(file);
            });
            
            var storage = multer.diskStorage({
                destination: function (req, file, callback) {
                    callback(null, "./uploads");
                },
                filename: function (req, file, callback) {
                    callback(null. file.fieldname + "_" + Date.now() + "_" + file.originalname);
                }
            });

            var upload = multer({storage: storage}).single('avatar');
            */

            QRCode.toDataURL(link, function (err, qrcodeurl) {
                if (err) console.log('error: ' + err)
                fs.writeFileSync('./qr.html', `<img src="${qrcodeurl}">`);
                console.log('Wrote to ./qr.html');
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

            
            //qrCodeImage[qrCodeImage.length] = url;
        }
    
    });


    // //res.send(incomingshipments);
    // for (let j = 0; j < qrCodeImage.length; j++) {
    //     let doc = new OutgoingShipment({
    //         "MFRID": incomingArray[0].MFRID,
    //         "BatchID": incomingArray[0].BatchID,
    //         "LogID": incomingArray[0].LogID,
    //         "ProductSerialNumber": incomingArray[0].ProductSerialNumber,
    //         "incomingquantity": incomingArray[0].incomingquantity,
    //         "outgoingquantity": incomingArray[0].outgoingquantity,
    //         "UoM": incomingArray[0].UoM,
    //         "consumerserialnum": random.int(min = 10000000, max = 99999999),
    //         "qrCode":qrCodeImage[j],
    //     });
    //     /*
    //     app.use(multer({ dest: "./uploads/",
    //         rename: function (fieldname, filename) {
    //           return filename;
    //         },
    //        }));
        
    //     doc.qrCode.img.data = fs.readFileSync(req.files.userPhoto.path);
    //     doc.qrCode.img.contentType = "image/png";

    //     doc.save().then(() => {
    //         console.log("Saved in DataBase.")
    //     });
    //     */
    // }
});

app.get('/item/:consumerserialnum', (req,res)=>{
    //query data
    //res.send(data)'
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){

    let db = client.db("test");
    let collection = db.collection("outgoingshipments");
        collection.find({}).toArray((err,doc) => {
            //outgoingshipments[i]
            if (err) {
                console.log("error in finding the document:", err)
            }
            else {
                let buffer =doc[0].file.buffer
                fs.writeFileSync('qrcode.html', buffer);
            }
        });
    });
});

//third collection name: "productsreturned"

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
    
    Mongoclient.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, async function(err,client){
        returnArray = await returnData(req.body.consumerserialnum);   
        //console.log(returnArray);
        //console.log(returnArray[0]);
        //console.log(returnArray[0].MFRID);

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
/*
app.get('/incoming',function(req,res) {
    var typeNumber = 4;
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData('Hi!');
    qr.make();
    fs.writeFileSync('./qr.html', qr.createImgTag());
    console.log('Wrote to ./qr.html');
    res.send("Saved");
});
*/

var server = app.listen(3000, function () {
    console.log("app running on port.", server.address().port);
});