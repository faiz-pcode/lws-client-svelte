# PCFnB Websocket Client Example

As always, first run the following command 
```
npm install 
```
in the CLI to download all the dependencies.


Then copy the `.env.example` file and rename it to `.env` or by running the following command
```
cp .env.example .env
```
and edit the .env file according to your local environment setting.

Download the `accounts.json` file from the confluence documentation you came from and put that file in the public folder.

Now you are ready to run the application, run the following command
```
npm run dev
```

This should start a local webserver at `http://localhost:5000`. Navigate to that address using your preferred browser.

To view incoming events, use the browser dev tool and check the console tab.
