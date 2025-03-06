const rosterSystem = {
  // Existing properties and constants (ROSTER_TIMES, PRIORITY, etc.) can be defined here
  init() {
    this.initializeDateAndDay();
    this.setupEventListeners();
    this.loadStaffList();
    this.showSuccess("System initialized");
    // New fix: bind the preventMultipleStaffAssignment event
    this.bindPreventMultipleAssignment();
  },
  
  initializeDateAndDay() {
    // Implementation to set the roster date and day
    const today = new Date();
    // (Set the date in an input field if needed)
  },
  
  setupEventListeners() {
    // Bind button events (shuffleBreaksBtn, generateRosterBtn, etc.)
    document.getElementById("shuffleBreaksBtn")?.addEventListener("click", () => {
      this.shuffleBreakTimes();
    });
    document.getElementById("generateRosterBtn")?.addEventListener("click", () => {
      this.generateRoster();
    });
    // … bind other button events (addStaffBtn, importDataBtn, exportDataBtn, etc.)
    
    // Collapsible section toggle
    const toggleCollapsibleBtn = document.getElementById("toggleCollapsibleBtn");
    const collapsibleContainer = document.getElementById("collapsibleButtons");
    toggleCollapsibleBtn?.addEventListener("click", function () {
      if (collapsibleContainer.classList.contains("expanded")) {
        collapsibleContainer.classList.remove("expanded");
        toggleCollapsibleBtn.textContent = "Show More Options";
      } else {
        collapsibleContainer.classList.add("expanded");
        toggleCollapsibleBtn.textContent = "Hide Options";
      }
    });
  },
  
  // New fix: Prevent assigning multiple staff to locked cells
  preventMultipleStaffAssignment(cell, staffList, slot, loc) {
    if (cell && cell.querySelector('input[type="checkbox"]:checked')) {
      const existingStaff = cell.textContent.trim();
      if (existingStaff && existingStaff.indexOf(staffList[0]) === -1) {
        alert(`Can't assign multiple staff members to this cell. This cell is locked.`);
        return false;
      }
    }
    return true;
  },
  
  // Bind the new fix to all cells that are contenteditable in the generated roster
  bindPreventMultipleAssignment() {
    // When the roster is generated, add an event listener to each cell
    // (Make sure this is called after the roster is rendered)
    const rosterContainer = document.getElementById("roster-container");
    if (rosterContainer) {
      rosterContainer.addEventListener("click", (e) => {
        const cell = e.target;
        if (cell.matches("td[contenteditable='true']")) {
          // Example values – in your real code, these could be dynamic
          const staffList = ["6347", "6399", "7114"];
          const slot = cell.getAttribute("data-slot") || "20:00";
          const loc = cell.parentElement.getAttribute("data-loc") || "Pass Counter";
          if (!this.preventMultipleStaffAssignment(cell, staffList, slot, loc)) {
            e.stopPropagation();
          }
        }
      });
    }
  },
  
  // The rest of your roster functions go here…
  loadStaffList() {
    // Load and render the staff table rows into #staffTable (inside staff-table.html)
  },
  shuffleBreakTimes() {
    // Implementation based on your original script
    this.showSuccess("Shuffled break times among unlocked staff (locked rows unchanged).");
  },
  generateRoster() {
    // Generate the roster, merge locked assignments, auto-correct conflicts, etc.
    // Then render the final table into #roster-container.
    this.displayRoster();
  },
  displayRoster() {
    // Build your roster HTML and insert it into #roster-container.
    // You can add event listeners for long-press copy/paste, edit mode, etc.
  },
  showSuccess(msg) {
    // Display a notification message (for example, by creating a div in a notification container)
    console.log("✅ " + msg);
  },
  showError(msg) {
    console.error("❌ " + msg);
  },
  showWarning(msg) {
    console.warn("⚠️ " + msg);
  }
};

document.addEventListener("DOMContentLoaded", () => rosterSystem.init());