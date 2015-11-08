#!/usr/bin/env node

var http = require('request'),
    argv = require('yargs').argv;

const API_KEY = "134ef56af179720e";

var args = {};

if (argv.zipcode) {
    args.location = argv.zipcode;
}

if (!args.location) {
    console.log("A location is required");
    process.exit(1);
}

args.dataPoint = argv.type || "conditions";

makeRequest({ url: buildURL(args), type: args.dataPoint });

function makeRequest(options) { 
    http.get(options, function(error, response, body) {
        //console.log(body);
        var fieldMapFunc = options.type + 'Map';
        debugger;
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
function conditionsMap() {
    return [
       "current_observation.display_location.full",
       "current_observation.display_location.zip",
       "current_observation.temp_f",
       "current_observation.temp_c",
       "current_observation.relative_humidity",
       "current_observation.weather",
       "current_observation.wind_string",
    ];
}


