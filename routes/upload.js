var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // types de colección
    var validTypes = ['hospitals', 'doctors', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'type de colección no es válida',
            errors: { message: 'type de colección no es válida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una image' }
        });
    }

    // Obtener nombre del file
    var file = req.files.image;
    var fileShorted = file.name.split('.');
    var fileExtension = fileShorted[fileShorted.length - 1];

    // Sólo estas extensiones aceptamos
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Nombre de file personalizado
    // 12312312312-123.png
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;


    // Mover el file del temporal a un path
    var path = `./upload/${ type }/${ fileName }`;

    file.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover file',
                errors: err
            });
        }

        uploadByType(type, id, fileName, res);

    });

});

function uploadByType(type, id, fileName, res) {

    if (type === 'users') {

        User.findById(id, (err, User) => {

            if (!User) {
                return res.status(400).json({
                    ok: true,
                    message: 'User no existe',
                    errors: { message: 'User no existe' }
                });
            }


            var oldPath = './upload/users/' + User.img;

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            User.img = fileName;

            User.save((err, updatedUser) => {

                updatedUser.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Image de User actualizada',
                    User: updatedUser
                });

            });

        });

    }

    if (type === 'doctors') {

        Doctor.findById(id, (err, doctor) => {

            if (!doctor) {
                return res.status(400).json({
                    ok: true,
                    message: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            var oldPath = './upload/doctors/' + doctor.img;

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            doctor.img = fileName;

            doctor.save((err, updatedDoctor) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de médico actualizada',
                    Doctor: updatedDoctor
                });

            });

        });
    }

    if (type === 'hospitals') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    message: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var oldPath = '../upload/hospitals/' + hospital.img;

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            hospital.img = fileName;

            hospital.save((err, updatedHospital) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de hospital actualizada',
                    hospital: updatedHospital
                });

            });

        });
    }


}



module.exports = app;