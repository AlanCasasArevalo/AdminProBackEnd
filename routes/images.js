"use strict";
var express = require("express");
const fs = require("fs");

var app = express();

const path = require("path");

app.get("/:type/:img", (req, res, next) => {
    var type = req.params.type;
    var img = req.params.img;

    var pathImage = path.resolve(__dirname, `../upload/${type}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        const pathNoImage = path.resolve(__dirname, "../assets/no-img");
        res.sendFile(pathNoImage);
    }
});

module.exports = app;