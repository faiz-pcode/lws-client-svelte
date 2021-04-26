<script>
    
    import { token, websocket_connected, channel_events } from '../store.js';
    import { onMount } from 'svelte';

    let staffId = "", password = "", platform = "", account, ws_connected, disable_logout = true;
    let selection = [], selected;
    export let apiUrl;

    onMount(async () => {
        loadJSON(response => {
            let jsonResponse = JSON.parse(response);
            selection = typeof(jsonResponse.Selections) === 'undefined' ? [] : jsonResponse.Selections;
        });
    });
    
    // https://gist.github.com/laurenancona/bd560948d71054e3d1477e43c4d48cb6
    function loadJSON(callback) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'accounts.json', true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState === 4) {
                if (xobj.status == "200") {
                    // .open will NOT return a value but simply returns undefined in async mode so use a callback
                    callback(xobj.responseText);
                } else {
                    callback("{}");
                }
            }
        }
        xobj.send(null);
    }

    const websocket_connected_unsubscribe = websocket_connected.subscribe(value => ws_connected = value);

    $: status = account ? 'Logged In' : 'Logged Out';
    $: loggedIn = account ? true : false;
    $: disable_logout = loggedIn ? loggedIn === ws_connected : true;
    $: name = account ? `${account.data.first_name} ${account.data.last_name}` : "Guest";
    $: code = account ? account.data.code : null;

    function login() {
        const body = {
                staff_id: staffId,
                password: password,
                platform: platform
        };
        const url = apiUrl + "/employees/login";
        const opt = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(body)
        };
        console.log('Logging in...');
        status = 'Logging in...';
        fetch(url, opt)
        .then(response => response.json())
        .then(data => {
            console.log('Logged In');
            console.log("data: ", data);
            account = data;
            token.update(val => val = account.token);
            channel_events.update(val => {
                val.channel = selected.subList.channel;
                val.events = selected.subList.events;
                return val;
            });
        })
        .catch(error => {
            console.error(error);
        });
    }

    function logout() {
        const url = apiUrl + "/employees/logout";
        const opt = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': 'Bearer ' + account.token
            }
        }
        console.log('Logging out...');
        status = 'Logging out...';
        fetch(url, opt)
        .then(response => {
            console.log('Logged Out')
            account = null;
            token.set(null);
            channel_events.set({
                "channel": "",
                "events": []
            });
        })
        .catch(error => console.error(error));
    }

    function autoFill() {
        staffId = selected.staffId;
        password = selected.password;
        platform = selected.platform;
    }

    function clearField() {
        staffId = "";
        password = "";
        platform = "";
    }
</script>

<section class="w-10">
    <input class="text-box" bind:value={staffId} type="text" placeholder="User ID">
    <input class="text-box" bind:value={password} type="password" placeholder="Password">
    <input class="text-box" bind:value={platform} type="text" placeholder="Platform">
    {#if !selection.length}
        <span>accounts.json not found</span>
    {/if}
    <select bind:value={selected} on:blur={autoFill}>
        {#if !selection.length}
            <option value=null>-----</option>
        {:else}
            {#each selection as option}
                <option value={option}>{option.text}</option>
            {/each}
        {/if}
    </select>
    <button on:click={autoFill} disabled={!selection.length}>Autofill!</button>
    <button on:click={clearField}>Clear</button>
    <p>Status: {status}</p>
    <p>Name: {name}</p>
    <p>Auth Code: {code}</p>
    <button on:click={login} disabled={loggedIn}>Login</button>
    <button on:click={logout} disabled={disable_logout}>Logout</button>
</section>

<style>
    section {
        width: 10%;
        padding-top: 1rem;
        background-color: bisque;
    }

    .text-box {
        width: 90%;
        margin: 0.5rem;
    }
</style>