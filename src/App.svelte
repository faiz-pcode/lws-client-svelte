<script>
    import Pusher from 'pusher-js';
    import { onDestroy } from 'svelte';
    import Account from './components/Account.svelte';
    import { token, websocket_connected } from './store';

    const apiUrl = __myapp.env.API_URL;
    const wsAuthUrl = __myapp.env.PUSHER_AUTH_URL;
    const wsAppKey = __myapp.env.PUSHER_APP_KEY;
    const wsAppId = __myapp.env.PUSHER_APP_ID;
    const wsHost = __myapp.env.WS_HOST;
    const wsPort = __myapp.env.WS_PORT;

    let pusher,
        channel,
        token_value;

    const token_unsubscribe = token.subscribe(value => token_value = value);

    onDestroy(() => {
        unsubscribe();
    });

    function connect() {
        console.log('Connecting...');
        pusher = new Pusher(wsAppKey, {
            wsHost: wsHost,
            wsPath: "",
            httpHost: wsHost,
            httpPath: "",
            wsPort: parseInt(wsPort),
            forceTLS: false,
            disableStats: true,
            authEndpoint: wsAuthUrl,
            auth: {
                headers: {
                    'X-App-ID': wsAppId,
                    'Authorization': 'Bearer ' + token_value
                }
            },
            enabledTransports: ['ws']
        });

        pusher.connection.bind('connected', () => {
            websocket_connected.set(true);
            console.log('websocket connected');
            console.log('Pusher object', pusher);
        });

        pusher.connection.bind('disconnected', () => {
            websocket_connected.set(false);
            console.log('websocket disconnected');
            console.log('Pusher object', pusher);
        });
    }

    function disconnect() {
        pusher.disconnect();
    }

    function subscribe() {
        console.log('Subscribing to private-notification channel')
        channel = pusher.subscribe('private-notification');
        
        channel.bind('pusher:subscription_succeeded', () => {
            console.log('Subscription succeeded');
            console.log('Binding to table-checkin event')
            channel.bind('table-checkin', (data) => {
                console.log(data);
            });
            console.log('Binding to bill-request event')
            channel.bind('bill-request', (data) => {
                console.log(data);
            });
        });

        channel.bind('pusher:subscription_error', (err) => {
            console.log('Subscription failed.', err);
            channel.unbind();
            pusher.unsubscribe('private-notification');
            channel = null;
        });
    }

    function unsubscribe() {
        console.log('Unsubscribing from private-notification channel')
        channel.unbind();
        pusher.unsubscribe('private-notification');
        channel = null;
    }
</script>

<main>
    <div class="main-div">
        <Account apiUrl={apiUrl}/>
        <section class="w-90">
            <h1>PCode F&B Websocket Client Example</h1>
            <p>Websocket connected: {$websocket_connected}</p>
            <button on:click={connect}>Connect!</button>
            <button on:click={disconnect}>Disconnect!</button>
            <button on:click={subscribe}>Subscribe!</button>
            <button on:click={unsubscribe}>Unsubscribe!</button>
        </section>
    </div>
</main>

<style>
    main {
        text-align: center;
        max-width: 240px;
        margin: 0 auto;
        height: 100%;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
    .main-div {
        display: flex;
        flex-direction: row;
        height: 100%;
    }

    .w-90 {
        width: 90%;
    }
</style>