var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

// ==============================
// search por colección
// ==============================
app.get('/collection/:table/:search', (req, res) => {

    var search = req.params.search;
    var table = req.params.table;
    var regex = new RegExp(search, 'i');

    var promise;

    switch (table) {

        case 'users':
            promise = searchUsers(search, regex);
            break;

        case 'doctors':
            promise = doctorsSearch(search, regex);
            break;

        case 'hospitals':
            promise = hospitalsSearch(search, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de search sólo son: users, doctors y hospitals',
                error: { message: 'Tipo de table/coleccion no válido' }
            });

    }

    promise.then(data => {

        res.status(200).json({
            ok: true,
            [table]: data
        });

    });

});


// ==============================
// search general
// ==============================
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');


    Promise.all([
            hospitalsSearch(search, regex),
            doctorsSearch(search, regex),
            searchUsers(search, regex)
        ])
        .then(response => {

            res.status(200).json({
                ok: true,
                hospitals: response[0],
                doctors: response[1],
                users: response[2]
            });
        });

});

function hospitalsSearch(search, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ name: regex })
            .populate('user', 'name email img')
            .exec((err, hospitals) => {

                if (err) {
                    reject('Error al cargar hospitals', err);
                } else {
                    resolve(hospitals);
                }
            });
    });
}

function doctorsSearch(search, regex) {

    return new Promise((resolve, reject) => {

        Doctor.find({ name: regex })
            .populate('user', 'name email img')
            .populate('hospital')
            .exec((err, doctors) => {

                if (err) {
                    reject('Error al cargar doctors', err);
                } else {
                    resolve(doctors);
                }
            });
    });
}

function searchUsers(search, regex) {

    return new Promise((resolve, reject) => {

        User.find({}, 'name email role img')
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, user) => {

                if (err) {
                    reject('Erro al cargar users', err);
                } else {
                    resolve(user);
                }

            });

    });
}

module.exports = app;