"use strict";

var Promise = require("bluebird");
var _ = require("lodash");
var helpers = require("./helpers.js");

//---[ Config ]---------------------------------------------------------------------------------------------------------

const updatesFile = "update-center-response.json";
const usageFile = "usage-stats-response.json";
const builtinsFile = "builtins.json";

const oFileJSON = "sorted-amended-plugins.json";
const oFileCSV = "sorted-install-counts.csv";

//---[ Helpers ]--------------------------------------------------------------------------------------------------------

// Dreaming of ES6 import syntax
const readFile = helpers.readFile;
const writeFile = helpers.writeFile;
const parseJSON = helpers.parseJSON;

//---[ Main ]-----------------------------------------------------------------------------------------------------------

Promise.all([readFile(updatesFile), readFile(usageFile), readFile(builtinsFile)])
    .then(jsonStrings => _.map(jsonStrings, parseJSON))
    .then(results => {
        // TODO: Slow ass fucking v8 ES6 progress --> var [updates, usages, builtins] = results;
        var updates = results[0];
        var usages = results[1];
        var builtins = results[2];
        //console.log("results.length", results.length);
        //console.log("       updates", Object.keys(updates).join(", "));
        //console.log("        usages", Object.keys(usages).join(", "));
        //console.log("      builtins", Object.keys(builtins).join(", "));

        // TODO: AGAIN --> var plugins = Object.values(updates.plugins);
        var plugins = Object.keys(updates.plugins).map(k => updates.plugins[k]);

        var csvRows = ['"Name","Install Count","Bundled"'];

        plugins.forEach(plugin => {
            var name = plugin.name;
            plugin.installCount = usages.plugins[name] || 0;
            plugin.isBundled = builtins.builtins.indexOf(name) >= 0;
        });

        plugins = _.sortBy(plugins, "installCount").reverse();

        // Build up simple CSV file now the plugins have been sorted
        csvRows = csvRows.concat(plugins.map(plugin => {
            return [plugin.name, plugin.installCount, plugin.isBundled].map(x=>'"' + x + '"').join(",");
        }));

        return writeFile(oFileCSV, csvRows.join("\n")).then(() => plugins);
    })
    .then(sorted => writeFile(oFileJSON, JSON.stringify(sorted, null, 4)))
    .then(() => {
        console.log("All Done!");
    });