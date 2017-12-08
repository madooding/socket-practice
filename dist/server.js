'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var router = _express2.default.Router();
var port = 8080;

var currentColor = "FFFF00";

app.use((0, _cors2.default)());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());
app.use((0, _compression2.default)());
app.use((0, _morgan2.default)('common'));

app.all('/', function (req, res, next) {
    res.json({
        'messages': 'Hello, world.'
    });
    next();
});

app.get('/currentBG', function (req, res, next) {
    res.json({
        'background-color': currentColor
    });
});

app.use('/', router);

var server = app.listen(port, function () {
    console.log('Starting Chat server at port ' + port);
});

var io = _socket2.default.listen(server);

io.of('/currentBG').on('connection', function (socket) {
    socket.on('change', function (data) {
        currentColor = data.color;
        io.of('/currentBG').emit('change', {
            color: currentColor
        });
        console.log("Color changed to #" + currentColor);
    });
});