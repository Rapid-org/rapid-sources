const utils = require('./utils');
const stripe = require('stripe')('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');
exports.create_checkout_session = function(req, res) {
  const priceId = req.body.priceId;
  console.log(priceId)
  let token = utils.parseIdToken(req.headers);
  console.log("token", token);
  if (!token) {
    res.status(403).json({ error: 'No Credentials Sent!' });
    return;
  }
  utils.getUser(token, async function(uid, error) {
    if (uid) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: uid.email,
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: 'https://create.rapidbuilder.tech/pay?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://create.rapidbuilder.tech/pay?cancelled=true',
      });
      res.send(session.url)
    }
  })
}


