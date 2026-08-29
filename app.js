const DEFAULT_MEMBERS = [
  {
    id: "mem-1",
    name: "Mr. Hiranmoy Roy",
    role: "Lead Developer & Electrical Designer",
    departments: ["Engineering", "Leadership"],
    department: "Engineering",
    phone: "+91 9832224657",
    email: "hiranmoyroyr@gmail.com",
    avatar: "Hiranmoy.jpg"
  },
  {
    id: "mem-2",
    name: "Mr. Swarnava Datta",
    role: "Project Designer",
    departments: ["Design", "Leadership"],
    department: "Design",
    phone: "+91 9932803444",
    email: "shaan14626@gmail.com",
    avatar: "Swarnava.jpg"
  },
  {
    id: "mem-3",
    name: "Mrs. Adrija Chakraborty",
    role: "Strategist",
    departments: ["Marketing"],
    department: "Marketing",
    phone: "+91 9641198313",
    email: "chakrabortymithu431@gmail.com",
    avatar: "Adrija.jpg"
  }
];

let teamMembers = [];
let activeDepartment = "all";
let activeSearch = "";

const teamGrid = document.getElementById("teamGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const categoryFilters = document.getElementById("categoryFilters");
const memberCountText = document.getElementById("memberCountText");
const resetSearchBtn = document.getElementById("resetSearchBtn");
const emptyResetBtn = document.getElementById("emptyResetBtn");
const gridBtn = document.getElementById("gridBtn");
const listBtn = document.getElementById("listBtn");
const toastStack = document.getElementById("toastStack");

document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  bindEvents();
  renderTeam();
});

function getMemberDepartments(member) {
  if (Array.isArray(member.departments) && member.departments.length > 0) {
    return member.departments;
  }
  if (Array.isArray(member.department) && member.department.length > 0) {
    return member.department;
  }
  if (typeof member.department === "string") {
    return member.department.split(",").map(d => d.trim()).filter(Boolean);
  }
  return [];
}

function initStorage() {
  const data = localStorage.getItem("bengal_esummit_team_directory_v5");
  if (data) {
    try {
      teamMembers = JSON.parse(data);
    } catch (err) {
      teamMembers = [...DEFAULT_MEMBERS];
    }
  } else {
    teamMembers = [...DEFAULT_MEMBERS];
    persistMembers();
  }
}

function persistMembers() {
  localStorage.setItem("bengal_esummit_team_directory_v5", JSON.stringify(teamMembers));
}

function renderTeam() {
  const filtered = teamMembers.filter(member => {
    const depts = getMemberDepartments(member);
    const matchesDept = activeDepartment === "all" || 
      depts.some(d => d.toLowerCase() === activeDepartment.toLowerCase());

    const query = activeSearch.trim().toLowerCase();
    const matchesSearch = !query ||
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      depts.some(d => d.toLowerCase().includes(query)) ||
      member.email.toLowerCase().includes(query) ||
      member.phone.toLowerCase().includes(query);

    return matchesDept && matchesSearch;
  });

  updateFilterBadges();

  memberCountText.textContent = `Showing ${filtered.length} member${filtered.length === 1 ? "" : "s"}`;
  resetSearchBtn.style.display = (activeSearch || activeDepartment !== "all") ? "inline" : "none";

  if (filtered.length === 0) {
    teamGrid.innerHTML = "";
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    teamGrid.innerHTML = filtered.map(member => createCardHTML(member)).join("");
  }
}

