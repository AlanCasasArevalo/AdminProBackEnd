var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==========================================
//  Verificar token
// ==========================================
exports.tokenVerification = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.user = decoded.user;

        next();

    });

};

// ==========================================
//  Verificar ADMIN
// ==========================================
exports.ADMIN_ROLEVerification = function(req, res, next) {

    var user = req.user;

    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });

    }

};

// ==========================================
//  Verificar ADMIN o Mismo user
// ==========================================
exports.SameUserOrADMIN_ROLEVerification = function(req, res, next) {

    var user = req.user;
    var id = req.params.id;

    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto - No es administrador ni es el mismo user',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });

    }

};