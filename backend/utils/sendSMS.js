const sendSMS = async (phoneNumber, message) => {
    try {
        console.log(`\n========================================`);
        console.log(`[SMS MOCK SERVICE] Sending to: ${phoneNumber}`);
        console.log(`[MESSAGE ENVELOPE]:`);
        console.log(message);
        console.log(`========================================\n`);
        
        // TODO: Integrate actual SMS gateway like Twilio here for production
        // Example:
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to: phoneNumber });
        
        return true;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        return false;
    }
};

module.exports = sendSMS;
