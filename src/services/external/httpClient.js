import axios from 'axios';
import { ServiceUnavailableError } from '../../utils/app-errors.js'; // Import only ServiceUnavailableError
import HttpMessage from './HttpMessage.js';


class HttpClient {

    /**
     * Call a service via HTTP.
     * @param {string} serviceName - The name of the service to call.
     * @param {string} eventName - The event or endpoint to call.
     * @param {object} payload - The payload to send in the request.
     * @returns {Promise<object>} - The response from the service.
     */
    async callService(serviceUrl, eventName, payload, metadata = {}) {
        console.log(`Calling service at ${serviceUrl} for event: ${eventName}`);

        // Create a structured HTTP message
        const message = new HttpMessage(eventName, payload, metadata);
        console.log("Message to be sent:", message);
        try {
            const response = await axios.post(serviceUrl, message, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log("Response from service:", response.data);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.log("here am hooooola")
                throw new ServiceUnavailableError(
                    `Service at ${serviceUrl} returned ${error.response.status}: ${JSON.stringify(error.response.data)}`
                );
            } else if (error.request) {

                throw new ServiceUnavailableError(
                    `Service at ${serviceUrl} is unreachable: ${error.message}`
                );
            } else {
                throw new ServiceUnavailableError(
                    `Error calling service at ${serviceUrl}: ${error.message}`
                );
            }
        }
    }
}

export default HttpClient;