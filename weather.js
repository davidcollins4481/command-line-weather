#!/usr/bin/env node

var http = require('request'),
    argv = require('yargs').argv,
    jsonPath = require('JSONPath'),
    lang = require('./lang/en_US'),
    fs  = require('fs');

const API_KEY = "134ef56af179720e";

var args = {};

// check for rc file

var readConfig = new Promise(function(resolve, reject) {
    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    fs.readFile(homeDir + "/.weather.json","utf-8", function (err, data) {
        if (typeof(data) === "undefined") {
            reject();
            return;
        }

        var jsonData = JSON.parse(data);
        args.location = jsonData.zipcode;

        resolve({
            location: jsonData.zipcode,
            reportType: jsonData.reportType
        });
    });
});

readConfig.then(function(config) {
    if (!config.location) {
        console.log("A location is required");
        process.exit(1);
    }

    makeRequest({ url: buildURL(config), reportType: config.reportType });

}, function() {
    if (argv.zipcode) {
        args.location = argv.zipcode;
    }

    if (!args.location) {
        console.log("A location is required");
        process.exit(1);
    }

    makeRequest({ url: buildURL(args), type: argv.reportType });

});

function makeRequest(options) { 
    http.get(options, function(error, response, body) {
        var jsonBody = JSON.parse(body),
            reportType = options.reportType || "conditions",
            fieldMap = fieldMaps()[reportType];

        fieldMap.forEach(function(field) {
            console.log(lang[field] + ": " + jsonPath.eval(jsonBody, field)[0]);
        });
    });
}

function buildURL(args) {
    var baseURL = "http://api.wunderground.com/api/" + API_KEY,
        endPoint = args.dataPoint || "conditions",
        location = args.location,
        responseType = args.responseType || "json";

    return `${baseURL}/${endPoint}/q/${location}.${responseType}`;
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



