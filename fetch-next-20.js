"use strict";

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var _ = require("lodash");
var path = require("path");
var helpers = require("./helpers.js");
var pace = require("pace");
var request = require("request"); // We'll need the non-promise version to monitor events

//---[ Config ]---------------------------------------------------------------------------------------------------------

const downloadCount = 20;
const sizeGuess = 1024 * 1024; // 1mb

const downloadsDir = "downloads";
const downloadsIndexFile = downloadsDir + path.sep + "index.json";

const pluginsIndexFile = "sorted-amended-plugins.json";

//---[ Helpers ]--------------------------------------------------------------------------------------------------------

const readFile = helpers.readFile;
const writeFile = helpers.writeFile;
const parseJSON = helpers.parseJSON;

function readDownloadsIndexFile() {
    return readFile(downloadsIndexFile).catch(() => "{}");
}

//---[ State ]----------------------------------------------------------------------------------------------------------

//var plugins = [];
//var

//---[ Main ]-----------------------------------------------------------------------------------------------------------

Promise.all([readFile(pluginsIndexFile), readDownloadsIndexFile()])
    .map(parseJSON)
    .spread((plugins, downloaded) => {
        var toDownload = _(plugins)
            .filter(plugin => !(plugin.name in downloaded))
            .take(downloadCount)
            //.map(plugin => [plugin.name, plugin.url])
            .value();

        var totalBytes = toDownload.length * sizeGuess; // This will be refined as headers come in.
        var bytesReceived = 0;

        var progressDisplay = pace(totalBytes);
        progressDisplay.op(0);

        return Promise.map(toDownload, fetchPlugin)
            .then(results => {
                // Results should be an array of {plugin, fileName} objects
                results.forEach(pair => {
                    console.log(pair.plugin.name, "==>", pair.fileName);
                });
            });

        function fetchPlugin(plugin) {

            return fetchBytes()
                .then(pluginBytes => {
                    var fileName = "XXXXX"; // extract this from URL for now

                    // TODO: save file contents

                    return fileName;
                })
                .then(fileName => {
                    return {
                        plugin, fileName
                    };
                });

            // Need to do our own Promising because we want to watch for headers and progress events
            function fetchBytes() {
                return new Promise((resolve, reject) => {
                    var req = request.get(plugin.url, (err, res, body) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(body);
                            }
                        });

                    req.on('response', res => {
                            /*
                             Once we get the Response, we can interrogate the headers for size, and start listening for
                             data events coming back in order to update the progress bar.
                             */

                            var len = parseInt(res.headers['content-length'], 10);

                            // Update the total expected bytes - remove the guess amount, add the real thing
                            totalBytes = totalBytes - sizeGuess + len;
                            progressDisplay.total = totalBytes;
                            progressDisplay.op(bytesReceived); // Re-render with new total

                            res.on('data', data => {
                                bytesReceived += data.length;
                                progressDisplay.op(bytesReceived); // Re-render with new progress amount
                            });
                        });
                });
            }
        }
    });