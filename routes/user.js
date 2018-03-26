var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var auth = require('../middlewares/auth');

var app = express();

var User = require('../models/user');

// ==========================================
// Obtener todos los Users
// ==========================================
app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    User.find({}, 'name email img role google')
        .skip(from)
        .limit(5)
        .exec(
            (err, user) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando User',
                        errors: err
                    });
                }

                User.count({}, (err, count) => {

                    res.status(200).json({
                        ok: true,
                        user: user,
                        total: count
                    });

                });




            });
});


// ==========================================
// Actualizar user
// ==========================================
app.put('/:id', [auth.tokenVerification, auth.SameUserOrADMIN_ROLEVerification], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar User',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'El User con el id ' + id + ' no existe',
                errors: { message: 'No existe un User con ese ID' }
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar User',
                    errors: err
                });
            }

            userSaved.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSaved
            });

        });

    });

});



// ==========================================
// Crear un nuevo user
// ==========================================
app.post('/', (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear User',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            usertoken: req.User
        });


    });

});


// ============================================
//   Borrar un user por el id
// ============================================
app.delete('/:id', [auth.tokenVerification, auth.ADMIN_ROLEVerification], (req, res) => {

    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error borrar User',
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un User con ese id',
                errors: { message: 'No existe un User con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            user: userDeleted
        });

    });

});


module.exports = app;