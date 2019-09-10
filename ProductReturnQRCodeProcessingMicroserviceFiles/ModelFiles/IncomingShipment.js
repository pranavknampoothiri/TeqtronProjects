const mongoose = require('mongoose');
const IncomingShipment = new mongoose.Schema({
    "MFRID": Number,
    "BatchID": Number,
    "LotID": Number,
    "ProductSerialNumber": Number,
    "incomingquantity": Number,
    "outgoingquantity": Number,
    "UoM": String
});

module.exports = mongoose.model("incomingshipments", IncomingShipment);