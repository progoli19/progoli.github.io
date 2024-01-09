let currentMap = 1;
let blockShapeData = [];
let shapesData = []
const shapesContainer = document.querySelector('.shapes-container');
document.addEventListener('DOMContentLoaded', function () {
  generateTableCells();
  loadShapesData(currentMap);
  cells = document.querySelectorAll('.block');
  const shapes = document.querySelectorAll('.shape');
  shapes.forEach(shape => {
    shape.addEventListener('dragstart', dragStart);
  });
  const table = document.querySelector('.table');
  table.addEventListener('dragover', dragOver);
  table.addEventListener('drop', drop);
});

const showSpoilerButton = document.getElementById('showSpoilerButton');
showSpoilerButton.addEventListener('click', toggleSpoilerImage);


function loadShapesData(currentMap) {
      fetch(`maps/map${currentMap}/blockshape.json`)
      .then(response => response.json())
      .then(data => {
      blockShapeData = data;
    })
    .catch(error => console.error('Hiba a Blockshape fájl betöltésekor:', error));
      fetch(`maps/map${currentMap}/shapes.json`)
        .then(response => response.json())
        .then(data => {
          shapesData = data;
          blockShape();
          generateSpecificShapes();
        })
        .catch(error => console.error('Hiba a Shapes fájl betöltésekor:', error));  

}

let isSpoilerShown = false;
let spoilerImage; 

function toggleSpoilerImage() {
  const button = this; 

  if (!isSpoilerShown) {
    spoilerImage = new Image();
    spoilerImage.src = `img/Spoiler${currentMap}.PNG`;
    spoilerImage.id = 'spoilerImage'; 

    const spoilerImageContainer = document.getElementById('spoilerImageContainer');
    spoilerImageContainer.appendChild(spoilerImage);

    button.textContent = 'Spoiler eltüntetése';
    isSpoilerShown = true;
  } else {
    spoilerImage.remove();
    button.textContent = 'Spoiler megjelenítése';
    isSpoilerShown = false;
  }
}
let draggedItem; 

function dragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
  draggedItem = event.target;

  const offsetXFromMouse = event.clientX - event.target.getBoundingClientRect().left;
  const offsetYFromMouse = event.clientY - event.target.getBoundingClientRect().top;

  event.target.dataset.offsetXFromMouse = offsetXFromMouse;
  event.target.dataset.offsetYFromMouse = offsetYFromMouse;

  console.log('OffsetXFromMouse:', offsetXFromMouse);
  console.log('OffsetYFromMouse:', offsetYFromMouse);
}

function dragOver(event) {

  event.preventDefault();
}

function canPlaceShape(tableCells, touchedCells) {
  for (const index of touchedCells) {
    if (tableCells[index].style.backgroundColor) {
      return false;
    }
  }
  return true;
}

function rotateShape(event) {
  const clickedElementId = event.target.id;
  const clickedElement = document.getElementById(clickedElementId);

  const currentWidth = parseInt(clickedElement.style.width);
  const currentHeight = parseInt(clickedElement.style.height);

  clickedElement.style.width = `${currentHeight}px`;
  clickedElement.style.height = `${currentWidth}px`;

  clickedElement.dataset.rotatedWidth = `${currentHeight}`;
  clickedElement.dataset.rotatedHeight = `${currentWidth}`;
}

let droppedItems = [];

