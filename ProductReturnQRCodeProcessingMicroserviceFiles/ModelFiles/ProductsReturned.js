const mongoose = require('mongoose');
const ProductsReturned = new mongoose.Schema({
    "MFRID": Number,
    "BatchID": Number,
    "LotID": Number,
    "ProductSerialNumber": Number,
    "incomingquantity": Number,
    "outgoingquantity": Number,
    "UoM": String,
    "consumerserialnum": Number,
    "file": { data: Buffer, contentType: readFromBinaryFile}
});

module.exports = mongoose.model("productsreturned", ProductsReturned);