// Cargar las variables de entorno del archivo .env
require("dotenv").config();

// Importar el módulo Express
const express = require("express");
const app = express();

// Importar las funciones del gestor de frutas
const { leerFrutas, guardarFrutas } = require("./src/frutasManager");
const { json } = require("body-parser");

// Configurar el número de puerto para el servidor
const PORT = process.env.PORT || 3000;

// Crear un arreglo vacío para almacenar los datos de las frutas
let BD = [];

// Configurar el middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para leer los datos de las frutas antes de cada solicitud
app.use((req, res, next) => {
  BD = leerFrutas(); // Leer los datos de las frutas desde el archivo
  next(); // Pasar al siguiente middleware o ruta
});

// Ruta principal que devuelve los datos de las frutas
app.get("/", (req, res) => {
   res.send(BD);
});

// Ruta para agregar una nueva fruta al arreglo y guardar los cambios
// app.post("/", (req, res) => {
//     const nuevaFruta = req.body;
//     BD.push(nuevaFruta); // Agregar la nueva fruta al arreglo
//     guardarFrutas(BD); // Guardar los cambios en el archivo
//     res.status(201).send("Fruta agregada!"); // Enviar una respuesta exitosa
// });

/*_________________________ GET _________________________*/
app.get("/fruta/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let message

  if (isNaN(id)){
    message = "ID no es valido!";
    res.send(message);
  }
  else{
    const fruit = getFruit(id);
    let statusCode;

    if (fruit !== undefined && fruit !== null){
      statusCode = 200;
      res.json(fruit); 
    }else {
      statusCode = 204;
      message = "Fruta inexistente!";
      res.send(message);
    }
    res.status(statusCode)
  }  
});

/*_________________________ POST _________________________*/
app.post("/", (req, res) => {
  const newFruit = req.body;

  newFruit.id = getNewFruitID();

  BD.push(newFruit);

  guardarFrutas(BD);

  res.status(201).send("Fruta agregada!");
});

/*_________________________ PUT _________________________*/
app.put("/fruta/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)){
    message = "ID no es valido!";
    res.send(message);
  }else{
    let fruit = getFruit(id);

  let statusCode;
  let message;

  if (fruit === undefined){
    fruit = req.body;
    fruit.id = getNewFruitID();

    BD.push(fruit);

    statusCode = 201;
    message = `Fruta con ID: ${id} no existe, se creo nueva fruta con ID: ${fruit.id}`;
  }
  else{
    fruit = req.body; 
    fruit.id = id;
    BD.splice(id-1, 1, fruit);

    statusCode = 200;
    message = "Fruta modificada!";
  }

  guardarFrutas(BD);
  
  res.status(statusCode).send(message);
  }
});

/*_________________________ DELETE _________________________*/
app.delete("/fruta/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)){
    message = "ID no es valido!";
    res.send(message);
  }else{
    let statusCode;
    let message;
    let fruit = getFruit(id);

    if (fruit !== undefined && fruit !== null){
      const fruitIndex = BD.findIndex(fruit => fruit.id == id)
      const deleted =  BD.splice(fruitIndex, 1)[0];
      console.log(`deleted: ${JSON.stringify(deleted)}`);
      guardarFrutas(BD);
      statusCode = 410;
      message = `Fruta con ID: ${id} eliminada!`;
    }
    else{
      console.log("camino else")
      statusCode = 404;
      message = `Fruta con ID: ${id} no existe.`;
    }

    res.status(statusCode).send(message);
    }  
});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


function getFruit(id){
  return BD.find(fruit => fruit.id === id);
}

function getNewFruitID(){
  return BD.length + 1;
}
