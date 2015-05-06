var express = require('express');
var app = express();

app.use(express.static(__dirname + '/.tmp'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/assets', express.static(__dirname + '/app/assets'));

app.route('/*').get(function(req, res) {
    res.sendFile(__dirname + '/.tmp/index.html');
});

app.listen(80);
console.log('\n----------------------------------\n' +
            'Magic happns on http://easymoney.ge/' +
            '\n----------------------------------\n\n');