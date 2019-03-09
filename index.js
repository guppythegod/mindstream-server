require('dotenv').config();

// Initialize using signing secret from environment variables
const { createEventAdapter } = require('@slack/events-api');
const admin = require('firebase-admin');
const serviceAccount = require('./key.json');
const slackEvents = createEventAdapter(process.env.SLACK_TOKEN);
const port = process.env.PORT || 8000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://guppy-mindstream.firebaseio.com'
});

const db = admin.firestore();

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
    if (event.channel === "CGUMELKRV") {
        const d = new Date(Date.now());
        db.collection("thoughts").doc().set({
            message: event.text,
            date: {
                month: d.getMonth()+1,
                year: d.getFullYear(),
                day: d.getDate()
            },
            minute: {
                hour: d.getHours(),
                minute: d.getMinutes()
            }
        }).then(function() {
            console.log("Document successfully written!");
        }).catch(function(error) {
            console.error("Error writing document: ", error);
        });

    }
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start a basic HTTP server
slackEvents.start(port).then(() => {
    console.log(`server listening on port ${port}`);
});