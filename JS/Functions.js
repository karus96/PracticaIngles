// JS/Functions.js

/**
 * Selecciona N pares aleatorios sin repetir
 */
function selectRandomPairs(pairs, count = 10) {
  const shuffled = [...pairs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Mezcla un array de forma segura
 */
function shuffle(array) {
  return [...array].sort(() => 0.5 - Math.random());
}

/**
 * Verifica si un par (a, b) es correcto según la lista válida
 */
function isCorrectPair(valueA, valueB, validPairs) {
  return validPairs.some(pair => pair.a === valueA && pair.b === valueB);
}