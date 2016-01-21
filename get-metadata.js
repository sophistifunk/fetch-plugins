"use strict";

var Promise = require("bluebird");
var request = require("request-promise");
var fs = Promise.promisifyAll(require("fs"));
var helpers = require("./helpers.js");

//---[ Config ]---------------------------------------------------------------------------------------------------------

const updateUrl = "https://updates.jenkins-ci.org/current/update-center.json"; // Not real JSON
const prefix = "updateCenter.post(\n";
const suffix = "\n);";

const ofileUpdates = "update-center-response.json";

const usageUrl = "http://stats.jenkins-ci.org/plugin-installation-trend/latestNumbers.json";
const ofileUsage = "usage-stats-response.json";

//---[ Helpers ]--------------------------------------------------------------------------------------------------------

const parseJSON = helpers.parseJSON;

function get(url) {
    console.log(url, "loading...");
    return request.get(url)
        .then(function (result) {
            console.log(url, result.length, "chars returned.");
            return result;
        })
}

//---[ Main ]-----------------------------------------------------------------------------------------------------------

console.log("Getting plugin metadata from jenkins-ci.org");

if (!String.prototype.startsWith) throw new Error("Need String.prototype.startsWith, suggest Node 4+");

get(updateUrl)
    .then(result => {
        if (!result.startsWith(prefix) || !result.endsWith(suffix)) {
            throw new Error("Unexpected result format :(");
        }
        result = result.substr(prefix.length, result.length - prefix.length - suffix.length);
        return result;
    })
    .then(parseJSON)
    .then(obj => {
        console.log("Top-level object has", Object.keys(obj));
        obj.__comment = "Fetched from " + updateUrl + " on " + new Date();
        return JSON.stringify(obj, null, 4);
    })
    .then(niceJSON => {
        return fs.writeFileAsync(ofileUpdates, niceJSON, "utf8");
    })
    .then(() => {
        console.log("Wrote", ofileUpdates);
        return get(usageUrl);
    })
    .then(parseJSON)
    .then(usageData => {
        usageData.__comment = "Fetched from " + usageUrl + " on " + new Date();
        return fs.writeFileAsync(ofileUsage, JSON.stringify(usageData, null, 4), "utf8");
    })
    .then(() => {
        console.log("Wrote", ofileUsage);
    });


