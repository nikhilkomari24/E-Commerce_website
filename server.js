const express = require('express');
var cors = require('cors')
const bodyParser = require("body-parser");
const app = express();
// const expressSanitizer = require('express-sanitizer');

app.use(cors());

//app.use(express.static('index.html'));
app.use('/', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json());
//app.use(expressSanitizer());



const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Library", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:')); // enhance this
db.once('open', function () {
    console.log('Connected to the database (mongoose)')
        ;
});


function find(name, query, cb) {
    mongoose.connection.db.collection(name, function (err, collection) {
        collection.find(query).toArray(cb);
    });
}

//input validations

// Function that checks whether input text is an alphabetic character or not.
function inputAlphabet(inputtext) {
    var alphaExp = /^[a-zA-Z\s]+$/;
    if (inputtext.match(alphaExp)) {
        //document.getElementById('p1').innerText = '';
        return true;
    } else {
        //document.getElementById('p1').innerText = "* For your name please use alphabets only *"; // This segment displays the validation rule for name.
        //inputtext.focus();
        return false;
    }
}

//Function to validate type
function validateType(type) {
    switch (type.toLowerCase()) {
        case "book":
            return true;
        case "cd":
            return true;
        default:
            return false;
    }
}

//function to validate due value
function validateDue(dueValue) {
    var filter = new RegExp('^[0-9]+$');
    if (!filter.test(dueValue)) {
        return false;
    }
    return true;
}

//function to validate price value
function validatePrice(priceValue) {
    var filter = new RegExp('^[0-9]+$');
    if (!filter.test(priceValue)) {
        return false;
    }
    return true;
}

app.get('/genlibrary', (request, response) => {
    var respObj = [];
    find('masterList', {}, function (err, docs) {
        if (docs.length > 0) {
            docs.forEach(x => {
                respObj.push(x);
            })
            response.send(respObj);
        }
        else {
            response.send({ success: "false" });
        }
    });
});

app.post('/addbyadmin', (request, response) => {
    //masterList.unshift(request.body);
    // aName = request.sanitize(request.body.Name)
    // aDue = request.sanitize(request.body.Due)
    // aType = request.sanitize(request.body.Type)
    // aPrice = request.sanitize(request.body.Price)
    aName = request.body.Name
    aDue = request.body.Due
    aType = request.body.Type
    aPrice = request.body.Price
    //if (inputAlphabet(aName)) {
        if (validateDue(aDue)) {
            if (validateType(aType)) {
                if (validatePrice(aPrice)) {
                    mongoose.connection.db.collection('masterList').insertOne({Name:aName,Type:aType,Due:Number(aDue),Price:Number(aPrice),Picture:request.body.Picture}, function (err, output) {
        
                        if (err) {
                            response.send({ success: "false" });
                        }
                        else {
                            response.send({ success: "true" })

                        }

                    });
                } else {
                    response.send({ success: "false" });
                }

            } else {
                response.send({ success: "false" });
            }
        } else {
            response.send({ success: "false" });
        }
    //} else {
     //   response.send({ success: "false" });
    //}

})

app.put('/editbyadmin', (request, response) => {
    //if (validateType(request.sanitize(request.body.Type)))
    if (validateType(request.body.Type)) {
        //if (validateDue(request.sanitize(request.body.Due)))
        if (validateDue(request.body.Due)) {
            //if (validatePrice(request.sanitize(request.body.Price)))
            if (validatePrice(request.body.Price)) {
                mongoose.connection.db.collection('masterList')
                    .updateOne({ Name: request.body.Name, Type: request.body.Type }, { $set: { Due: Number(request.body.Due) , Price: Number(request.body.Price) }}, {}, function (err, output) {
                    //.updateOne({ Name: request.body.Name, Type: request.body.Type }, { $set: { Due: Number(request.sanitize(request.body.Due)) , Price: Number(request.sanitize(request.body.Price)) }}, {}, function (err, output) {
                        if (err) {
                            response.send({ success: "false", response: errtxt })
                        }
                        else {
                            response.send({ success: "true" })
                        }

                });
            } else {
                response.send({ success: "false" });
            }

        } else {
            response.send({ success: "false" });
        }
    } else {
        response.send({ success: "false" });
    }

})

app.delete('/delbyadmin', (request, response) => {
    //console.log('delete item successful');
    //mongoose.connection.db.collection('masterList').deleteOne({ Name: request.sanitize(request.body.Name), Type: request.sanitize(request.body.Type) }, (err, output) => {
    mongoose.connection.db.collection('masterList').deleteOne({ Name: request.body.Name, Type: request.body.Type }, (err, output) => {
        if (err) {
            response.send({ success: "false" });

        }
        else {
            response.send({ success: "true" })
        }
    });

})

app.delete('/purchased', (request, response) => {
    console.log('purchase item successful');
    mongoose.connection.db.collection('masterList').deleteMany({ 'Name': { $in: request.body.Name } }, (err, mongooseDeleteResult) => {
        if (err) {
            response.send({ success: "false" });
        }
        else {
            response.send({ success: "true" })
        }
    });
})

app.listen(4000, () => console.log('listening at 4000'));