function drop(event) {
  event.preventDefault();
  const droppedItemId = event.dataTransfer.getData('text/plain');
  const droppedItem = document.getElementById(droppedItemId);
  console.log(droppedItem);

  if (!droppedItem) return;

  const tableCells = Array.from(document.querySelectorAll('.block'));
  const tableWidth = 10;

  const offsetXFromMouse = parseInt(droppedItem.dataset.offsetXFromMouse || 0) /50;
  const offsetYFromMouse = parseInt(droppedItem.dataset.offsetYFromMouse || 0) /50;
  console.log('OffsetXFromMouse:', offsetXFromMouse);
  console.log('OffsetYFromMouse:', offsetYFromMouse);

  const cellId = event.target.id;
  console.log(cellId);
  const cellX = Math.floor(parseInt(cellId.split('_')[1]) % tableWidth - offsetXFromMouse +1);
  const cellY = Math.floor(Math.floor(parseInt(cellId.split('_')[1]) / tableWidth) - offsetYFromMouse +1);
  console.log("Cella X: "+cellX);
  console.log("Cella Y: "+cellY);

  const shapeIndex = parseInt(droppedItem.id.split('_')[1]);
  const shapeData = shapesData[shapeIndex];

  const shapeWidth = parseInt(droppedItem.dataset.rotatedWidth || shapeData.width) / 50; 
  const shapeHeight = parseInt(droppedItem.dataset.rotatedHeight || shapeData.height) / 50; 



  const touchedCells = new Set();

  for (let x = 0; x < shapeWidth; x++) {
    for (let y = 0; y < shapeHeight; y++) {
      const blockX = cellX + x;
      const blockY = cellY + y;
      console.log(blockX);
      console.log(blockY);

      if (blockX < 0 || blockX >= tableWidth || blockY < 0 || blockY >= tableWidth) {
        alert('Rossz helyre rakod, kilóg a keretből!');
        return;
      }
      const index = blockX + blockY * tableWidth;
      const roundedIndex = Math.floor(index)
      touchedCells.add(roundedIndex);
      
    }
  }

  const canPlace = canPlaceShape(tableCells, touchedCells);
  if (!canPlace) {
    alert('Nem rakhatod ide az alakzatot!');
    return;
  }


  tableCells.forEach((cell, index) => {
    if (touchedCells.has(index)) {
      cell.style.backgroundColor = droppedItem.style.backgroundColor;
    }
  });

  const placedItem = {
    element: droppedItem,
    cellIndexes: Array.from(touchedCells)
  };

  droppedItems.push(placedItem);

  droppedItem.remove();
  if (checkAllShapesPlaced()) {
    congratulationsMessage();
    
  }
}

function Reset(){
  while (droppedItems.length !== 0) {
    undoLastPlacement();
  }
}
const resetButton = document.getElementById('resetButton')
resetButton.addEventListener('click', Reset);

function undoLastPlacement() {
  const lastPlacedItem = droppedItems.pop();
  if (lastPlacedItem) {
    const { element, cellIndexes } = lastPlacedItem;
    const tableCells = document.querySelectorAll('.block');
    cellIndexes.forEach(index => {
      tableCells[index].style.backgroundColor = '';
    });
    shapesContainer.appendChild(element);
  }
}


const undoButton = document.getElementById('undoButton');
undoButton.addEventListener('click', undoLastPlacement);

function resetTableBackground() {
  const tableCells = document.querySelectorAll('.block');
  tableCells.forEach(cell => {
    cell.style.backgroundColor = ''; 
  });
}

function congratulationsMessage() {
  const congratsMessage = document.createElement('div');
  congratsMessage.style.gridColumn = 'span 6';
  congratsMessage.id = 'congratsMessage';
  congratsMessage.textContent = 'Sikeresen kivitted a játékot.';
  shapesContainer.appendChild(congratsMessage);
}


function generateTableCells() {
  const table = document.querySelector('.table');
  table.addEventListener('dragover', dragOver);
  table.addEventListener('drop', drop);
  for (let i = 0; i < 100; i++) { 
    const cell = document.createElement('div');
    cell.classList.add('block');
    cell.setAttribute('id', 'block_' + i); 
    table.appendChild(cell);
  }
}

function blockShape() {
  const table = document.querySelector('.table');
  const cells = table.querySelectorAll('.block');

  const tableWidth = 10; 

  blockShapeData.forEach(coord => {
    const index = coord.x + coord.y * tableWidth;
    console.log(index); 
    if (index < cells.length) {
      cells[index].style.backgroundColor = 'black'; 
    }
  });
}

function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  let isBlackOrWhite = true;

  while (isBlackOrWhite) {
    color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    
    isBlackOrWhite = color === '#000000' || color === '#FFFFFF';
  }
  return color;
}

function checkAllShapesPlaced() {
  const tableCells = document.querySelectorAll('.block');
  for (const cell of tableCells) {
    if (!cell.style.backgroundColor) {
      return false; 
    }
  }
  return true; 
}

function generateSpecificShapes() {
  shapesData.sort(() => Math.random() - 0.5);

  const usedColors = new Set(); 

  shapesData.forEach((shapeData, index) => {
    const shape = document.createElement('div');
    shape.classList.add('shape');
    shape.setAttribute('id', 'shape_' + index); 
    shape.style.width = shapeData.width + 'px';
    shape.style.height = shapeData.height + 'px';

    let color = generateRandomColor();
    while (usedColors.has(color)) {
      color = generateRandomColor();
    }
    usedColors.add(color);
    
    shape.style.backgroundColor = color;
    shape.setAttribute('draggable', true);
    shape.addEventListener('dragstart', dragStart);
    shape.addEventListener('click', rotateShape);
    shapesContainer.appendChild(shape);
  });
}