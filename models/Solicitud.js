const mongoose = require('mongoose');

const SolicitudSchema = mongoose.Schema({
    idEmpleado: {
        type: Number,
        require: true
    },
    nombre: {
        type: String,
        require: true
    },
    recurso: {
        type: String,
    },
    comentario:{
        type: String, 
        require: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Aprobada', 'Rechazada'], default: 'Pendiente'}
});

module.exports = mongoose.model('Solicitud', SolicitudSchema);
