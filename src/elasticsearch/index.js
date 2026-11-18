const elasticsearchConfig = require("../config/elasticsearch");

const client =
    elasticsearchConfig.client ||
    elasticsearchConfig.esClient ||
    elasticsearchConfig;

const INDEX = "quirehire_jobs";

async function initializeElasticsearch() {
    const exists = await client.indices.exists({
        index: INDEX,
    });

    if (!exists) {
        await client.indices.create({
            index: INDEX,
            mappings: {
                properties: {
                    jobId: { type: "keyword" },
                    title: {
                        type: "text",
                        fields: {
                            keyword: { type: "keyword" },
                        },
                    },
                    description: { type: "text" },
                    companyName: { type: "text" },
                    location: { type: "text" },
                    skills: { type: "text" },
                    jobType: { type: "keyword" },
                    status: { type: "keyword" },
                    salaryMin: { type: "integer" },
                    salaryMax: { type: "integer" },
                    createdAt: { type: "date" },
                },
            },
        });

        console.log(`Elasticsearch index created: ${INDEX}`);
    } else {
        console.log(`Elasticsearch index already exists: ${INDEX}`);
    }
}

module.exports = {
    client,
    INDEX,
    initializeElasticsearch,
};