const axios = require('axios');

const ESTADISTICAS_URL = process.env.ESTADISTICAS_URL || 'http://127.0.0.1:8000';

exports.obtenerResumen = async (req, res) => {


        try {

            const respuesta = await axios.get(`${ESTADISTICAS_URL}/estadisticas/resumen`, {
            
                    timeout: 5000
        });

          res.json(respuesta.data)
            }

            catch(error){

                res.status(502).json({message: 'No se pudo conectar con el servicio de estadisticas'});

            }


        };


