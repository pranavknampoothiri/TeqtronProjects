var express = require("express");
var bodyParser = require("body-parser");
var axios = require('axios');
var app = express();
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://root:password1234@mycluster-1yve4.gcp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const Weather = require('../models/Weather')
const Distance = require('../models/Distance')

/* This is a small service, used to implement and MongoDB query
and retrieve data. In computing an average of the distance, I 
also manipulating retrieved data.
*/
app.get("/average", function(req, res) {
    Distance.find()
        .then(distances => {
            console.log(distances);
            a = 0;
            distances.forEach((element)=> {
                a = a + element.distance
            })
            b = a/(distances.length)
            console.log(b);
            res.send({"Average" : b})
        }).catch(err => {
            res.send({confirmation: 'fail',
            message: err.message
            });
        });
});

/* This is an HTTP post request, calling the third-party API
giving a distance between two zipcode inputs. The URL is stored
in the variable "rqst." Using the Axios library, I am able to 
make the request to the third-party API. A new "Distance" 
instance/document is made to store the data retrieved from the 
distance API (the instance is made with a model JS file with the
schema needed for the collection). It is then saved into MongoDB,
using a save function enabled by the Mongoose connection established
earier in this server.
*/
app.post("/distance", function(req, res) {
    var rqst = 'https://www.zipcodeapi.com/rest/yJ2trlSNPpRXf9kpE7yo6JUn4z9BxJdvAMSK5XuJXn9my5Ksec22lfAMgZxpLNeM/distance.json/' + '/' + req.body.zipcode1 + '/' + req.body.zipcode2
            axios.get(rqst, req.body)
            .then(data=> {
                let doc2 = new Distance({
                    "zipcode1": req.body.zipcode1,
                    "distance": data.data.distance,
                    "zipcode2": req.body.zipcode2
                });
                doc2.save().then(() => {
                    console.log('getting distance between zipcodes')
                    mongoose.connection.close()
                    res.send("Saved in database")
                })
                .catch(error => console.log(error)) 
            })
            .catch(error=> (res.send("Invalid Zip Code")));
});

/* This is a post request as well, calling another third-party API
that gives the weather data that I sought out for, the temperature 
and humidity at each zipcode. This API takes zipcode inputs as well
and sends many sets of information along with the temperature and 
weather. In order to extract the specific data that I want, I use 
the field "data" which stores the data following a request to a 
third-party API; from here I navigate through the provided JSON data
rooting from the "data" field and get the specific weather metric 
that I want, using dot notations.
Because there are multiple HTTP requests to this third-party API to 
get the temperature and humidity for each zip code, execution of the
different code blocks will happen out of order. Promises are implemented
to take care of it and establish asynchronous execution. A results 
field holds the weather data once objectifying the promises, and is 
used to create a "Weather" instance/document with the temperature and
humidity. Using this version of the data, I calculate the differences
between the weather data for each zip code, and store those in along
with the weather data in MongoDB.
*/
app.post("/weather", function(req, res) {
    var list = ["https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&zipcode=" + req.body.zipcode1 + "&oneobservation=true&app_id=DemoAppId01082013GAL&app_code=AJKnXv84fjrb0KIHawS0Tg",
    "https://weather.cit.api.here.com/weather/1.0/report.json?product=observation&zipcode=" + req.body.zipcode2 + "&oneobservation=true&app_id=DemoAppId01082013GAL&app_code=AJKnXv84fjrb0KIHawS0Tg"]

    var asyncOperation = function(request) {
        return new Promise(function(resolve, reject) {
            axios.get(request, req.body)
            .then(data=> resolve({
            "Humidity" : data.data.observations.location[0].observation[0].humidity ,
            "Temperature" : data.data.observations.location[0].observation[0].temperature
            }))
            .catch((error) => {
                res.send("Invalid Zipcode")
            }); 

        });
    }

    var promisesToMake = [asyncOperation(list[0]), asyncOperation(list[1])];
    var promises = Promise.all(promisesToMake);
    promises.then(function(results) {
        var humddiff = Math.abs((results[0].Humidity)-(results[1].Humidity));
        var tempdiff = Math.abs((results[0].Temperature)-(results[1].Temperature));
        console.log(req.body.zipcode2)
        let doc1 = new Weather({
            "Difference" : {
                "tempdiff" : tempdiff,
                "humddiff" : humddiff
            },
            "Zipcode1" :{
                "zipcode": req.body.zipcode1,
                "Humidity": results[0].Humidity,
                "Temperature": results[0].Temperature
            },
            "Zipcode2": {
                "zipcode": req.body.zipcode2,
                "Humidity": results[1].Humidity,
                "Temperature": results[1].Temperature
            }
        });
        console.log(doc1)
        doc1.save().then(() => {
            console.log('getting temp and humidity differences')
            mongoose.connection.close()
            res.send("Saved in Databbase")
        }).catch(error=> (console.log(error)));
    }).catch(function(error){
        console.log(error);
    });
});


var server = app.listen(2000, function () {
    console.log("app running on port.", server.address().port);
});