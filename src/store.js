import { writable } from 'svelte/store';

export const token = writable(null);
export const websocket_connected = writable(false);
export const channel_events = writable({
    channel: "",
    events: []
});