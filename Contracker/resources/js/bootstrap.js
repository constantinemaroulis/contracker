import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Enable withCredentials for cross-origin requests
axios.defaults.withCredentials = true;

