var Promise = require("bluebird");
var request = require("request-promise");
var fs = Promise.promisifyAll(require("fs"));

//---[ Config ]---------------------------------------------------------------------------------------------------------

var updateUrl = "https://updates.jenkins-ci.org/current/update-center.json"; // Not real JSON
var prefix = "updateCenter.post(\n";
var suffix = "\n);";

var ofileUpdates = "update-center-response.json";

// --

var usageUrl = "http://stats.jenkins-ci.org/plugin-installation-trend/latestNumbers.json";
var ofileUsage = "usage-stats-response.json";

//---[ Helpers ]--------------------------------------------------------------------------------------------------------

var parseJSON = JSON.parse.bind(JSON);

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
    .then(function (result) {
        if (!result.startsWith(prefix) || !result.endsWith(suffix)) {
            throw new Error("Unexpected result format :(");
        }
        result = result.substr(prefix.length, result.length - prefix.length - suffix.length);
        return result;
    })
    .then(parseJSON)
    .then(function (obj) {
        console.log("Top-level object has", Object.keys(obj));
        obj.__comment = "Fetched from " + updateUrl + " on " + new Date();
        return JSON.stringify(obj, null, 4);
    })
    .then(function (niceJSON) {
        return fs.writeFile(ofileUpdates, niceJSON, "utf8");
    })
    .then(function () {
        console.log("Wrote", ofileUpdates);
        return get(usageUrl);
    })
    .then(parseJSON)
    .then(function (usageData) {
        return fs.writeFile(ofileUsage, JSON.stringify(usageData, null, 4), "utf8");
    })
    .then(function () {
        console.log("Wrote", ofileUsage);
    })
;


