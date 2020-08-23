
const config = require("config");

exports.development = exports.staging = exports.production = config.get("database");
