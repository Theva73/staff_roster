// Helper function to load a module into a container
function loadModule(containerId, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
    })
    .catch(error => console.error(`Error loading ${filePath}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
  loadModule("header", "header.html");
  loadModule("sidebar", "sidebar.html");
  loadModule("staff-table", "staff-table.html");
  loadModule("footer", "footer.html");
});