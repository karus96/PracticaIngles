// JS/Game.js

let gameState = {
  selectedA: null,
  selectedB: null,
  matchedCount: 0,
  totalPairs: 0,
  validPairs: [],
  currentCategory: null
};


// Títulos personalizados (opcional)
const categoryTitles = {
  pastSimple: { title: "Verbos: Infinitivo → Pasado simple", colA: "Infinitivo", colB: "Pasado simple" },
  pastParticiple: { title: "Verbos: Infinitivo → Pasado participio", colA: "Infinitivo", colB: "Pasado participio" },
  phrasalVerbs: { title: "Frases adverbiales", colA: "En inglés", colB: "Traducción" }
};

document.addEventListener('DOMContentLoaded', () => {
  // Leer categoría de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');

  if (!category || !gameData[category]) {
    document.getElementById('message').innerHTML = '<span class="error">❌ Categoría no válida.</span>';
    document.getElementById('backBtn').style.display = 'block';
    return;
  }

  // Guardar categoría actual
  gameState.currentCategory = category;

  // Actualizar títulos si están definidos
  const titles = categoryTitles[category];
  if (titles) {
    document.getElementById('game-title').textContent = titles.title;
    document.getElementById('colA-title').textContent = titles.colA;
    document.getElementById('colB-title').textContent = titles.colB;
  }

  // Iniciar juego con 8 pares (ajusta si quieres)
  initGame(category, 8);

  // Botón de regreso
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  // Botón de reinicio
  document.getElementById('restartBtn').addEventListener('click', () => {
  window.location.reload(); // Recarga la página con la misma categoría
  });
});

// --- El resto es igual a Main.js, pero con initGame local ---

function initGame(categoryKey, pairCount) {
  const pairs = gameData[categoryKey];
  if (!pairs || !Array.isArray(pairs)) {
    // manejo de error...
    return;
  }

  const selectedPairs = selectRandomPairs(pairs, pairCount); // ← esto devuelve [{a, b, translation}, ...]

  // ✅ Aquí se guarda en el estado
  gameState = {
    ...gameState,
    selectedA: null,
    selectedB: null,
    matchedCount: 0,
    errorCount: 0,
    totalPairs: selectedPairs.length,
    validPairs: selectedPairs, // ← ¡debe ser selectedPairs!
    currentCategory: categoryKey
  };

  renderColumns(
    selectedPairs.map(p => p.a),
    shuffle(selectedPairs.map(p => p.b))
  );
}

