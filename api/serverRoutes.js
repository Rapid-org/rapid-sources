const { admin_users } = require('./controllers/userControllers');
const users = require('./controllers/userControllers');
const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads/' })
module.exports = function (app) {
    const users = require('./controllers/userControllers');
    const projects = require('./controllers/projectControllers');
    const mailer = require('./controllers/mailControllers');
    const pricing = require('./controllers/pricingController');
    const url = require('./controllers/urlControllers');
    app.route('/user')
        .post(users.create_a_user);
    app.get("/user/:uid", users.list_users_information);
    app.patch("/user/:uid", users.update_user);
    app.get('/projects/:id', projects.list_all_projects);
    app.post("/pricing/create_checkout_session", pricing.create_checkout_session)
    app.post('/projects', projects.create_a_project);
    app.delete('/project/:id', projects.delete_project);
    app.patch('/project/:id', upload.single("projectFile"), projects.update_project);
    app.get('/project/:id', projects.find_project);
    app.post('/projects/import', upload.single("projectFile"), projects.import_project);
    app.post('/mail/verification', mailer.send_verification_email);
    app.post('/mail/reset', mailer.send_reset_password_email)
    app.post('/shorten', url.shorten_url);
    app.get('/url/:code', url.redirect);
    app.get("/users/:page", users.list_users);
    app.delete('/users/:uid', users.delete_users)
    app.post("/users/admin/:uid", admin_users);
    app.post("/users/:uid/photo", upload.single("file"), users.update_user_photo)
    app.get("/users/:uid/photo", users.user_photo)
};
