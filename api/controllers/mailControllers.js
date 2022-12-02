const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const request = require('request');

let cfg = require('./../credentials.json');
let verificationEmailTemplate = `<!DOCTYPE html>
<html lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 400;
                src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: normal;
                font-weight: 700;
                src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 400;
                src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
            }

            @font-face {
                font-family: 'Lato';
                font-style: italic;
                font-weight: 700;
                src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
            }
        }

        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0;
            mso-table-rspace: 0;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* MOBILE STYLES */
        @media screen and (max-width:600px) {
            h1 {
                font-size: 32px !important;
                line-height: 32px !important;
            }
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
            margin: 0 !important;
        }
    </style>
</head>

<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    <!-- HIDDEN PREHEADER TEXT -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#6200ee" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#6200ee" align="center" style="padding: 0 10px 0 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0 0; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <img src="https://drive.google.com/uc?export=download&id=16fyMyJvtv929M_ruleh7Eyvnmz-rD3DL" width="125" height="120" style="display: block; border: 0;"  alt="handshake-icon"/>
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2px;">{{{titleText}}}, {{{username}}}!</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0 10px 0 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">{{{subTitleText}}}</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 15px;" bgcolor="#6200ee"><a href="{{{verifyLink}}}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; display: inline-block;">Confirm Account</a></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr> <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0 30px 0 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                        </td>
                    </tr> <!-- COPY -->
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;"><a href="{{{verifyLink}}}" target="_blank" style="color: #6200ee;">{{{verifyLink}}}</a></p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0 30px 40px 30px; border-radius: 0 0 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">Cheers,<br>Rapid Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`;

exports.send_verification_email = function (req, res) {
    const uid = req.body.uid;
    console.log(uid);
    let user;
    admin.auth().getUser(uid).then((user_) => {
        user = user_;
        const mail = nodemailer.createTransport({
          host: 'us2.smtp.mailhostbox.com',
          port: 587,
            auth: {
                user: cfg.email,
                pass: cfg.password
            },
        });
        const actionCodeSettings = {
            url: 'https://create.rapidbuilder.tech/auth?callback=http://create.rapidbuilder.tech/client'
        };
        admin.auth()
            .generateEmailVerificationLink(user.email, actionCodeSettings)
            .then(async (link) => {
                var myJSONObject = {longUrl: link};
                request({
                    url: "https://backend.rapidbuilder.tech:9980/shorten",
                    method: "POST",
                    json: true,
                    body: myJSONObject
                }, function (error, response, body){
                    console.log(body);
                    const mailOptions = {
                        from: cfg.email,
                        to: user.email,
                        subject: 'Verify Your Rapid Account',
                        text: 'Your Mailing Service doesn\'t support HTML E-mails!',
                        html: formatTemplate(verificationEmailTemplate, user.displayName, body.shortUrl, "verification"),
                    };

                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          console.log(error)
                            res.send({error: error});
                        } else {
                            res.json({message: 'Email sent: ' + info.response});
                        }
                    });
                });
            })
            .catch((error) => {
                res.json(error);
            });
    }).catch((e) => {
        res.json(e);
    });
};


exports.send_reset_password_email = function (req, res) {
  const email = req.body.email;
  console.log(email);
  let user;
  admin.auth().getUserByEmail(email).then((user_) => {
    user = user_;
    const mail = nodemailer.createTransport({
      host: 'us2.smtp.mailhostbox.com',
      port: 587,
      auth: {
        user: cfg.email,
        pass: cfg.password
      },
    });
    const actionCodeSettings = {
      url: 'http://localhost:3000/auth?callback=http://localhost:3000/client'
    };
    admin.auth()
      .generatePasswordResetLink(user.email, actionCodeSettings)
      .then(async (link) => {
        var myJSONObject = {longUrl: link};
        request({
          url: "https://backend.rapidbuilder.tech:9980/shorten",
          method: "POST",
          json: true,
          body: myJSONObject
        }, function (error, response, body){
          console.log(body);
          const mailOptions = {
            from: cfg.email,
            to: user.email,
            subject: 'Rest Your Rapid Account Password',
            text: 'Your Mailing Service doesn\'t support HTML E-mails!',
            html: formatTemplate(verificationEmailTemplate, user.displayName, body.shortUrl, "reset"),
          };

          mail.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
              res.send({error: error});
            } else {
              res.json({message: 'Email sent: ' + info.response});
            }
          });
        });
      })
      .catch((error) => {
        res.json(error);
      });
  }).catch((e) => {
    res.json(e);
  });
};

function formatTemplate(template, username, link, type) {
  template = template.replaceAll('{{{username}}}', username.split(" ")[0]).replaceAll('{{{verifyLink}}}', link)
  if (type === "verification") {
    return template
      .replaceAll("{{{hiddentText}}}", "We're thrilled to have you here! Get ready to dive into your new account.")
      .replaceAll("{{{titleText}}}", "Welcome")
      .replaceAll("{{{subTitleText}}}", "We're excited to have you get started. First, you need to confirm your account. Just press the button below.");
  } else if (type === "reset") {
     return template.replaceAll("{{{hiddentText}}}", "Please Reset Your Rapid account password.")
      .replaceAll("{{{titleText}}}", "Reset Your Password")
      .replaceAll("{{{subTitleText}}}", "If you've lost your password and wish to reset it. Just press the button below.");
  }
}
