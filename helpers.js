"use strict";

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var _ = require("lodash");

//---[ Files ]----------------------------------------------------------------------------------------------------------

function readFile(name) {
    console.log(name, "reading...");
    return fs.readFileAsync(name, "utf8").then(x => {
        console.log(name, "...done!", x.length, "chars.");
        return x;
    });
}

function writeFile(name, text) {
    console.log(name, "writing...");
    return fs.writeFileAsync(name, text, "utf8")
        .then(() => {
            console.log(name, "...done!");
        })
}


//---[ Exports ]--------------------------------------------------------------------------------------------------------

module.exports = {

    readFile,
    writeFile,

    parseJSON: JSON.parse.bind(JSON)

};