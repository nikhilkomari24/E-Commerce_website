const express = require('express');
const bodyParser = require("body-parser");
const app = express();

app.listen(4000, () => console.log('listening at 4000'));

//app.use(express.static('index.html'));
app.use('/', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json());

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
    //console.log(masterList);
    mongoose.connection.db.collection('masterList').insertOne(request.body, function (err, output) {
        if (err) {
            response.send({ success: "false" });
        }
        else {
            response.send({ success: "true" })

        }

    });
})

app.put('/editbyadmin', (request, response) => {
    console.log('put edit successful');
})

app.delete('/delbyadmin', (request, response) => {
    console.log('delete item successful');
})

app.delete('/purchased', (request, response) => {
    console.log('purchase item successful');
})

