import MessageHandler from '../messageHandler.js';

class Consumer {
    constructor(channel, queues) {
        this.channel = channel;
        this.queues = queues;
        this.messageHandler = new MessageHandler();
    }

    async consumeMessages() {
        try {
            for (const queue of this.queues) {
                await this.channel.consume(queue, async (msg) => {
                    if (msg !== null) {
                        console.log(`Received message from queue ${queue}:`, msg.content.toString());

                        // Parse the message
                        const parsedMessage = this.parseMessage(msg.content.toString());

                        if (parsedMessage) {
                            try {
                                // Process the message using MessageHandler
                                const result = await this.messageHandler.handleMessage(parsedMessage.type, parsedMessage.payload);

                                // If the message processed successfully, acknowledge it
                                if (result && result.success) {
                                    this.channel.ack(msg);
                                    console.log(`✅ Successfully processed and acknowledged message from ${queue}`);
                                } else {
                                    console.error(`❌ Failed processing message from ${queue}, not acknowledging.`, result);


                                    // todo this is commented out because we don't have a dead letter exchange configured for now !!! and for testingg purposes !!
                                    // this.channel.nack(msg, false, false); // Without DLX configured

                                    // Optionally: You could send it to a dead-letter queue here if needed
                                }
                            } catch (processingError) {
                                console.error(`🔥 Error while handling message from ${queue}:`, processingError);
                                // Don't acknowledge on processing error
                            }
                        } else {
                            console.error(`❌ Failed to parse message from ${queue}, not acknowledging.`);
                            // Optional: you can also nack or move to a dead-letter queue
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error consuming messages:", error);
        }
    }


    async consumeTest() {
        try {
            for (const queue of this.queues) {
                await this.channel.consume(queue, async (msg) => {
                    if (msg !== null) {
                        // Parse the message
                        const parsedMessage = this.parseMessage(msg.content.toString());
                        //console.dir(parsedMessage, { depth: null, colors: true })
                        // Process the message using MessageHandler
                        if (parsedMessage) {
                            this.messageHandler.handleMessage(parsedMessage.type, parsedMessage.payload);
                        }

                        // Do NOT acknowledge the message (it stays in the queue)
                    }
                }, { noAck: true }); // Prevents messages from being deleted
            }
        } catch (error) {
            console.error("Error in test consumption:", error);
        }
    }

    parseMessage(message) {
        try {
            return JSON.parse(message); // Convert string to JSON object
        } catch (error) {
            console.error("Failed to parse message:", error);
            return null;
        }
    }
}

export default Consumer;