// index.js
const { startHelloWorldWorkflow } = require('./client/temporalClient');

async function main() {
    const result = await startHelloWorldWorkflow('World');
    console.log(result);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});