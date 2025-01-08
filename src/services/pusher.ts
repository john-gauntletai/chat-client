import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

// Enable pusher logging
Pusher.logToConsole = true;

export const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
});

export const globalChannel = pusher.subscribe('global'); 