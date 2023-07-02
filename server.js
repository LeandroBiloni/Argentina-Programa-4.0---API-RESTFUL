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

//SOLO PARA PROBAR
// app.post("/sort", (req, res) => {
//   BD.sort(function(a,b){return a.id-b.id});
//   guardarFrutas(BD);
//   res.status(201).send("ORDENADO");
// });

// Ruta principal que devuelve los datos de las frutas
app.get("/frutas", (req, res) => {
   res.send(BD);
});

// Ruta para agregar una nueva fruta al arreglo y guardar los cambios
// app.post("/", (req, res) => {
//     const nuevaFruta = req.body;
//     BD.push(nuevaFruta); // Agregar la nueva fruta al arreglo
//     guardarFrutas(BD); // Guardar los cambios en el archivo
//     res.status(201).send("Fruta agregada!"); // Enviar una respuesta exitosa
// });

/*_________________________ NUEVO POST _________________________*/
app.post("/postFruta", (req, res) => {
  const newFruit = addFruitToDB(req.body);

  res.status(201).send(`Fruta agregada con ID ${newFruit.id}!`);
});

/*_________________________ GET _________________________*/
app.get("/getFruta/id/:id", (req, res) => {
  const id = parseInt(req.params.id);
  
  let message
  let statusCode;

  if (isNaN(id)){
    statusCode = 404;
    message = "ID no es valido!";
  }
  else{
    const fruit = getFruit(id);

    if (fruit !== undefined && fruit !== null){
      statusCode = 200;
      message = JSON.stringify(fruit);
    }
    else {
      statusCode = 404;
      message = "Fruta inexistente!";
    }
  }  

  res.status(statusCode).send(message); 
});

/*_________________________ PUT _________________________*/
app.put("/putFruta/id/:id", (req, res) => {
  const id = parseInt(req.params.id);

  let statusCode;
  let message;

  if (isNaN(id)){
    statusCode = 404;
    message = "ID no es valido!";    
  }
  else{
    let fruit = getFruit(id);

    if (fruit === undefined || fruit === null){
      fruit = addFruitToDB(req.body);

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
  }

  res.status(statusCode).send(message);
});

/*_________________________ DELETE _________________________*/
app.delete("/deleteFruta/id/:id", (req, res) => {
  const id = parseInt(req.params.id);

  let statusCode;
  let message;

  if (isNaN(id)){
    statusCode = 404;
    message = "ID no es valido!";
  }else{
    let fruit = getFruit(id);

    if (fruit !== undefined && fruit !== null){
      const fruitIndex = BD.findIndex(fruit => fruit.id == id)

      BD.splice(fruitIndex, 1);
      
      guardarFrutas(BD);

      statusCode = 410;
      message = `Fruta con ID: ${id} eliminada!`;
    }
    else{
      statusCode = 404;
      message = `Fruta con ID: ${id} no existe.`;
    }
  }  

  res.status(statusCode).send(message);
});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).send("Lo sentimos, la página que buscas no existe.");
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function addFruitToDB(fruit){

  fruit.id = getNewFruitID();

  BD.push(fruit);

  guardarFrutas(BD);
  return fruit;
}

function getFruit(id){
  return BD.find(fruit => fruit.id === id);
}

function getNewFruitID(){
  BD.sort(function(a,b){return a.id-b.id});

  let newID = 1;
  let highestID = 1;

  for (var i = 0; i < BD.length; i++){
    let currentFruitID = BD[i].id;

    if (highestID < currentFruitID){
      highestID = currentFruitID;
    }

    if (newID === currentFruitID){
      newID = currentFruitID + 1;
    }

    if (newID === highestID){
      newID = highestID + 1;
    }
    
  }

  return newID;
}