function createCardHTML(member) {
  const depts = getMemberDepartments(member);
  const primaryDept = depts[0] || "Engineering";
  const tagClass = getDepartmentTagClass(primaryDept);

  const deptBadgesHTML = depts.map(d => 
    `<span class="dept-badge ${getDepartmentTagClass(d)}">${sanitize(d)}</span>`
  ).join("");

  return `
    <article class="member-card" data-id="${member.id}">
      <div class="avatar-container">
        <img 
          class="avatar-image" 
          src="${sanitize(member.avatar)}" 
          alt="${sanitize(member.name)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff';"
        />
      </div>

      <div class="member-header-info">
        <h3 class="member-name">${sanitize(member.name)}</h3>
        <span class="role-tag ${tagClass}">${sanitize(member.role)}</span>
        <div class="dept-tags-row">
          ${deptBadgesHTML}
        </div>
      </div>

      <div class="contact-group">
        <div class="contact-row">
          <a href="tel:${sanitize(member.phone)}" class="contact-link" title="Call">
            <i class="fa-solid fa-phone"></i>
            <span>${sanitize(member.phone)}</span>
          </a>
          <button class="copy-btn" onclick="copyText('${sanitize(member.phone)}', 'Phone copied!')" title="Copy phone">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>

        <div class="contact-row">
          <a href="mailto:${sanitize(member.email)}" class="contact-link" title="Email">
            <i class="fa-solid fa-envelope"></i>
            <span>${sanitize(member.email)}</span>
          </a>
          <button class="copy-btn" onclick="copyText('${sanitize(member.email)}', 'Email copied!')" title="Copy email">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>
      </div>

      <div class="quick-actions">
        <a href="tel:${sanitize(member.phone)}" class="action-link action-call">
          <i class="fa-solid fa-phone"></i> Call
        </a>
        <a href="mailto:${sanitize(member.email)}" class="action-link action-email">
          <i class="fa-solid fa-paper-plane"></i> Email
        </a>
      </div>
    </article>
  `;
}

function getDepartmentTagClass(dept) {
  const map = {
    leadership: "tag-leadership",
    engineering: "tag-engineering",
    design: "tag-design",
    product: "tag-product",
    marketing: "tag-marketing"
  };
  return map[dept.toLowerCase()] || "tag-engineering";
}

function updateFilterBadges() {
  const counts = {
    all: teamMembers.length,
    Leadership: 0,
    Engineering: 0,
    Design: 0,
    Product: 0,
    Marketing: 0
  };

  teamMembers.forEach(m => {
    const depts = getMemberDepartments(m);
    depts.forEach(d => {
      const match = Object.keys(counts).find(k => k.toLowerCase() === d.toLowerCase());
      if (match && match !== "all") {
        counts[match]++;
      }
    });
  });

  const countAll = document.getElementById("countAll");
  if (countAll) countAll.textContent = counts.all;

  ['Leadership', 'Engineering', 'Design', 'Product', 'Marketing'].forEach(dept => {
    const el = document.getElementById(`count${dept}`);
    if (el) el.textContent = counts[dept] || 0;
  });
}

function bindEvents() {
  searchInput.addEventListener("input", (e) => {
    activeSearch = e.target.value;
    clearBtn.style.display = activeSearch ? "block" : "none";
    renderTeam();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    activeSearch = "";
    clearBtn.style.display = "none";
    searchInput.focus();
    renderTeam();
  });

  const filterButtons = categoryFilters.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeDepartment = btn.getAttribute("data-dept");
      renderTeam();
    });
  });

  resetSearchBtn.addEventListener("click", resetAll);
  emptyResetBtn.addEventListener("click", resetAll);

  gridBtn.addEventListener("click", () => {
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
    teamGrid.classList.remove("list-layout");
  });

  listBtn.addEventListener("click", () => {
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
    teamGrid.classList.add("list-layout");
  });
}

function resetAll() {
  activeSearch = "";
  searchInput.value = "";
  clearBtn.style.display = "none";
  activeDepartment = "all";

  const buttons = categoryFilters.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-dept") === "all");
  });

  renderTeam();
}

window.copyText = function(text, msg = "Copied to clipboard!") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => execCopy(text, msg));
  } else {
    execCopy(text, msg);
  }
};

function execCopy(text, msg) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand("copy");
    showToast(msg);
  } catch (e) {
    showToast("Failed to copy");
  }
  document.body.removeChild(el);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${sanitize(message)}</span>`;
  toastStack.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "all 0.2s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 200);
  }, 2400);
}

function sanitize(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}
