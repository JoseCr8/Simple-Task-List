// Variables 
let taskList = []; // Lista de Tareas


function drawTasks(id, title, done){ // Funcion que añade las tareas a la lista <ul>
  let format = "<h2>"+title+"</h2>" // Formato de los campos de una tarea
  let newLi = document.createElement("li") // Creacion del elemento li que contiene las tareas
  newLi.setAttribute("id", "task-"+id) // Ponemos una id al li usando la id de la tarea como numeracion
  newLi.setAttribute("class", "task-li") // Ponemos una id al li usando la id de la tarea como numeracion
  newLi.innerHTML = format
  $("#task-list").append(newLi) // Añadimos la tarea a la lista lu para mostrarla en pantalla haciendo uso de jquery
  if(done == false){
    $("#task-"+id).css("background-color",'#ff6c6cda') // Rojo si no esta completada
  }else{
    $("#task-"+id).css("background-color",'#6cff91da') // Verde si esta completada
  }
}

const loadTasks = () => {
  fetch("/tasks.json")
  .then(response => response.json()) // Leer la respuesta con las tareas y decodificar el json
  .then(data => {taskList = taskList.concat(data) // Guardar los objetos en un array
    console.log(data)
    for (let i = 0; i < taskList.length; i++){
      drawTasks(taskList[i].id,taskList[i].title,taskList[i].done) // Llamada a la funcion que muestra las tareas en la pagina
    }
  });
}

const add = () => { //#################################### HACER QUE NO SE AÑADA SI EL INPUT ESTA VACIO
  const input = document.querySelector("#task-name").value; // Leemos el contenido del <input>
  if(input == '' || input == ' '){
    console.log('error campo vacio')
  }else{
    let newTask = {"id": taskList.length + 1, "title": input, "done": false}; // La nueva tarea
    console.log(input);
    drawTasks(taskList.length + 1, input, false); // Mostramos en la pantalla la nueva tarea, añadiendola a las ya existentes
    taskList.push(newTask); // Añadimos la tarea al array
    navigator.vibrate(1000); // Vibracion de confirmacion
  }
  console.log(taskList);
}

const remove = () => {
  console.log('remove')
  const listItems = document.querySelectorAll('li');
  listItems.forEach(listItem => {
    let startX;
    let startY;
    let distX;
    let distY;

    listItem.addEventListener('touchstart', e => { // Donde empieza el movimiento 
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      distX = 0;
      distY = 0;
    });

    listItem.addEventListener('touchmove', e => { // Donde acaba el movimiento
      distX = e.touches[0].clientX - startX;
      distY = e.touches[0].clientY - startY;
    });

    listItem.addEventListener('touchend', e => {
      if (Math.abs(distX) > Math.abs(distY) && distX > -10) { // Deslizar de izquierda a derecha para eliminar
        let index = listItem.id.split('-'); // Sacamos el indice del id del elemento <li> 
        taskList.splice(index - 1, 1);
        console.log(taskList);
        listItem.style.opacity = 0;
        navigator.vibrate(1000); // Vibracion de confirmacion
        setTimeout(() => {
          listItem.remove();// Eliminamos el item de la lista
        }, 500); 
      }
    });
  });
}

const toggleDone = () => {
  const itemList = document.querySelectorAll('li');
  let touchStartTime = 0;
  let touchTimeout;

  itemList.forEach((item) => { // Recorremos todos elementos <li>
    item.addEventListener('touchstart', (event) => { // Añadimos el eventListener que detecta el inicio del toque
      touchStartTime = new Date().getTime();// Empieza el toque
      touchTimeout = setTimeout(async () => { // Timeout de 2 segundos
        if (new Date().getTime() - touchStartTime >= 2000) { // Comprobamos si el toque ha durado más de 2 segundos
          
          let index = item.id.split('-'); // Sacamos el indice del id del elemento <li> 
          
          
          if(taskList[parseInt(index[1]) - 1].done == true){// Comprobamos si la tarea estaba marcada como hecha
            await new Promise((resolve) => { // Creamos una promesa, con un time out de medio segundo, para evitar que se pisen solicitudes
              $("#" + item.id).css("background-color", "#ff6c6cda"); // Color Rojo
              navigator.vibrate(1000); // Vibracion de confirmacion
              setTimeout(() => {
                resolve();
              }, 500);
            });
            
            // La tarea se marca como no hecha
            taskList[parseInt(index[1]) - 1].done = false;
          }
          else{ // Tarea que no estaba hecha
            await new Promise((resolve) => { // Creamos una promesa, con un time out de medio segundo, para evitar que se pisen solicitudes
              $("#" + item.id).css("background-color", "#6cff91da"); // Color Verde
              navigator.vibrate(1000); // Vibracion de confirmacion
              setTimeout(() => {
                resolve();
              }, 500);
            });
            
            // La tarea se marca como hecha
            taskList[parseInt(index[1]) - 1].done = true;
          }
          console.log(taskList)
        }
      }, 2000);
    });
    
    item.addEventListener('touchend', (event) => { // Añadimos el eventListener que detecta el fin del toque
      clearTimeout(touchTimeout); // Si el toque ha terminado antes de 2 segundos no se ejecutara nada, ya que se elimina el timeout
      touchStartTime = 0;
      
      removeEventListeners(); // Quitamos los event listener para evitar duplicados
    });
    
    // Function to remove event listeners
    const removeEventListeners = () => {
      item.removeEventListener('touchstart', event.currentTarget);
      item.removeEventListener('touchend', event.currentTarget);
    }
  });
}


const addButton = document.querySelector("#fab-add");
const listContainer = document.querySelector("#task-list");

addButton.addEventListener("touchend", add);
listContainer.addEventListener("touchstart", toggleDone);
listContainer.addEventListener("touchstart", remove);
loadTasks()

