document.addEventListener('DOMContentLoaded', () => {
  import('./rosterFunctions.js').then(module => {
    const rosterSystem = module.rosterSystem;
    rosterSystem.init();
  }).catch(error => {
    console.error('Error loading module:', error);
  });
});