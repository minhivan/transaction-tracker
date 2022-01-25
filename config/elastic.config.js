const elasticsearch = require('elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client( {
    hosts: [
        process.env.ELASTIC_URL
    ]
});

module.exports = client;
