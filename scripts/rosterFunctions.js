export const rosterSystem = {
  generatedRosterData: null,
  lastValidationConflicts: {},
  clonedStaffID: null,
  editMode: false,
  previousRosterHTML: null,

  init() {
    this.initializeDateAndDay();
    this.setupEventListeners();
    this.loadStaffList();
    this.showSuccess("System initialized");
  },

  initializeDateAndDay() {
    const today = new Date();
    document.getElementById('rosterDate').value = today.toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    document.getElementById('rosterDay').value = days[today.getDay()];
  },

  setupEventListeners() {
    const gapSlider = document.getElementById("gapThreshold");
    const gapDisplay = document.getElementById("gapThresholdValue");
    gapSlider.addEventListener("input", () => { gapDisplay.innerText = gapSlider.value; });
    gapSlider.addEventListener("change", () => { if(this.generatedRosterData) this.generateRoster(); });

    document.getElementById("addStaffBtn").addEventListener("click", () => this.addStaff());
    document.getElementById("importDataBtn").addEventListener("click", () => this.importData());
    document.getElementById("exportDataBtn").addEventListener("click", () => this.exportData());

    document.getElementById("shuffleBreaksBtn").addEventListener("click", () => this.shuffleBreakTimes());
    document.getElementById("generateRosterBtn").addEventListener("click", () => this.generateRoster());
    document.getElementById("copyTSVBtn").addEventListener("click", () => this.copyTSV());

    document.getElementById("downloadCSVBtn").addEventListener("click", () => this.downloadRoster('csv'));
    document.getElementById("rosterDay").addEventListener("change", () => { if(this.generatedRosterData) this.generateRoster(); });

    // Secure import handler
    document.getElementById("importFile").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await this.readFileSecurely(file);
        const imported = JSON.parse(text);
        if(!Array.isArray(imported)) throw new Error("Invalid format");
        localStorage.setItem('staffListData_v2', JSON.stringify(imported));
        this.loadStaffList();
        this.showSuccess("Import successful");
      } catch(err) {
        this.showError("Import failed: " + err.message);
      } finally {
        e.target.value = "";
      }
    }, false);

    // Collapsible buttons toggle
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

  readFileSecurely(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.match('application/json.*')) {
        reject(new Error("Invalid file type"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("File read error"));
      reader.readAsText(file);
    });
  },

  loadStaffList() {
    const stored = localStorage.getItem('staffListData_v2');
    const tbody = document.getElementById("staffTable").querySelector("tbody");
    tbody.innerHTML = "";
    if(stored) {
      try {
        const staffList = JSON.parse(stored);
        staffList.forEach(st => tbody.insertAdjacentHTML("beforeend", this.getStaffRowHTML(st)));
        this.showSuccess(`Loaded ${staffList.length} staff members.`);
      } catch(e) {
        this.showWarning("Error loading staff data. Starting empty.");
        this.addStaff();
      }
    } else {
      this.addStaff();
    }
    this.addListenersToAllRows();
    this.updateStaffCount();
  },

  // ... (Other existing methods like saveStaffList, getCurrentStaffList, etc. remain unchanged)

  preventMultipleStaffAssignment(cell, staffList, slot, loc) {
    // Disable further assignments in locked cells
    if (cell && cell.querySelector('input[type="checkbox"]:checked')) {
      const existingStaff = cell.textContent.trim();
      if (existingStaff && !staffList.some(staff => existingStaff.includes(staff))) {
        this.showWarning(`Can't assign multiple staff members to this cell. This cell is locked.`);
        return false;
      }
    }
    return true;
  },

  toggleEditMode() {
    const container = document.getElementById("rosterContainer");
    const table = container.querySelector("table");
    const button = document.getElementById("toggleEditModeBtn");

    if (button.textContent === "Enable Edit Mode") {
      this.editMode = true;
      table.classList.add("edit-mode");
      container.style.textAlign = "center";
      button.textContent = "Disable Edit Mode";
    } else {
      this.editMode = false;
      table.classList.remove("edit-mode");
      container.style.textAlign = "left";
      button.textContent = "Enable Edit Mode";
    }
  },

  displayRoster(roster, conflicts, creationTime) {
    const container = document.getElementById("rosterContainer");
    const date = document.getElementById("rosterDate").value;
    const day = document.getElementById("rosterDay").value;
    let html = `
      <div style="text-align:left; margin-bottom:15px; font-size:13px; display:flex; justify-content: space-between; flex-wrap: wrap;">
        <div><strong>Roster Date:</strong> ${date} (${day})</div>
        <div><strong>Generated:</strong> ${creationTime.toLocaleString()}</div>
      </div>
      <table id="editableRoster">
        <thead>
          <tr>
            <th style="min-width:100px;">Location</th>`;
    this.ROSTER_TIMES.forEach(slot => {
      html += `<th>${slot}</th>`;
    });
    html += `</tr></thead><tbody>`;
    const isWeekend = ["Saturday", "Sunday"].includes(day);
    this.OUTPUT_ORDER.forEach(loc => {
      html += `<tr data-loc="${loc}"><td><strong>${loc}</strong></td>`;
      this.ROSTER_TIMES.forEach(slot => {
        const applies = this.locationApplies(loc, slot, isWeekend);
        let cellText = applies && roster[loc] && roster[loc][slot] ? roster[loc][slot] : "";
        let style = "";
        if (!applies) {
          style = "background-color:#f8f8f8; color:#999;";
        } else if (conflicts[loc] && conflicts[loc][slot]) {
          style = "background-color:#ffd2d2;";
        } else if (this.CRITICAL_LOCATIONS[loc] && this.CRITICAL_LOCATIONS[loc].includes(slot)) {
          style = "background-color:#e2f0ff;";
        } else if (!cellText) {
          style = "background-color:#ffcccc;";
        }
        html += `
          <td contenteditable="true" data-slot="${slot}" style="min-width:80px; ${style}" title="${applies ? 'Click to edit' : 'Not applicable'}">${cellText}</td>
        `;
      });
      html += "</tr>";
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    // Add event listeners for editable cells
    const cells = container.querySelectorAll('td[contenteditable="true"]');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const staffList = this.getCurrentStaffList().map(st => st.staffID);
        const slot = cell.getAttribute('data-slot');
        const loc = cell.closest('tr').getAttribute('data-loc');
        if (!this.preventMultipleStaffAssignment(cell, staffList, slot, loc)) {
          e.preventDefault();
        }
      });
    });

    if (this.editMode) {
      table.classList.add("edit-mode");
      container.style.textAlign = "center";
    }
  },

  // ... (Other existing methods like generateRoster, shuffleBreakTimes, etc. remain unchanged)

  showSuccess(msg) {
    const container = document.getElementById("notification-container");
    const n = document.createElement("div");
    n.className = "notification success";
    n.textContent = "✅ " + msg;
    container.appendChild(n);
    setTimeout(() => container.removeChild(n), 3000);
  },

  showWarning(msg) {
    const container = document.getElementById("notification-container");
    const n = document.createElement("div");
    n.className = "notification warning";
    n.textContent = "⚠️ " + msg;
    container.appendChild(n);
    setTimeout(() => container.removeChild(n), 4000);
  },

  showError(msg) {
    const container = document.getElementById("notification-container");
    const n = document.createElement("div");
    n.className = "notification error";
    n.textContent = "❌ " + msg;
    container.appendChild(n);
    setTimeout(() => container.removeChild(n), 4000);
  }
};

// Define constants
rosterSystem.ROSTER_TIMES = [
  "20:00", "20:30", "21:00", "22:00", "23:00", "00:00",
  "01:00", "01:30", "02:00", "03:00", "04:00", "05:00",
  "06:00", "06:30", "07:00"
];
rosterSystem.PRIORITY = [
  { location: "Pass Counter", needed: 2 },
  { location: "HHMD", needed: 1 },
  { location: "Lobby", needed: 2 },
  { location: "Guard House", needed: 1 },
  { location: "Vertical Patrol", needed: 1 },
  { location: "Report Room", needed: 1 },
  { location: "Tango Papa", needed: 1 }
];
rosterSystem.OUTPUT_ORDER = [
  "Pass Counter", "HHMD", "Guard House",
  "Lobby", "Report Room", "Vertical Patrol", "Tango Papa"
];
rosterSystem.CRITICAL_LOCATIONS = {
  "Vertical Patrol": ["20:30", "23:00", "01:30", "04:00", "06:30"],
  "Report Room": ["20:00", "21:00"],
  "Tango Papa": ["07:00"]
};