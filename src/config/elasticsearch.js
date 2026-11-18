
const { Client } = require("@elastic/elasticsearch");

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
});

module.exports = elasticClient;
