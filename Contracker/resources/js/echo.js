import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// --- FOR DEBUGGING ONLY ---
// We are temporarily hardcoding these values to ensure the connection works.
// After this works, we will move them back to the .env file.

// ❗️ STEP 1: Copy your REVERB_APP_KEY from your .env file and paste it here.
// const REVERB_APP_KEY = 'wbrzodxpw9bbt57zxpdo'; nko6vqpdwuiruvrvk16v
const REVERB_APP_KEY = 'nko6vqpdwuiruvrvk16v';

const REVERB_HOST = 'localhost';
const REVERB_PORT = 8080;
const REVERB_SCHEME = 'http'; // Use 'http' for local development

console.log('--- DEBUGGING ECHO CONNECTION ---');
console.log('Attempting to connect with hardcoded values:');
console.log('Key:', REVERB_APP_KEY);
console.log('Host:', REVERB_HOST);
console.log('Port:', REVERB_PORT);
console.log('Scheme:', REVERB_SCHEME);
console.log('---------------------------------');


window.Echo = new Echo({
    broadcaster: 'reverb',
    key: REVERB_APP_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_SCHEME === 'https', // This will be false for local http
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    console.log(`Authorization successful for ${channel.name}`);
                    callback(null, response.data);
                })
                .catch(error => {
                    console.error(`Authorization FAILED for ${channel.name}`, error);
                    callback(new Error('Authorization failed'), null);
                });
            }
        };
    },
});

window.Echo.connector.pusher.connection.bind('state_change', function(states) {
    console.log("Pusher connection state changed from", states.previous, "to", states.current);
});
