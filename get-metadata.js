
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
var ofileUsage = "update-center-response.json";

//---[ Helpers ]--------------------------------------------------------------------------------------------------------

var parseJSON = JSON.parse.bind(JSON);

//---[ Main ]-----------------------------------------------------------------------------------------------------------

console.log('Loading from "' + updateUrl + '".');

if (!String.prototype.startsWith) throw new Error("Need String.prototype.startsWith, suggest Node 4+");

request.get(updateUrl)
	.then(function(result){
		console.log("Got", result.length, "chars back");
		if (!result.startsWith(prefix) || !result.endsWith(suffix)) {
			throw new Error("Unexpected result format :(");
		}
		result = result.substr(prefix.length, result.length - prefix.length - suffix.length);
		return result;
	})
	.then(parseJSON)
	.then(function(obj) {
		console.log("Top-level object has", Object.keys(obj));
		obj.__comment = "Fetched from " + updateUrl + " on " + new Date();
		return JSON.stringify(obj,null,4);	
	})
	.then(function(niceJSON){
		return fs.writeFile(ofileUpdates, niceJSON, "utf8");
	})
	.then(function(){
		console.log("Wrote", ofileUpdates);
		console.log("Loading from \"" + usageUrl + "\"...");
		return request.get(usageUrl);
	})
	.then(parseJSON)
	.then(function(usageData) {
		
	})
	;


