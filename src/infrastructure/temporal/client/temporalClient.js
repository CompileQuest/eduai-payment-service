import { Connection, Client } from '@temporalio/client';
import { helloWorldWorkflow } from '../workflows/helloWorldWorkflow.js';

async function createTemporalClient() {
    const connection = await Connection.connect({
        address: 'eu-west-1.aws.api.temporal.io:7233', // Replace with your Temporal Cloud endpoint
        tls: true, // Enable TLS for Temporal Cloud
        apiKey: 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ild2dHdhQSJ9.eyJhY2NvdW50X2lkIjoibG9uNHgiLCJhdWQiOlsidGVtcG9yYWwuaW8iXSwiZXhwIjoxODA0MzY3NTI0LCJpc3MiOiJ0ZW1wb3JhbC5pbyIsImp0aSI6ImRvaTZ6YmFJekh0Nm1kMUFSd1ZaNFN0ZmFUTU4wM00yIiwia2V5X2lkIjoiZG9pNnpiYUl6SHQ2bWQxQVJ3Vlo0U3RmYVRNTjAzTTIiLCJzdWIiOiI1ODJlNWQwNzcyMTc0MTI3OTkyOTAwODVmYTViODlkOCJ9.7KXfj4h9Hdj2ZZr4SeUpU4yiDkmgDbPVkgZ1NfIoeYGlQUz2pcht6X3fn9o9zVJ84PQGADIeH6qqEYxM2zS1Lg', // Replace with your API Key
        metadata: {
            'temporal-namespace': 'eduai.lon4x', // Replace with your namespace and account ID
        },
    });

    const client = new Client({
        connection,
        namespace: 'eduai.lon4x', // Replace with your namespace and account ID
    });

    return client;
}

async function startHelloWorldWorkflow(name) {
    const client = await createTemporalClient();

    const result = await client.workflow.execute(helloWorldWorkflow, {
        taskQueue: 'hello-world-queue',
        workflowId: `hello-world-workflow-${Date.now()}`,
        args: [name],
    });

    return result;
}

export { startHelloWorldWorkflow };