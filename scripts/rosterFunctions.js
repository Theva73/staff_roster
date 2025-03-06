export const rosterSystem = {
  // Existing logic...

  setupEventListeners() {
    const toggleCollapsibleBtn = document.getElementById('toggleCollapsibleBtn');
    const collapsibleContainer = document.getElementById('collapsibleButtons');
    toggleCollapsibleBtn.addEventListener("click", () => {
      if (collapsibleContainer.classList.contains("expanded")) {
        collapsibleContainer.classList.remove("expanded");
        collapsibleContainer.classList.add("collapsed");
        toggleCollapsibleBtn.textContent = "Show More Options";
      } else {
        collapsibleContainer.classList.remove("collapsed");
        collapsibleContainer.classList.add("expanded");
        toggleCollapsibleBtn.textContent = "Hide Options";
      }
    });
  },

  // Existing methods...
};