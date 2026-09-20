const express = require("express");
const cors = require('cors');
const personajesRoutes = require("./routes/personajes");
const atletasRoutes = require("./routes/atletas");
const authRoutes = require("./routes/auth");
const estadisticasRoutes = require("./routes/estadisticas");
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API de One Piece y Deportes funcionando" });
});

app.use("/personajes", personajesRoutes);
app.use("/atletas", atletasRoutes);
app.use("/auth", authRoutes);
app.use("/estadisticas",estadisticasRoutes)


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ mensaje: 'La imagen no puede superar los 5MB' });
    }
    return res.status(400).json({ mensaje: `Error al subir el archivo: ${err.message}` });
  }
  next(err);
});

module.exports = app;