const mongoose = require('mongoose');
// Función para generar un número de serie aleatorio de 17 dígitos
function generarNumSerie() {
    // Genera un número aleatorio de 17 dígitos
    return Math.floor(Math.random() * 10**17).toString().padStart(17, '0');
}
const RecursoSchema = mongoose.Schema({
    numSerie: {
        type: String,
        default: generarNumSerie, // Usa la función generarNumSerie como valor predeterminado

    },
    recurso: {
        type: String,
    },
    marca: {
        type: String,
    },
    gama: {
        type: String,
    },
    cantidadAlmacen: {
        type: Number,
        default: 0  // Inicialmente, no hay recursos en el almacén
    },
    estatus: {
        type: String,
        require: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now()
    },
    fchDesdeFalla: {
        type: Date,
        default: Date.now()
    },
    descripcionFalla: {
        type: String,
        require: false
    },
    asignadoA: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('Recurso', RecursoSchema);
