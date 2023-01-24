require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const line = require('@line/bot-sdk');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

const express = require('express');
const app = express();
const port = 3000;

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});
app.listen(port, () => {
    console.log(`app is running on port ${port}`)
})

function handleEvent (event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    return openai.createCompletion({
        model: "text-davinci-003",
        prompt: event.message.text,
    }).then(response => {
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: response.data.choices[0].text
        });
    });
}