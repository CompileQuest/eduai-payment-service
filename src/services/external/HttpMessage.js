import { v4 as uuidv4 } from 'uuid';
import { SERVICE_NAME } from '../../config/index.js';

export default class HttpMessage {
    constructor(type, payload, metadata = {}) {
        this.id = uuidv4(); // Generate a UUID
        this.type = type; // Message type (e.g., "user.deleted", "video.delete")
        this.timestamp = new Date().toISOString(); // Current timestamp
        this.source = SERVICE_NAME; // Source of the message
        this.payload = { ...payload, event: type }; // Include event name in the payload
        this.transportType = "http"; // "http" or "broker"
        this.metadata = { retries: 0, priority: "normal", ...metadata }; // Default metadata
    }
}
