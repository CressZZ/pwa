let express = require('express');
let app = express();
const path = require('path');

app.use(express.static(__dirname));
// app.use(express.static('styles'));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});

