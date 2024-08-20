const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': '66be65815406cc001a96425f',
            'PLAID-SECRET': '597b146a0c71964b2d3b39975bd671',
        },
    },
});

const plaidClient = new PlaidApi(configuration);
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/hello", (request, response) => {
    response.json({message: "hello " + request.body.name});
});

app.post('/create_link_token', async function (request, response) {
    const plaidRequest = {
        user: {
            client_user_id: 'user',
        },
        client_name: 'Plaid Test App',
        products: ['auth'],
        language: 'en',
        redirect_uri: 'http://localhost:3002/',
        country_codes: ['US'],
    };
    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error) {
        console.error("Error creating link token:", error);
        response.status(500).send("Failed to create link token");
    }
});

app.post("/auth", async function(request, response) {
   try {
       const access_token = request.body.access_token;
       const plaidRequest = {
           access_token: access_token,
       };
       const plaidResponse = await plaidClient.authGet(plaidRequest);
       response.json(plaidResponse.data);
   } catch (error) {
       console.error("Error getting auth data:", error);
       response.status(500).send("Failed to get auth data");
   }
});

app.post('/exchange_public_token', async function (request, response) {
    const publicToken = request.body.public_token;
    try {
        const plaidResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        const accessToken = plaidResponse.data.access_token;
        response.json({ accessToken });
    } catch (error) {
        console.error("Error exchanging public token:", error);
        response.status(500).send("Failed to exchange public token");
    }
});

app.listen(8000, () => {
   console.log("Server has started on port 8000");
});