function renderColumns(listA, listB) {
  const tableBody = document.getElementById('tableBody');
  const messageEl = document.getElementById('message');

  // Limpiar
  if (tableBody) tableBody.innerHTML = '';
  if (messageEl) messageEl.textContent = '';

  // Asegurar que ambas listas tengan la misma longitud (deberían, pero por si acaso)
  const maxLength = Math.max(listA.length, listB.length);

  for (let i = 0; i < maxLength; i++) {
    const row = document.createElement('tr');

    // Celda izquierda (Columna A)
    const cellA = document.createElement('td');
    cellA.style.padding = '8px';
    cellA.style.textAlign = 'center';
    if (i < listA.length) {
      const btnA = document.createElement('button');
      btnA.className = 'btn';
      btnA.style.width = '100%';
      btnA.textContent = listA[i];
      btnA.dataset.value = listA[i];
      btnA.dataset.column = 'A';
      btnA.addEventListener('click', handleButtonClick);
      cellA.appendChild(btnA);
    }
    row.appendChild(cellA);

    // Celda derecha (Columna B)
    const cellB = document.createElement('td');
    cellB.style.padding = '8px';
    cellB.style.textAlign = 'center';
    if (i < listB.length) {
      const btnB = document.createElement('button');
      btnB.className = 'btn';
      btnB.style.width = '100%';
      btnB.textContent = listB[i];
      btnB.dataset.value = listB[i];
      btnB.dataset.column = 'B';
      btnB.addEventListener('click', handleButtonClick);
      cellB.appendChild(btnB);
    }
    row.appendChild(cellB);

    tableBody.appendChild(row);
  }
}
function handleButtonClick(event) {
  const btn = event.target;

  // ❌ Si el botón ya fue resuelto (correcto o error), no hacer nada
  if (btn.classList.contains('correct') || btn.classList.contains('error')) {
    return;
  }

  const column = btn.dataset.column;
  const messageEl = document.getElementById('message');
  if (messageEl) messageEl.textContent = '';

  // Seleccionar botón en su columna
  if (column === 'A') {
    if (gameState.selectedA) {
      gameState.selectedA.classList.remove('selected');
    }
    gameState.selectedA = btn;
    btn.classList.add('selected');
  } else if (column === 'B') {
    if (gameState.selectedB) {
      gameState.selectedB.classList.remove('selected');
    }
    gameState.selectedB = btn;
    btn.classList.add('selected');
  }

  // Solo intentar emparejar si hay un botón seleccionado en cada columna
  if (gameState.selectedA && gameState.selectedB) {
    const valueA = gameState.selectedA.dataset.value;
    const valueB = gameState.selectedB.dataset.value;

    const isMatch = isCorrectPair(valueA, valueB, gameState.validPairs);

    if (isMatch) {
      // ✅ Acierto
      gameState.selectedA.classList.add('correct');
      gameState.selectedB.classList.add('correct');
      gameState.selectedA.disabled = true;
      gameState.selectedB.disabled = true;
      gameState.matchedCount++;
    } else {
      // ❌ Error
      gameState.selectedA.classList.add('error');
      gameState.selectedB.classList.add('error');
      gameState.selectedA.disabled = true;
      gameState.selectedB.disabled = true;
      gameState.errorCount++;
    }

    // Limpiar selección actual
    gameState.selectedA = null;
    gameState.selectedB = null;

    // 🔚 Verificar si el juego ha terminado
    if (gameState.matchedCount + gameState.errorCount === gameState.totalPairs) {
      endGame();
    }
  }
}

function endGame() {
  const messageEl = document.getElementById('message');
  
  if (gameState.errorCount === 0) {
    messageEl.innerHTML = '<span class="success">¡Perfecto! Has emparejado todos los pares correctamente.</span>';
  } else if (gameState.matchedCount === 0) {
    messageEl.innerHTML = '<span class="error">❌ No acertaste ningún par. ¡Inténtalo de nuevo!</span>';
  } else {
    messageEl.innerHTML = `<span style="color: #8e44ad; font-weight: bold;">
      Juego terminado: ${gameState.matchedCount} aciertos, ${gameState.errorCount} errores.
    </span>`;
  }

  // Mostrar tabla de resumen
  setTimeout(() => {
    showSummaryTable(gameState.validPairs, gameState.currentCategory);
  }, 500);
}


function showSummaryTable(pairs, category) {
  const container = document.getElementById('summaryTable');
  if (!container || !pairs?.length) return;

  // Definir títulos según categoría
  let titleB = "";
  if (category === 'pastSimple') {
    titleB = "Pasado simple";
  } else if (category === 'pastParticiple') {
    titleB = "Pasado participio";
  } else if (category === 'phrasalVerbs') {
    titleB = "Traducción";
  }

  let tableHTML = `
    <h3 style="text-align: center; margin: 20px 0 15px; color: #2c3e50;">Resumen: Verbos y traducciones</h3>
    <table style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <thead>
        <tr style="background: #2980b9; color: white;">
          <th style="padding: 12px; text-align: left;">Infinitivo</th>
          <th style="padding: 12px; text-align: left;">${titleB}</th>
          <th style="padding: 12px; text-align: left;">Traducción</th>
        </tr>
      </thead>
      <tbody>
  `;

  pairs.forEach((pair, index) => {
    const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
    const translation = pair.translation || (category === 'phrasalVerbs' ? '—' : '—');
    tableHTML += `
      <tr style="border-bottom: 1px solid #eaeaea; background: ${bgColor};">
        <td style="padding: 10px 12px; border: 1px solid #eee;">${pair.a}</td>
        <td style="padding: 10px 12px; border: 1px solid #eee;">${pair.b}</td>
        <td style="padding: 10px 12px; border: 1px solid #eee;">${translation}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  container.innerHTML = tableHTML;
}

