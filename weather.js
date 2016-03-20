#!/usr/bin/env node

var http = require('request'),
    jsonPath = require('JSONPath'),
    lang = require('./lang/en_US'),
    fs  = require('fs'),
    program = require('commander');

program
    .version('0.0.1')
    .option('-q, --query [query]', 'Query - "44708", "Canton,OH", etc')
    .option('-t, --type [type]', 'Report Type (conditions|)')
    .option('-r, --raw', 'Raw JSON output')
    .parse(process.argv);

const API_KEY = "134ef56af179720e";

var args = {};
// check for rc file
var readConfig = new Promise(function(resolve, reject) {
    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    fs.readFile(homeDir + "/.weather.json","utf-8", function (err, data) {
        debugger;
        if (typeof(data) === "undefined" || program.query) {
            reject();
            return;
        }

        var jsonData = JSON.parse(data);
        resolve(jsonData);
    });
});

readConfig.then(function(config) {
    if (!config.query) {
        console.log("A location query is required");
        process.exit(1);
    }
    
    var requestArgs = config;
    requestArgs.url = buildURL(config);
    makeRequest(requestArgs);

}, function() {
    if (!program.query) {
        console.log("A location query is required");
        process.exit(1);
    }

    var requestArgs = program;
    requestArgs.url = buildURL(requestArgs);
    makeRequest(requestArgs);
});

function makeRequest(options) { 
    http.get(options, function(error, response, body) {
        var jsonBody = JSON.parse(body),
            reportType = options.type || "conditions",
            fieldMap = fieldMaps()[reportType];

        if (options.raw) {
            console.log(body);
        } else {
            fieldMap.forEach(function(field) {
                console.log(lang[field] + ": " + jsonPath.eval(jsonBody, field)[0]);
            });
        }
    });
}

function buildURL(args) {
    var baseURL = "http://api.wunderground.com/api/" + API_KEY,
        endPoint = args.type || "conditions",
        location = args.query,
        responseType = args.responseType || "json",
        url = `${baseURL}/${endPoint}/q/${location}.${responseType}`;

    logDebug(url);

    return url; 
}

function logDebug(out) {
    if (process.env.DEBUG) {
        console.log('\033[0;33mDEBUG: ' + out + '\033[0m');
    }
}

// JSONPath field
function fieldMaps() {
    return {
        'conditions': [
           "current_observation.display_location.full",
           "current_observation.display_location.zip",
           "current_observation.temp_f",
           "current_observation.temp_c",
           "current_observation.relative_humidity",
           "current_observation.weather",
           "current_observation.wind_string",
        ]
    };
}
