/**
 * Middleware para manejo de rutas no encontradas (404)
 * @module middlewares/error404
 * @description Middleware que responde con error 404 cuando ninguna ruta coincide con la solicitud.
 */
const manage404 = (req, res, next) => {
    res.status(404).json({
        msj: "404 not found",
        img: "https://seranking.com/blog/wp-content/uploads/2021/01/404_01-min.jpg"
    });
};

module.exports = manage404;