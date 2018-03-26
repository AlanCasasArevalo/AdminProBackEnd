var express = require('express');

var auth = require('../middlewares/auth');

var app = express();

var Doctor = require('../models/doctor');

// ==========================================
// Obtener todos los doctor
// ==========================================
app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    from = Number(from);

    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, doctor) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando doctor',
                        errors: err
                    });
                }

                Doctor.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        doctor: doctor,
                        total: count
                    });

                });

            });
});

// ==========================================
// Obtener médico
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Doctor.findById(id)
        .populate('user', 'name email img')
        .populate('hospital')
        .exec((err, doctor) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar doctor',
                    errors: err
                });
            }

            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    message: 'El doctor con el id ' + id + ' no existe',
                    errors: { message: 'No existe un doctor con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                doctor: doctor
            });

        });


});

// ==========================================
// Actualizar Doctor
// ==========================================
app.put('/:id', auth.tokenVerification, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctor) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: 'El doctor con el id ' + id + ' no existe',
                errors: { message: 'No existe un doctor con ese ID' }
            });
        }


        doctor.name = body.name;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital;

        doctor.save((err, doctorSaved) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar doctor',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                doctor: doctorSaved
            });

        });

    });

});



// ==========================================
// Crear un nuevo doctor
// ==========================================
app.post('/', auth.tokenVerification, (req, res) => {

    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save((err, doctorSaved) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear doctor',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: doctorSaved
        });


    });

});


// ============================================
//   Borrar un doctor por el id
// ============================================
app.delete('/:id', auth.tokenVerification, (req, res) => {

    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctorDeleted) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error borrar doctor',
                errors: err
            });
        }

        if (!doctorDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un doctor con ese id',
                errors: { message: 'No existe un doctor con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: doctorDeleted
        });

    });

});


module.exports = app;