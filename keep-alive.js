const axios = require('axios');

// Replace with your actual deployment URL
const URL = 'https://skillswap-platform-ovuw.onrender.com/api/health';

const keepAlive = async () => {
    try {
        console.log(`[${new Date().toISOString()}] Pinging ${URL}...`);
        const response = await axios.get(URL);
        console.log(`[${new Date().toISOString()}] Response: ${response.status} ${response.data.status}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error pinging server:`, error.message);
    }
};

// Ping every 14 minutes (Render free tier sleeps after 15 mins of inactivity)
setInterval(keepAlive, 14 * 60 * 1000);

console.log('Keep-alive script started...');
keepAlive();
