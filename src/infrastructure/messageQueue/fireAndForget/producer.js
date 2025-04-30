class Producer {
    constructor(channel) {
        this.channel = channel;
    }

    async produceMessage(exchange, routingKey, payload) {
        try {
            // Ensure the exchange exists before publishing
            await this.channel.assertExchange(exchange, 'topic', { durable: true });

            // Send the message to the specified exchange with the routing key
            this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)));

            console.log(`Sent message to exchange '${exchange}' with routing key '${routingKey}':`, payload);
            return true;
        } catch (error) {
            console.error("Error producing message:", error);
            return false;
        }
    }
}

export default Producer;