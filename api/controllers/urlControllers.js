const validUrl = require('valid-url');
const shortid = require('shortid');

// import the Url database model
const Url = require('../models/urlsModel');
exports.shorten_url = async (req, res) => {
    const {
        longUrl
    } = req.body;

    const urlCode = shortid.generate();
    let fullUrl = `${req.protocol}://${req.headers.host}`;

    // check long url if valid using the validUrl.isUri method
    if (validUrl.isUri(longUrl)) {
        try {
            /* The findOne() provides a match to only the subset of the documents
            in the collection that match the query. In this case, before creating the short URL,
            we check if the long URL was in the DB ,else we create it.
            */
            let url = await Url.findOne({
                longUrl
            });

            // url exist and return the response
            if (url) {
                res.json(url);
            } else {
                // join the generated short code the the base url
                const shortUrl = fullUrl + '/url/' + urlCode;

                // invoking the Url model and saving to the DB
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                });
                await url.save();
                res.json(url);
            }
        }
            // exception handler
        catch (err) {
            console.log(err);
            res.status(500).json('Server Error');
        }
    } else {
        res.status(401).json('Invalid longUrl');
    }
};

exports.redirect = async (req, res) => {
    try {
        // find a document match to the code in req.params.code
        const url = await Url.findOne({
            urlCode: req.params.code
        });
        if (url) {
            // when valid we perform a redirect
            return res.redirect(url.longUrl);
        } else {
            // else return a not found 404 status
            return res.status(404).json('No URL Found');
        }

    }
        // exception handler
    catch (err) {
        console.error(err);
        res.status(500).json('Server Error');
    }
};