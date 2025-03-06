import { rosterSystem } from './scripts/rosterFunctions.js';

document.addEventListener('DOMContentLoaded', () => {
  rosterSystem.init();
  const toggleEditModeBtn = document.getElementById('toggleEditModeBtn');
  if (toggleEditModeBtn) {
    toggleEditModeBtn.addEventListener('click', () => rosterSystem.toggleEditMode());
  }
});