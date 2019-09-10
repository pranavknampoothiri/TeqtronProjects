const mongoose = require('mongoose');
const OutgoingShipment = new mongoose.Schema({
    "MFRID": Number,
    "BatchID": Number,
    "LogID": Number,
    "ProductSerialNumber": Number,
    "incomingquantity": Number,
    "outgoingquantity": Number,
    "UoM": String,
    "consumerserialnum": Number,
    "qrCode":{ data: Buffer, contentType: Number }
});

module.exports = mongoose.model("outgoingshipments", OutgoingShipment);