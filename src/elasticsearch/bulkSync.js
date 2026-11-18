const prisma = require("../prisma");
const { initializeElasticsearch, client } = require("./index");
const { syncAllJobs } = require("./service");

async function main() {
    console.log("Initializing Elasticsearch index...");

    await initializeElasticsearch();

    console.log("Syncing jobs from PostgreSQL to Elasticsearch...");

    const result = await syncAllJobs();

    console.log(`Job sync completed. Total jobs indexed: ${result.total}`);
}

main()
    .catch((error) => {
        console.error("Elasticsearch bulk sync failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect().catch(() => { });
        await client.close().catch(() => { });
    });