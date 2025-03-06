import { rosterSystem } from './rosterFunctions.js';

document.addEventListener('DOMContentLoaded', () => {
  rosterSystem.init();
  // Additional event listener for edit mode toggle
  const toggleEditModeBtn = document.getElementById('toggleEditModeBtn');
  if (toggleEditModeBtn) {
    toggleEditModeBtn.addEventListener('click', () => rosterSystem.toggleEditMode());
  }
});