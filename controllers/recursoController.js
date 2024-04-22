const Recurso = require("../models/recurso");
const { transporter } = require('../nodemailer.js'); // Ajusta la ruta según tu estructura de carpetas
const Empleado = require("../models/Empleado.js"); // Ajusta la ruta según tu estructura de carpetas
const Solicitud = require("../models/Solicitud.js"); // Ajusta la ruta según tu estructura de carpetas
const recurso = require("../models/recurso");


exports.crearRecurso = async (req, res) => {
    try {
        let vrecurso;

        // Creamos nuestro recurso
        vrecurso = new Recurso(req.body);

        await vrecurso.save();

        // Enviar correo electrónico a los empleados registrados
        const empleados = await Empleado.find(); // Ajusta el modelo y la consulta según tu estructura

        empleados.forEach(async (empleado) => {
            const mailOptions = {
                from: 'danielamanzanorangel@gmail.com',
                to: empleado.email,
                subject: 'Nuevo Artículo Agregado',
                text: `Se ha agregado un nuevo artículo: ${vrecurso.recurso} marca: ${vrecurso.marca} gama: ${vrecurso.gama} `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a ${empleado.email}`);
            } catch (error) {
                console.log(`Error al enviar correo a ${empleado.email}: ${error}`);
            }
        });

        res.send(vrecurso);

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
};

exports.obtenerRecursos = async (req, res) => {

    try {
        const vrecurso = await Recurso.find();
        res.json(vrecurso)
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

exports.actualizarRecurso = async (req, res) => {

    try {
        const { numSerie, recurso, marca, modelo, estatus } = req.body;
        let vrecurso = await Recurso.findById(req.params.id);

        if(!vrecurso) {
            res.status(404).json({ msg: 'No existe' })
        }

        vrecurso.numSerie = numSerie;
        vrecurso.recurso = recurso;
        vrecurso.marca = marca;
        vrecurso.modelo = modelo;
        vrecurso.estatus = estatus;
        
        vrecurso = await Recurso.findOneAndUpdate({ _id: req.params.id },vrecurso, { new: true} )
        res.json(vrecurso);

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}


exports.eliminarRecurso = async (req,res) => {

    try {
        let vrecurso = await Recurso.findById(req.params.id);

        if(!vrecurso){
            res.status(404).json({msg: 'Recurso inexistente'})
        }
        
        await Recurso.findOneAndRemove({ _id: req.params.id })
        res.json({msg: 'Recurso eliminado con exito'});

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// Asignar recursos 
exports.getRecursoFiltro = async (req, res) => {
    console.info('getRecursoFiltro')
    try {
        const filtros = req.body;
        console.info(filtros)
        let mapFiltros = {};
        if(filtros.numSerie) {
            mapFiltros.numSerie = { $regex: filtros.numSerie }
        }
        if(filtros.recurso) {
            mapFiltros.recurso = { $regex: filtros.recurso }
        }
        if(filtros.marca) {
            mapFiltros.marca = { $regex: filtros.marca }
        }
        if(filtros.modelo) {
            mapFiltros.modelo = { $regex: filtros.modelo }
        }
        mapFiltros.estatus = "Sin Problemas";
        const retorno = await Recurso.find(mapFiltros);
        console.info(retorno)
        res.send(retorno)
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }

}

exports.asignarRecurso = async (req, res) => {
    console.info('asignarRecurso')
    try{
        const requestBody = req.body;
        console.info(requestBody)
        requestBody.recursos.forEach(async f => {
            const recurso = await Recurso.findOne({ _id: {$eq: f._id}});
            recurso.asignadoA = requestBody.empleado._id;
            console.info(recurso);
            await Recurso.findOneAndUpdate({ _id: recurso._id}, recurso, {new: true});
        })
        res.send({mensaje: 'Actualizado correctamente'});
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }
}

exports.getRecursoPorEmpleado = async (req, res) => {
    console.info('getRecursoPorEmpleado')
    try {
        const retorno = await Recurso.find({estatus: "Sin Problemas"});
        console.info(retorno)
        res.send(retorno)
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }

}

exports.asignarEmpleado = async (req, res) => {
    console.info('asignarEmpleado');
    try {
        const requestBody = req.body;
        console.info(requestBody);

        const promises = requestBody.map(async f => {
            const recurso = await Recurso.findOne({ _id: { $eq: f._id }});
            recurso.asignadoA = f.asignadoA;
            console.info(recurso);
            await Recurso.findOneAndUpdate({ _id: recurso._id }, recurso, { new: false });

            // Enviar correo electrónico al empleado asignado
            const empleado = await Empleado.findOne({ _id: { $eq: f.asignadoA }});
            const mailOptions = {
                from: 'tu_correo@gmail.com',
                to: empleado.email,
                subject: 'Recurso Asignado',
                text: `Se te ha asignado el recurso: ${recurso.nombre}`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a ${empleado.email}`);
            } catch (error) {
                console.log(`Error al enviar correo a ${empleado.email}: ${error}`);
            }
        });

        // Esperar a que se completen todas las operaciones antes de enviar la respuesta
        await Promise.all(promises);

        res.send({ mensaje: 'Actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ mensaje: 'Hubo un error' });
    }
};

exports.reportarFallas = async (req, res) => {
    console.info('reportarFallas')
    try{
        const requestBody = req.body;
        console.info(requestBody)
        let vrecurso = await Recurso.findOne({ numSerie: {$eq: requestBody.numSerie}});

        if(!vrecurso) {
            res.status(404).json({ msg: 'No existe' })
        }

        vrecurso.asignadoA = null;
        vrecurso.descripcionFalla = requestBody.descripcion;
        vrecurso.fchDesdeFalla = requestBody.fchDesde;
        vrecurso.estatus = "Con Problemas";
        
        vrecurso = await Recurso.findOneAndUpdate({ _id: vrecurso._id },vrecurso, { new: true} )
        res.send({mensaje: 'Actualizado correctamente'});
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }
}


exports.solicitarRecurso = async (req, res) => {
    try {
      const { recurso, cantidadSolicitada } = req.body;
      const recursoEnAlmacen = await Recurso.findOne({ recurso });
  
      if (!recursoEnAlmacen) {
        return res.status(404).json({ message: 'Recurso no encontrado en el almacén' });
      }
  
      if (recursoEnAlmacen.cantidadAlmacen < cantidadSolicitada) {
        return res.status(400).json({ message: 'No hay suficientes recursos en el almacén' });
      }
  
      // Asignar recurso al empleado
      recursoEnAlmacen.cantidadAlmacen -= cantidadSolicitada;
      recursoEnAlmacen.asignadoA = req.user.id; // Suponiendo que tienes la información del usuario en el objeto de solicitud
  
      await recursoEnAlmacen.save();
  
      res.status(200).json({ message: 'Recurso asignado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  exports.solicitarRecurso = async (req, res) => {
    try {
        const { idEmpleado, nombre, recurso, marca, comentario, estado } = req.body;

        // Crear una nueva solicitud con el estado "En revisión"
        const nuevaSolicitud = new Solicitud({
            idEmpleado,
            nombre,
            recurso,
            marca,
            comentario,
            estado: "Pendiente"
        });

        // Guardar la solicitud en la base de datos
        await nuevaSolicitud.save();

        res.status(200).json({ message: 'Solicitud enviada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todas las solicitudes
exports.obtenerSolicitudes = async (req, res) => {
    try {
    
    const solicitudes = await Solicitud.find();
    res.status(200).json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  };
  
  // Obtener una solicitud por su ID
  exports.obtenerSolicitudPorId = async (req, res) => {
    const { id } = req.params;
    try {
      const solicitud = await Solicitud.findById(id);
      if (!solicitud) {
        return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      }
      res.status(200).json(solicitud);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  };

  exports.aprobarSolicitud = async (req, res) => {
    try {
      const solicitudId = req.params.id; // 
      const solicitud = await Solicitud.findById(solicitudId); 
  
      if (!solicitud) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
        solicitud.estado = 'Aprobada';
      await solicitud.save();
  
      return res.status(200).json({ message: 'Solicitud aceptada exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  exports.rechazarSolicitud = async (req, res) => {
    try {
      const solicitudId = req.params.id; // 
      const solicitud = await Solicitud.findById(solicitudId); 
  
      if (!solicitud) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
        solicitud.estado = 'Rechazada';
      await solicitud.save();
  
      return res.status(200).json({ message: 'Solicitud rechazada exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };