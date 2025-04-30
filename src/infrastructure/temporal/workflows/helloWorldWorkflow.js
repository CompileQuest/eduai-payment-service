import { defineSignal, setHandler, sleep } from '@temporalio/workflow';

const greetSignal = defineSignal('greet');

async function helloWorldWorkflow(name) {
    let greeting = '';

    setHandler(greetSignal, (msg) => {
        greeting = `Hello, ${msg}`;
    });

    await sleep(1000); // Simulate waiting
    console.log('Function 1: Waiting for signal...');

    await sleep(1000); // Simulate processing
    console.log('Function 2: Processing signal...');

    await sleep(1000); // Simulate finalizing
    console.log('Function 3: Finalizing...');

    return greeting || `Hello, ${name}`;
}

export { helloWorldWorkflow };