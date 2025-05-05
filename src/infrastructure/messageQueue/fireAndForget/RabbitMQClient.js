import { connect } from 'amqplib';
import config from './settings/config.js';
import Consumer from './consumer.js';
import Producer from './producer.js';
import BrokerMessage from './settings/brokerMessage.js';
import { SERVICE_NAME } from '../../../config/index.js';
class RabbitMQClient {
    constructor() {
        if (RabbitMQClient.instance) {
            return RabbitMQClient.instance;
        }

        this.isInitialized = false;
        this.producer = null;
        this.consumer = null;
        this.connection = null;
        this.producerChannel = null;
        this.consumerChannel = null;

        // Automatically initialize the connection when the class is instantiated
        this.initialize().then(() => {
            console.log("RabbitMQ client initialized automatically.");
        }).catch((error) => {
            console.error("Failed to initialize RabbitMQ client:", error);
        });

        RabbitMQClient.instance = this;
    }

    async initialize() {
        if (this.isInitialized) {
            console.log("RabbitMQ client is already initialized.");
            return;
        }

        try {
            this.connection = await connect(config.rabbitMQ.url);
            this.producerChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            // Assert the current service's exchange and queue
            await this.consumerChannel.assertExchange(config.rabbitMQ.exchange, 'topic', { durable: true });
            await this.consumerChannel.assertQueue(config.rabbitMQ.queue, { durable: true });

            // Collect all unique exchanges from bindings
            const exchanges = new Set();
            for (const binding of config.rabbitMQ.bindings) {
                exchanges.add(binding.exchange);
            }

            // Assert all exchanges
            for (const exchange of exchanges) {
                await this.consumerChannel.assertExchange(exchange, 'topic', { durable: true });
            }

            // Bind the queue to the exchanges with the specified routing keys
            for (const binding of config.rabbitMQ.bindings) {
                for (const routingKey of binding.routingKeys) {
                    await this.consumerChannel.bindQueue(config.rabbitMQ.queue, binding.exchange, routingKey);
                }
            }

            // Initialize producer and consumer
            this.producer = new Producer(this.producerChannel);
            this.consumer = new Consumer(this.consumerChannel, [config.rabbitMQ.queue]);

            this.consumer.consumeMessages();

            this.isInitialized = true;
            console.log("RabbitMQ client initialized successfully.");
        } catch (error) {
            console.error("RabbitMQ error:", error);
            throw error; // Re-throw the error to handle it outside
        }
    }

    async produce(routingKey, payload) {
        if (!this.isInitialized) {
            throw new Error("RabbitMQ client is not initialized.");
        }
        const message = new BrokerMessage(routingKey, payload);
        return await this.producer.produceMessage(config.rabbitMQ.exchange, routingKey, message);
    }
}

// Create and export a single instance of RabbitMQClient
const rabbitMQClient = new RabbitMQClient();
export default rabbitMQClient;