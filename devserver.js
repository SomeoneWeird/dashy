#!/usr/bin/node
var express = require('express'), app = express();
app.set('view options', {layout: false});
app.use(express.logger());
app.use(app.router);
app.use(express.static(__dirname));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.get('/', function(req, res) { res.sendfile('index.html') });
app.listen(8000);
