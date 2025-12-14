const express = require("express");
const cowsay = require("cowsay");
const helmet = require("helmet");

const app = express(); // Creando el servidor
app.use(express.json());
app.use(helmet());


// Swagger
const { swaggerUi, swaggerSpec } = require("./config/swagger");



const path = require("path");
const cors = require("cors")
// Permitir cualquier origen (para desarrollo)
app.use(cors({
  origin: 'http://localhost:5173', // tu frontend
  credentials: true // necesario para cookies o Authorization con JWT
}));

// Configurar puerto con valor por defecto
const port = process.env.PORT || 3000;
// Leer fichero .env
require('dotenv').config();

// Middlewares
const error404 = require("./middlewares/error404");
// Morgan
const morgan = require("./middlewares/morgan");

// Configuración del logger con Morgan
app.use(morgan(':method :∫url :status :param[id] - :response-time ms :body'));

// Ruta Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Ruta base de comprobación
app.get('/api', (req, res) => {
  res.send('✅ Backend funcionando correctamente');
});



//Esto hace que pille el dist de Docker y Render pille que estamos en produccion
if (process.env.NODE_ENV==="production") {
  // Servir archivos estáticos del frontend con React
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // Manejar cualquier ruta que no sea de la API y servir el index.html de React
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}


app.use(error404); // Manejo de rutas no encontradas

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor funcionando en puerto ${port}`);
  console.log(
    cowsay.say({
      text: `App funcionando en http://localhost:${port}/api`,
      f: "owl",
    })
  );
});
