require('./models/usersModel');
require('./models/projectsModel');
const config = require('./config');
const cors = require('cors');
const paypal = require('paypal-node-sdk');
const rateLimit = require('express-rate-limit')
const express = require('express'),
    https = require('https')
    app = express(),
    fs = require('fs'),
    port = config.web.port,
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');
var privateKey;
var certificate;
if (process.env.NODE_ENV !== "development") {
  privateKey = fs.readFileSync('sslcert/privkey.pem', 'utf8');
  certificate = fs.readFileSync('sslcert/fullchain.pem', 'utf8');
}
var credentials = {key: privateKey, cert: certificate};

const admin = require('firebase-admin');

if (process.env.NODE_ENV === 'development') {
  admin.initializeApp();
} else {
  const serviceAccount = require("./rapid-b9abe-firebase-adminsdk-m3hpy-ddf1a44208.json");
  admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
}
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.url).then(() => {
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error:'));

const stripe = require('stripe')('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');
app.use('/webhook', bodyParser.raw({type: "*/*"}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = 'whsec_CnqwXlLcocESOv688fTkBTw4ih0DrIGe'

  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  console.log(eventType)
  //console.log(data)
  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      await updateUserPlan(data)
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      let email = data.object.customer_details.email
      admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
        { plan: "free", paymentFailed: true }).then(r => console.log(r))
      break;
    case 'customer.subscription.deleted':
      let email1 = data.object.customer_details.email
      admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email1)).uid,
        { plan: "free"}).then(r => console.log(r))
      break;
    default:
    // Unhandled event type
  }

  res.sendStatus(200);
});
async function updateUserPlan(data) {
  console.log(data)
  let email = data.object.customer_details.email
  let checkoutSession = await stripe.checkout.sessions.retrieve(data.object.id, { expand: ['line_items'] });
  let price_id = checkoutSession.line_items.data[0].price.id;
  if (price_id === "price_1LqdyMI4LEwWiy5R6dUIxiBf") { // basic
    admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
      { plan: "basic" }).then(r => console.log(r))
  } else if (price_id === "price_1LqdyhI4LEwWiy5RN4EzqMWb") { // professional
    admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
      { plan: "professional" }).then(r => console.log(r))
  } else if (price_id === "price_1Lqdz0I4LEwWiy5RUsUs3azk") { // professional
    admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
      { plan: "premium" }).then(r => console.log(r))
  } else if (price_id === "price_1LqdzHI4LEwWiy5ROdt6YWKb") { // professional
    admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
      { plan: "enterprise" }).then(r => console.log(r))
  } else {
    admin.auth().setCustomUserClaims((await admin.auth().getUserByEmail(email)).uid,
      { plan: "free" }).then(r => console.log(r))
  }
}
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

//var options = {
  //  inflate: true,
    //limit: '50mb',
    //type: '*/*'
 // };
//app.use(bodyParser.raw(options));
app.use(cors());

const routes = require('./serverRoutes');
routes(app);

db.once('open', () => {
  if (process.env.NODE_ENV === 'development') {
    app.listen(port, () => {
      console.log(`Rapid server running on port ${config.web.port}`);
    });
  } else {
    const server = https.createServer(credentials, app);
    server.listen(port, () => {
      console.log(`Rapid server running on port ${config.web.port}`);
    });
  }

    /*const Projects = db.collection('projects');
    const changeStream = Projects.watch();

    changeStream.on('change', (change) => {
        console.log(change);
    });*/
});
