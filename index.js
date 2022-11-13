const express = require('express');
const app = express();
const clientSessions = require('client-sessions');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const bcrypt = require('bcrypt');

const HTTP_PORT = process.env.port || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "userSession",
    secret: "secret",
    duration: 10 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

app.engine('.hbs', exphbs({
    extname: '.hbs',
}));

app.set('view engine', '.hbs');

const ensureLogin = (req, res, next) => {
    if (!req.userSession.data) {
        res.redirect('/signin');
    } else {
        next();
    }
};

app.get('/', (req, res) => {
    res.redirect('/signin');
});

app.get('/signin', (req, res) => {
    res.render('signin', {
        layout: false,
    });
});

app.post('/signin', (req, res) => {
    const password = req.body.password;
    const saltRounds = 10;

    if (password === 'btn710@G#') {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                req.userSession.data = {
                    password: hash,
                }
                res.redirect('/deliverables');
            })
        })
    } else {
        res.render('signin', {
            errorMsg: "Invalid Password",
            layout: false,
        });
    }
});

app.get('/deliverables', ensureLogin, (req, res) => {
    res.render('deliverables', {
        user: req.userSession.data,
        layout: false,
    });
});

app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(HTTP_PORT, () => {
    console.log("Server listening on " + HTTP_PORT)
})