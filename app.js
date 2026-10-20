const state = {
  route: normalizeRoute(location.hash.slice(1) || "dashboard"),
  dashboardTab: "overview",
  reportsTab: "overview",
  activeProject: "Test Project",
  sidebarProjectOpen: true,
  editor: null,
  viewer: null,
  confirmDelete: null,
  drawer: null,
  modal: null,
  modalContext: null,
  toast: null,
  sidebarOpen: true,
  search: {
    projects: "",
    requirements: "",
    cases: "",
    plans: "",
    runs: "",
    issues: "",
    settings: "",
  },
  filters: {
    testCaseType: "all",
    testCaseFolder: "all",
    planStatus: "all",
    runStatus: "all",
  },
  projects: [
    {
      id: "P-001",
      name: "Test Project",
      description: "Core web experience, smoke checks, and release gating.",
      owner: "Wizan Pratama",
      created: "Aug 17, 2026",
      status: "Healthy",
    },
    {
      id: "P-002",
      name: "Mobile Regression",
      description: "Weekly regression suite for the mobile app.",
      owner: "Alya S.",
      created: "Aug 11, 2026",
      status: "Monitoring",
    },
    {
      id: "P-003",
      name: "Payments QA",
      description: "Checkout, invoicing, and reconciliation flows.",
      owner: "Raka D.",
      created: "Aug 06, 2026",
      status: "Healthy",
    },
  ],
  requirements: [
    {
      id: "R-001",
      name: "[STAGING] GISEC Global 2026.pdf",
      status: "Draft",
      created: "Aug 17, 2026, 06:34 PM",
      attachmentName: "GISEC Global 2026.pdf",
      attachmentType: "application/pdf",
    },
    {
      id: "R-002",
      name: "Checkout acceptance notes",
      status: "Reviewed",
      created: "Aug 15, 2026, 10:20 AM",
      attachmentName: "checkout-notes.docx",
      attachmentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ],
  folders: [
    { name: "Login", count: 1, active: true },
    { name: "Checkout", count: 4 },
    { name: "Subscriptions", count: 3 },
  ],
  testCases: [
    {
      id: "TC-1",
      title: "Login Google",
      type: "Functional",
      priority: "High",
      platform: "Web",
      caseType: "Manual",
      folder: "Login",
      status: "Passed",
      tags: ["auth", "smoke"],
    },
    {
      id: "TC-2",
      title: "Checkout card payment",
      type: "End to End",
      priority: "High",
      platform: "Web",
      caseType: "Manual",
      folder: "Checkout",
      status: "Failed",
      tags: ["payments"],
    },
    {
      id: "TC-3",
      title: "Subscription renewal edge case",
      type: "Regression",
      priority: "Medium",
      platform: "Mobile",
      caseType: "Automated",
      folder: "Subscriptions",
      status: "Blocked",
      tags: ["billing", "nightly"],
    },
  ],
  plans: [
    {
      id: "TP-1",
      name: "Release 1.8 Verification",
      status: "Active",
      grouping: "1 Run",
      environment: "staging",
      build: "1.8.12",
      release: "2026.8",
      created: "Aug 17, 2026",
    },
  ],
  runs: [
    {
      id: "TR-1",
      name: "Run Login",
      type: "General",
      environment: "staging",
      build: "1",
      release: "1",
      created: "Aug 17, 2026",
      status: "Completed",
      progress: 100,
      passed: 1,
      failed: 0,
      blocked: 0,
      skipped: 0,
      cases: [
        {
          id: "TC-1",
          title: "Login Google",
          priority: "High",
          folder: "Login",
          status: "Passed",
        },
      ],
      referenceFiles: ["GISEC Global 2026.pdf"],
    },
  ],
  issues: [
    {
      id: "ISS-18",
      title: "Checkout payment gateway timeout",
      priority: "High",
      status: "Open",
      assignee: "Raka D.",
      updated: "10 min ago",
    },
    {
      id: "ISS-21",
      title: "Missing error state on invalid OTP",
      priority: "Medium",
      status: "In Progress",
      assignee: "Alya S.",
      updated: "2 hours ago",
    },
  ],
  activity: [
    { title: "Run Login completed", detail: "1 passed, 0 failed", time: "2m ago" },
    { title: "New test case added", detail: "Subscription renewal edge case", time: "24m ago" },
    { title: "Requirement imported", detail: "GISEC Global 2026.pdf", time: "1h ago" },
  ],
  settings: {
    workspaceName: "QA Pal",
    primaryColor: "#FFED7A",
    secondaryColor: "#FFDE00",
    accentColor: "#E0935C",
    emailNotifications: true,
    runAlerts: true,
    slackSummaries: false,
    releaseReminders: true,
    ownerName: "Wizan Pratama",
  },
};

const app = document.getElementById("app");
const STORAGE_KEY = "qa-pal-mvp-state-v1";

hydratePersistedState();

window.addEventListener("hashchange", () => {
  state.route = normalizeRoute(location.hash.slice(1) || "dashboard");
  closeOverlays();
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOverlays();
    render();
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-route], [data-tab], [data-report-tab], [data-filter], [data-close]");
  if (!target) return;

  const action = target.dataset.action;
  if (action) {
    handleAction(action, target);
    return;
  }

  const route = target.dataset.route;
  if (route) {
    navigate(route);
    return;
  }

  const tab = target.dataset.tab;
  if (tab) {
    state.dashboardTab = tab;
    render();
    return;
  }

  const reportTab = target.dataset.reportTab;
  if (reportTab) {
    state.reportsTab = reportTab;
    render();
    return;
  }

  const filter = target.dataset.filter;
  if (filter) {
    const [key, value] = filter.split(":");
    state.filters[key] = value;
    render();
    return;
  }

  if (target.dataset.close !== undefined) {
    closeOverlays();
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-search]")) {
    const key = target.dataset.search;
    state.search[key] = target.value;
    render();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches("[data-run-status]")) {
    updateRunCaseStatus(target.dataset.runId, target.dataset.caseId, target.value);
    render();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const action = form.dataset.submit;
  if (!action) return;
  event.preventDefault();
  const data = collectFormData(new FormData(form));
  submitForm(action, data);
});

function normalizeRoute(route) {
  const base = route.split("/")[0];
  const allowed = new Set([
    "dashboard",
    "projects",
    "requirements",
    "test-cases",
    "test-plans",
    "test-runs",
    "issues",
    "reports",
    "settings",
  ]);
  return allowed.has(base) ? route : "dashboard";
}

function navigate(route) {
  state.route = normalizeRoute(route);
  location.hash = `#${state.route}`;
  closeOverlays();
  render();
}

function closeOverlays() {
  state.modal = null;
  state.drawer = null;
  state.editor = null;
  state.viewer = null;
  state.confirmDelete = null;
  state.modalContext = null;
}

function hydratePersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    for (const key of ["projects", "requirements", "folders", "testCases", "plans", "runs", "issues", "settings", "activeProject", "sidebarOpen"]) {
      if (saved[key] !== undefined) state[key] = saved[key];
    }
  } catch {
    // Ignore bad local storage and continue with defaults.
  }
}

function persistState() {
  const snapshot = {
    projects: state.projects,
    requirements: state.requirements,
    folders: state.folders,
    testCases: state.testCases,
    plans: state.plans,
    runs: state.runs,
    issues: state.issues,
    settings: state.settings,
    activeProject: state.activeProject,
    sidebarOpen: state.sidebarOpen,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage is best effort for the MVP.
  }
}

function handleAction(action, target) {
  switch (action) {
    case "open-modal":
      state.confirmDelete = null;
      state.drawer = null;
      state.editor = null;
      state.modalContext = {
        runId: target.dataset.runId || null,
        suiteId: target.dataset.suiteId || null,
      };
      state.modal = target.dataset.modal;
      break;
    case "open-drawer":
      state.confirmDelete = null;
      state.modal = null;
      state.editor = null;
      state.drawer = target.dataset.drawer;
      break;
    case "open-editor":
      state.confirmDelete = null;
      state.drawer = target.dataset.entity === "test-case" ? "test-case" : null;
      state.modal = target.dataset.entity === "test-case" ? null : "entity";
      state.editor = {
        entity: target.dataset.entity,
        mode: target.dataset.mode || "create",
        id: target.dataset.id || null,
      };
      break;
    case "close-overlays":
      closeOverlays();
      break;
    case "toggle-sidebar":
      state.sidebarOpen = !state.sidebarOpen;
      persistState();
      break;
    case "toggle-project-nav":
      state.sidebarProjectOpen = !state.sidebarProjectOpen;
      break;
    case "select-folder":
      state.filters.testCaseFolder = target.dataset.folder || "all";
      state.folders = state.folders.map((folder) => ({
        ...folder,
        active: folder.name === state.filters.testCaseFolder,
      }));
      break;
    case "view-entity":
      state.viewer = {
        entity: target.dataset.entity,
        id: target.dataset.id,
      };
      break;
    case "open-run-detail":
      navigate(`test-runs/${target.dataset.id}`);
      return;
    case "start-test-run":
      {
        const run = state.runs.find((item) => item.id === target.dataset.id);
        if (run) {
          run.status = "In Progress";
          persistState();
        }
      }
      state.toast = "Test run started";
      break;
    case "end-test-run":
      endRun(target.dataset.id);
      break;
    case "preview-file":
      state.viewer = {
        entity: "file",
        id: target.dataset.file,
      };
      break;
    case "show-toast":
      state.toast = target.dataset.toast || "Action completed";
      window.clearTimeout(state.toastTimer);
      state.toastTimer = window.setTimeout(() => {
        state.toast = null;
        render();
      }, 2400);
      break;
    case "switch-project":
      state.activeProject = target.dataset.project || state.activeProject;
      persistState();
      break;
    case "delete-entity":
      state.confirmDelete = {
        entity: target.dataset.entity,
        id: target.dataset.id,
      };
      break;
    default:
      break;
  }
  render();
}

function submitForm(action, data) {
  switch (action) {
    case "save-entity": {
      const { entity, mode, id } = state.editor || {};
      if (!entity) break;
      const record = saveEntity(entity, mode || "create", data, id);
      if (entity === "test-case") {
        state.drawer = null;
      } else {
        state.modal = null;
      }
      state.editor = null;
      persistState();
      pushToast(`${getEntityLabel(entity)} ${mode === "edit" ? "updated" : "saved"}`);
      if (record && entity === "project") {
        state.activeProject = record.name;
      }
      if (record && entity === "test-run" && mode !== "edit") {
        navigate(`test-runs/${record.id}`);
        state.route = normalizeRoute(location.hash.slice(1) || "dashboard");
      }
      break;
    }
    case "add-project": {
      const record = saveEntity("project", "create", data);
      state.modal = null;
      state.activeProject = record?.name || state.activeProject;
      persistState();
      pushToast("Project saved");
      break;
    }
    case "import-requirements": {
      const file = data.attachment instanceof File && data.attachment.name ? data.attachment : null;
      const fileName = file instanceof File ? file.name : data.name || "Imported requirement";
      state.requirements.unshift({
        id: nextId("R", state.requirements),
        name: fileName,
        status: "Draft",
        created: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachmentName: file ? file.name : fileName,
        attachmentType: file ? file.type || "application/octet-stream" : "",
      });
      state.modal = null;
      persistState();
      pushToast("Requirement uploaded");
      break;
    }
    case "save-settings": {
      state.settings = {
        workspaceName: data.workspaceName || "QA Pal",
        primaryColor: data.primaryColor || "#FFED7A",
        secondaryColor: data.secondaryColor || "#FFDE00",
        accentColor: data.accentColor || "#E0935C",
        emailNotifications: data.emailNotifications === "on",
        runAlerts: data.runAlerts === "on",
        slackSummaries: data.slackSummaries === "on",
        releaseReminders: data.releaseReminders === "on",
        ownerName: data.ownerName || "Wizan Pratama",
      };
      persistState();
      pushToast("Settings saved");
      break;
    }
    case "create-folder":
      state.folders.push({ name: data.folder, count: 0, active: false });
      state.modal = null;
      persistState();
      pushToast("Folder created");
      break;
    case "generate-ai": {
      const record = saveEntity("test-case", "create", {
        title: data.name,
        folder: state.filters.testCaseFolder !== "all" ? state.filters.testCaseFolder : state.folders[0]?.name || "Login",
        type: "Functional",
        priority: "High",
        platform: "Web",
        caseType: "Manual",
        tags: "ai, generated",
        precondition: "Generated from source document",
        steps: "Review draft and refine as needed.",
        expected: "Case is ready for review.",
      });
      state.modal = null;
      persistState();
      pushToast(`${record?.title || "Test case"} generated`);
      break;
    }
    case "add-test-plan": {
      saveEntity("test-suite", "create", data);
      state.modal = null;
      persistState();
      pushToast("Test suite saved");
      break;
    }
    case "add-test-run": {
      const record = saveEntity("test-run", "create", data);
      state.modal = null;
      persistState();
      pushToast("Test run saved");
      if (record) {
        navigate(`test-runs/${record.id}`);
        state.route = normalizeRoute(location.hash.slice(1) || "dashboard");
      }
      break;
    }
    case "add-run-cases": {
      const run = state.runs.find((item) => item.id === state.modalContext?.runId);
      const caseIds = Array.isArray(data.caseIds) ? data.caseIds : data.caseIds ? [data.caseIds] : [];
      if (run && caseIds.length) {
        run.cases = run.cases || [];
        caseIds.forEach((caseId) => {
          if (run.cases.some((item) => item.id === caseId)) return;
          const testCase = state.testCases.find((item) => item.id === caseId);
          if (testCase) {
            run.cases.push({
              id: testCase.id,
              title: testCase.title,
              priority: testCase.priority,
              folder: testCase.folder,
              status: "Untested",
            });
          }
        });
        recalcRunSummary(run);
        persistState();
        pushToast("Test cases added to run");
      }
      state.modal = null;
      state.modalContext = null;
      break;
    }
    case "delete-entity-confirm": {
      const { entity, id } = state.confirmDelete || {};
      if (entity && id) {
        deleteEntityRecord(entity, id);
        persistState();
        pushToast(`${getEntityLabel(entity)} deleted`);
      }
      state.confirmDelete = null;
      state.modal = null;
      state.drawer = null;
      state.editor = null;
      break;
    }
    default:
      break;
  }
  render();
}

function splitTags(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function collectFormData(formData) {
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (data[key] === undefined) {
      data[key] = value;
    } else if (Array.isArray(data[key])) {
      data[key].push(value);
    } else {
      data[key] = [data[key], value];
    }
  }
  return data;
}

function getRouteBase(route = state.route) {
  return String(route || "").split("/")[0] || "dashboard";
}

function getRouteId(route = state.route) {
  return String(route || "").split("/").slice(1).join("/") || "";
}

function getActiveProject() {
  return state.projects.find((project) => project.name === state.activeProject) || state.projects[0];
}

function getSelectedFolder() {
  return state.filters.testCaseFolder === "all" ? null : state.filters.testCaseFolder;
}

function getFolderCaseCount(name) {
  return state.testCases.filter((item) => item.folder === name).length;
}

function getFolderOptions() {
  return state.folders.map((folder) => folder.name);
}

function buildTestRunCases(source = {}) {
  const selectedSuite = source.suite ? state.plans.find((plan) => plan.id === source.suite || plan.name === source.suite) : null;
  const suiteCases = selectedSuite?.includedCaseIds?.length
    ? state.testCases.filter((testCase) => selectedSuite.includedCaseIds.includes(testCase.id))
    : state.testCases;
  return suiteCases.map((testCase) => ({
    id: testCase.id,
    title: testCase.title,
    priority: testCase.priority,
    folder: testCase.folder,
    status: "Untested",
  }));
}

function recalcRunSummary(run) {
  if (!run?.cases) return run;
  const counts = run.cases.reduce(
    (acc, item) => {
      const key = String(item.status || "Untested").toLowerCase();
      if (key === "passed") acc.passed += 1;
      else if (key === "failed") acc.failed += 1;
      else if (key === "blocked") acc.blocked += 1;
      else if (key === "skipped") acc.skipped += 1;
      else acc.untested += 1;
      return acc;
    },
    { passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0 },
  );
  const total = run.cases.length || 1;
  run.passed = counts.passed;
  run.failed = counts.failed;
  run.blocked = counts.blocked;
  run.skipped = counts.skipped;
  run.progress = Math.round(((counts.passed + counts.failed + counts.blocked + counts.skipped) / total) * 100);
  run.status = counts.failed > 0 ? "Failed" : counts.passed > 0 || counts.untested === 0 ? "Passed" : "In Progress";
  return run;
}

function updateRunCaseStatus(runId, caseId, status) {
  const run = state.runs.find((item) => item.id === runId);
  const testCase = run?.cases?.find((item) => item.id === caseId);
  if (!run || !testCase) return;
  testCase.status = status;
  recalcRunSummary(run);
  persistState();
}

function endRun(runId) {
  const run = state.runs.find((item) => item.id === runId);
  if (!run) return;
  recalcRunSummary(run);
  run.status = run.failed > 0 ? "Failed" : "Passed";
  persistState();
  pushToast(`Run ${run.status.toLowerCase()}`);
}

function getEntityCollection(entity) {
  switch (entity) {
    case "project":
      return state.projects;
    case "requirement":
      return state.requirements;
    case "test-case":
      return state.testCases;
    case "test-suite":
      return state.plans;
    case "test-run":
      return state.runs;
    case "issue":
      return state.issues;
    default:
      return [];
  }
}

function getEntityLabel(entity) {
  return {
    project: "Project",
    requirement: "Requirement",
    "test-case": "Test Case",
    "test-suite": "Test Suite",
    "test-run": "Test Run",
    issue: "Issue",
  }[entity] || "Item";
}

function getEntityRecord(entity, id) {
  return getEntityCollection(entity).find((item) => item.id === id);
}

function nextId(prefix, items) {
  const max = items.reduce((highest, item) => {
    const match = String(item.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(highest, value);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function deleteEntityRecord(entity, id) {
  const current = getEntityRecord(entity, id);
  switch (entity) {
    case "project":
      state.projects = state.projects.filter((item) => item.id !== id);
      if (state.activeProject === current?.name) {
        state.activeProject = state.projects[0]?.name || "Test Project";
      }
      break;
    case "requirement":
      state.requirements = state.requirements.filter((item) => item.id !== id);
      break;
    case "test-case":
      state.testCases = state.testCases.filter((item) => item.id !== id);
      break;
    case "test-suite":
      state.plans = state.plans.filter((item) => item.id !== id);
      break;
    case "test-run":
      state.runs = state.runs.filter((item) => item.id !== id);
      break;
    case "issue":
      state.issues = state.issues.filter((item) => item.id !== id);
      break;
    default:
      break;
  }
}

function saveEntity(entity, mode, data, existingId) {
  const collection = getEntityCollection(entity);
  const current = existingId ? getEntityRecord(entity, existingId) : null;
  if (entity === "project") {
    const record = {
      id: mode === "edit" && current ? current.id : nextId("P", collection),
      name: data.name || current?.name || "Untitled project",
      description: data.description || current?.description || "",
      owner: data.owner || current?.owner || "You",
      created: current?.created || "Just now",
      status: data.status || current?.status || "Healthy",
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      state.projects.unshift(record);
    }
    state.activeProject = record.name;
    return record;
  }
  if (entity === "requirement") {
    const attachment = data.attachment instanceof File && data.attachment.name ? data.attachment : null;
    const record = {
      id: mode === "edit" && current ? current.id : nextId("R", collection),
      name: data.name || current?.name || "Untitled requirement",
      status: data.status || current?.status || "Draft",
      created: current?.created || "Just now",
      attachmentName: attachment?.name || current?.attachmentName || "",
      attachmentType: attachment?.type || current?.attachmentType || "",
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      state.requirements.unshift(record);
    }
    return record;
  }
  if (entity === "test-case") {
    const record = {
      id: mode === "edit" && current ? current.id : nextId("TC", collection),
      title: data.title || current?.title || "Untitled test case",
      type: data.type || current?.type || "Functional",
      priority: data.priority || current?.priority || "Medium",
      platform: data.platform || current?.platform || "Web",
      caseType: data.caseType || current?.caseType || "Manual",
      folder: data.folder || current?.folder || state.folders[0]?.name || "Login",
      status: data.status || current?.status || "Not Run",
      tags: splitTags(data.tags).length ? splitTags(data.tags) : current?.tags || [],
      precondition: data.precondition || current?.precondition || "",
      steps: data.steps || current?.steps || "",
      expected: data.expected || current?.expected || "",
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      state.testCases.unshift(record);
    }
    return record;
  }
  if (entity === "test-suite") {
    const includedFolders = Array.isArray(data.includedFolders) ? data.includedFolders : data.includedFolders ? [data.includedFolders] : [];
    const includedCaseIds = Array.isArray(data.includedCaseIds) ? data.includedCaseIds : data.includedCaseIds ? [data.includedCaseIds] : [];
    const derivedCaseIds = includedFolders.length
      ? state.testCases.filter((testCase) => includedFolders.includes(testCase.folder)).map((testCase) => testCase.id)
      : [];
    const record = {
      id: mode === "edit" && current ? current.id : nextId("TS", collection),
      name: data.name || current?.name || "New test suite",
      description: data.description || current?.description || "",
      status: data.status || current?.status || "Draft",
      grouping: data.grouping || current?.grouping || "Dynamic",
      environment: data.environment || current?.environment || "staging",
      build: data.build || current?.build || "1.0.0",
      release: data.release || current?.release || "2026.8",
      created: current?.created || "Just now",
      includedFolders,
      includedCaseIds: includedCaseIds.length ? includedCaseIds : derivedCaseIds,
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      state.plans.unshift(record);
    }
    return record;
  }
  if (entity === "test-run") {
    const cases = mode === "edit" && current?.cases?.length ? current.cases : buildTestRunCases(data);
    const record = {
      id: mode === "edit" && current ? current.id : nextId("TR", collection),
      name: data.name || current?.name || "New test run",
      description: data.description || current?.description || "",
      type: data.type || current?.type || "General",
      environment: data.environment || current?.environment || "staging",
      build: data.build || current?.build || "1.0",
      release: data.release || current?.release || "1.0",
      created: current?.created || "Just now",
      cases,
      referenceFiles:
        current?.referenceFiles ||
        state.requirements
          .map((item) => item.attachmentName)
          .filter(Boolean)
          .slice(0, 3),
      progress: current?.progress ?? 0,
      passed: current?.passed ?? 0,
      failed: current?.failed ?? 0,
      blocked: current?.blocked ?? 0,
      skipped: current?.skipped ?? 0,
      status: current?.status || "In Progress",
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      recalcRunSummary(record);
      state.runs.unshift(record);
    }
    return record;
  }
  if (entity === "issue") {
    const record = {
      id: mode === "edit" && current ? current.id : nextId("ISS", collection),
      title: data.title || current?.title || "New issue",
      priority: data.priority || current?.priority || "Medium",
      status: data.status || current?.status || "Open",
      assignee: data.assignee || current?.assignee || "Unassigned",
      updated: current?.updated || "Just now",
    };
    if (mode === "edit" && current) {
      Object.assign(current, record);
    } else {
      state.issues.unshift(record);
    }
    return record;
  }
  return null;
}

function getEditorState(entity, mode, id) {
  const current = id ? getEntityRecord(entity, id) : null;
  switch (entity) {
    case "project":
      return {
        title: `${mode === "edit" ? "Edit" : "Add"} project`,
        description: mode === "edit" ? "Update the project profile." : "Create a new project in the workspace.",
        submitLabel: mode === "edit" ? "Save changes" : "Save",
        fields: [
          { name: "name", label: "Project name", type: "text", value: current?.name || "" },
          { name: "description", label: "Description", type: "textarea", value: current?.description || "" },
          { name: "owner", label: "Created by", type: "text", value: current?.owner || "You" },
          {
            name: "status",
            label: "Status",
            type: "select",
            value: current?.status || "Healthy",
            options: ["Healthy", "Monitoring", "At risk"],
          },
        ],
      };
    case "requirement":
      return {
        title: `${mode === "edit" ? "Edit" : "Add"} requirement`,
        description: mode === "edit" ? "Refine requirement metadata." : "Capture a new requirement item.",
        submitLabel: mode === "edit" ? "Save changes" : "Save",
        fields: [
          { name: "name", label: "Requirement name", type: "text", value: current?.name || "" },
          {
            name: "attachment",
            label: "Requirement file",
            type: "file",
            accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            value: current?.status || "Draft",
            options: ["Draft", "Reviewed", "Approved"],
          }
        ],
      };
    case "test-case":
      return {
        title: `${mode === "edit" ? "Edit" : "Create"} test case`,
        description: "Draft the case details and execution steps.",
        submitLabel: mode === "edit" ? "Save changes" : "Create",
        fields: [
          { name: "title", label: "Title", type: "text", value: current?.title || "" },
          {
            name: "folder",
            label: "Folder",
            type: "select",
            value: current?.folder || state.folders[0]?.name || "Login",
            options: getFolderOptions(),
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            value: current?.type || "Functional",
            options: ["Functional", "Regression", "End to End"],
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            value: current?.priority || "High",
            options: ["High", "Medium", "Low"],
          },
          {
            name: "platform",
            label: "Platform",
            type: "select",
            value: current?.platform || "Web",
            options: ["Web", "Mobile", "API"],
          },
          {
            name: "caseType",
            label: "Test case type",
            type: "select",
            value: current?.caseType || "Manual",
            options: ["Manual", "Automated"],
          },
          { name: "tags", label: "Tags", type: "text", value: (current?.tags || []).join(", ") },
          { name: "precondition", label: "Precondition", type: "textarea", value: current?.precondition || "" },
          { name: "steps", label: "Steps", type: "textarea", value: current?.steps || "" },
          { name: "expected", label: "Expected result", type: "textarea", value: current?.expected || "" },
        ],
      };
    case "test-suite":
      return {
        title: `${mode === "edit" ? "Edit" : "Create"} test suite`,
        description: "Group test runs under one release suite.",
        submitLabel: mode === "edit" ? "Save changes" : "Create",
        fields: [
          { name: "name", label: "Name", type: "text", value: current?.name || "" },
          { name: "description", label: "Description", type: "textarea", value: current?.description || "" },
          {
            name: "status",
            label: "Status",
            type: "select",
            value: current?.status || "Draft",
            options: ["Draft", "Active", "Completed"],
          },
          { name: "environment", label: "Environment", type: "text", value: current?.environment || "staging" },
          { name: "build", label: "Build version", type: "text", value: current?.build || "1.0.0" },
          { name: "release", label: "Release version", type: "text", value: current?.release || "2026.8" },
          { name: "grouping", label: "Run grouping", type: "text", value: current?.grouping || "Dynamic" },
        ],
      };
    case "test-run":
      return {
        title: `${mode === "edit" ? "Edit" : "Create"} test run`,
        description: "Define the execution window and included cases.",
        submitLabel: mode === "edit" ? "Save changes" : "Create",
        fields: [
          { name: "name", label: "Name", type: "text", value: current?.name || "" },
          { name: "description", label: "Description", type: "textarea", value: current?.description || "" },
          { name: "environment", label: "Environment", type: "text", value: current?.environment || "staging" },
          { name: "build", label: "Build version", type: "text", value: current?.build || "1.0" },
          { name: "release", label: "Release version", type: "text", value: current?.release || "1.0" },
          {
            name: "type",
            label: "Type",
            type: "select",
            value: current?.type || "General",
            options: ["General", "Smoke", "Regression"],
          },
          {
            name: "suite",
            label: "Source suite",
            type: "select",
            value: current?.suite || state.plans[0]?.id || "",
            options: ["", ...state.plans.map((plan) => plan.id)],
          },
        ],
      };
    case "issue":
      return {
        title: `${mode === "edit" ? "Edit" : "Add"} issue`,
        description: "Track a defect or workflow blocker.",
        submitLabel: mode === "edit" ? "Save changes" : "Save",
        fields: [
          { name: "title", label: "Title", type: "text", value: current?.title || "" },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            value: current?.priority || "Medium",
            options: ["High", "Medium", "Low"],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            value: current?.status || "Open",
            options: ["Open", "In Progress", "Closed"],
          },
          { name: "assignee", label: "Assignee", type: "text", value: current?.assignee || "Unassigned" },
        ],
      };
    default:
      return null;
  }
}

function pushToast(message) {
  state.toast = message;
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    state.toast = null;
    render();
  }, 2400);
  persistState();
}

function render() {
  app.innerHTML = `
    <div class="app-shell ${state.sidebarOpen ? "" : "sidebar-hidden"}">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar()}
        <div class="page">
          ${renderPage()}
        </div>
      </main>
      ${renderDrawer()}
      ${renderModal()}
      ${renderBackdrop()}
      ${renderToast()}
    </div>
  `;
  hydrateCharts();
  syncDocTitle();
}

function syncDocTitle() {
  const route = getRouteBase();
  const routeId = getRouteId();
  const map = {
    dashboard: "Dashboard",
    projects: "Projects",
    requirements: "Requirements",
    "test-cases": "Test Cases",
    "test-plans": "Test Suite",
    "test-runs": "Test Runs",
    issues: "Issues",
    reports: "Reports",
    settings: "Settings",
  };
  document.title = `QA Pal - ${map[route] || "Dashboard"}${route === "test-runs" && routeId ? " Detail" : ""}`;
}

function renderSidebar() {
  const route = getRouteBase();
  const activeProject = getActiveProject();
  const projectSections = [
    ["Requirements", "requirements", requirementIcon()],
    ["Test Cases", "test-cases", testcaseIcon()],
    ["Test Suite", "test-plans", planIcon()],
    ["Test Runs", "test-runs", runIcon()],
    ["Issues", "issues", issueIcon()],
    ["Reports", "reports", reportIcon()],
  ];

  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          <img src="assets/jublia-ai-logo.png" alt="QA Pal logo" />
        </div>
        <div class="brand-name">
          <strong>QA Pal</strong>
          <span>Test management workspace</span>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-label">Workspace</div>
        <div class="nav-list">
          ${navItem("Dashboard", "dashboard", route, dashboardIcon(), "Overview and quality pulse")}
        </div>
      </div>

      <div class="sidebar-section">
        <div class="sidebar-section-label">Projects</div>
        <div class="workspace-card project-rail">
          <button class="project-item active" data-action="toggle-project-nav">
            <span class="mini-icon">${projectIcon()}</span>
            <span class="project-text">
              <strong>${escapeHtml(activeProject?.name || "No project")}</strong>
              <span class="workspace-meta">${escapeHtml(activeProject?.status || "Inactive")} · ${escapeHtml(state.activeProject)}</span>
            </span>
            <span class="chevron ${state.sidebarProjectOpen ? "open" : ""}">⌄</span>
          </button>
          <div class="utility-stack project-stack ${state.sidebarProjectOpen ? "open" : "collapsed"}">
            ${projectSections
              .map(([label, routeKey, icon]) => navItem(label, routeKey, route, icon))
              .join("")}
          </div>
          <div class="utility-stack outside-links">
            <button class="nav-item" data-action="open-editor" data-entity="project" data-mode="create">
              <span class="nav-icon">${plusIcon()}</span>
              <span class="nav-label"><strong>Add project</strong></span>
            </button>
            ${navItem("View all projects", "projects", route, folderIcon())}
          </div>
        </div>
      </div>

      <div class="user-card">
        <div class="user-avatar">WP</div>
        <div>
          <strong>Wizan Pratama</strong>
          <div class="workspace-meta">QA Engineer</div>
        </div>
      </div>
    </aside>
  `;
}

function navItem(label, route, currentRoute, icon, secondary = "") {
  const active = currentRoute === route;
  return `
    <button class="nav-item ${active ? "active" : ""}" data-route="${route}">
      <span class="nav-icon">${icon}</span>
      <span class="nav-label">
        <strong>${label}</strong>
        ${secondary ? `<div class="workspace-meta">${secondary}</div>` : ""}
      </span>
      ${route === "dashboard" ? '<span class="badge brand">New</span>' : ""}
    </button>
  `;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <label class="page-search">
        ${searchIcon()}
        <input placeholder="Search workspace, test cases, runs..." />
      </label>
      <div class="top-actions">
        <button class="icon-btn mobile-menu" data-action="toggle-sidebar" aria-label="Toggle sidebar">${menuIcon()}</button>
        <button class="share-btn" data-action="show-toast" data-toast="Shared workspace view">${shareIcon()} Share</button>
        <button class="icon-btn" data-action="show-toast" data-toast="Notifications reviewed" aria-label="Notifications">${bellIcon()}</button>
        <button class="soft-btn" data-action="show-toast" data-toast="Quick add available">${sparkIcon()} Quick add</button>
      </div>
    </header>
  `;
}

function renderPage() {
  const route = getRouteBase();
  const routeId = getRouteId();
  if (route === "test-runs" && routeId) {
    return renderTestRunDetail(routeId);
  }
  if (route === "test-plans" && routeId) {
    return renderTestSuiteDetail(routeId);
  }
  switch (route) {
    case "dashboard":
      return renderDashboard();
    case "projects":
      return renderProjects();
    case "requirements":
      return renderRequirements();
    case "test-cases":
      return renderTestCases();
    case "test-plans":
      return renderTestPlans();
    case "test-runs":
      return renderTestRuns();
    case "issues":
      return renderIssues();
    case "reports":
      return renderReports();
    case "settings":
      return renderSettings();
    default:
      return renderDashboard();
  }
}

function renderDashboard() {
  const tabs = ["overview", "project-quality", "testing-health", "ai-impact"];
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Workspace</span><span> / </span><span>Dashboard</span></div>
        <h1>Dashboard</h1>
        <p>Track release health, execution progress, and the automation mix across QA Pal.</p>
      </div>
      <div class="page-tabs">
        ${tabs.map((tab) => tabChip(tab, prettyTab(tab), state.dashboardTab === tab, "data-tab")).join("")}
      </div>
    </section>

    ${
      state.dashboardTab === "overview"
        ? `
          <div class="highlight-card">
            <div class="highlight-grid">
              <div class="hero-copy">
                <div class="eyebrow">${sparkIcon()} Quality pulse</div>
                <h2>Ship faster with a clear, honest read on test health.</h2>
                <p>
                  QA Pal keeps the workflow focused on the things that matter most: coverage, pass rates, execution progress, and the test assets that need attention.
                </p>
                <div class="hero-actions">
                  <button class="primary-btn" data-action="open-drawer" data-drawer="test-case">${sparkIcon()} New test case</button>
                  <button class="ghost-btn" data-action="open-editor" data-entity="test-run" data-mode="create">Create test run</button>
                  <button class="ghost-btn" data-action="show-toast" data-toast="Project summary exported">Export summary</button>
                </div>
              </div>
              <div class="hero-metrics">
                ${metricTile("1", "Active project", "In current release window")}
                ${metricTile("3", "Open blockers", "Needs triage today")}
                ${metricTile("95%", "Pass rate", "Last 7 days")}
                ${metricTile("78%", "Automation coverage", "Core regression set")}
              </div>
            </div>
          </div>
          ${renderSummaryCards()}
          <div class="chart-grid">
            ${renderDonutChartCard("Overall automation", "Manual vs automated coverage mix", 78, "Automated", "Manual", "brand")}
            ${renderBarChartCard("Project pass rate", "Release gate health across active work", [
              ["Test Project", 98, "green"],
              ["Mobile Regression", 91, "blue"],
              ["Payments QA", 86, "brand"],
            ])}
          </div>
          <div class="chart-grid">
            ${renderLineChartCard("Execution trend", "Pass rate by week", [
              64, 70, 77, 73, 81, 85, 89, 92, 95, 96
            ])}
            ${renderPanelCard("Recent activity", "What changed most recently", renderActivityList())}
          </div>
        `
        : state.dashboardTab === "project-quality"
          ? `
            ${renderSummaryCards("Project quality")}
            <div class="chart-grid">
              ${renderDonutChartCard("Coverage by project", "Total vs automated test cases", 62, "Total", "Automated", "info")}
              ${renderBarChartCard("Pass rates across projects", "Each active project in the release train", [
                ["Test Project", 100, "green"],
                ["Mobile Regression", 88, "blue"],
                ["Payments QA", 96, "brand"],
              ])}
            </div>
            ${renderTableCard("Project details", "Snapshot of active project health", renderProjectDetailsTable())}
          `
          : state.dashboardTab === "testing-health"
            ? `
              ${renderSummaryCards("Testing health")}
              <div class="chart-grid">
                ${renderLineChartCard("Quality trend", "Pass rate over time", [70, 68, 72, 77, 80, 82, 84, 87])}
                ${renderBarChartCard("Testing velocity", "Execution throughput for the current sprint", [
                  ["Week 1", 42, "brand"],
                  ["Week 2", 68, "blue"],
                  ["Week 3", 73, "green"],
                ])}
              </div>
              <div class="chart-grid">
                ${renderPanelCard("Health metrics", "Current release indicators", `
                  <div class="stack">
                    ${smallStat("Overall automation rate", "78%")}
                    ${smallStat("Average pass rate", "95%")}
                    ${smallStat("Active projects", "1")}
                    ${smallStat("Total test runs", "4")}
                  </div>
                `)}
                ${renderPanelCard("Recommendations", "Suggested next moves", `
                  <div class="recommendation">Increase coverage in the checkout suite to reduce manual execution pressure.</div>
                `)}
              </div>
            `
            : `
              <div class="summary-grid">
                ${metricCard("AI adoption", "27%", "AI-generated test cases in the last month")}
                ${metricCard("Time saved", "8.4h", "Compared with manual test creation")}
                ${metricCard("Prompt success", "93%", "Accepted on the first pass")}
                ${metricCard("Drafts queued", "6", "Awaiting reviewer feedback")}
              </div>
              <div class="chart-grid">
                ${renderDonutChartCard("AI testing mix", "Manual versus AI-generated test assets", 27, "Manual", "AI", "accent")}
                ${renderBarChartCard("AI impact", "Test creation efficiency by source", [
                  ["Manual", 100, "red"],
                  ["AI-assisted", 64, "brand"],
                ])}
              </div>
              ${renderPanelCard("AI recommendations", "What to improve next", `
                <div class="stack">
                  <div class="alert-banner"><div>${warningIcon()}</div><div><strong>Prompt quality can be improved.</strong><div class="muted">Add more acceptance detail to increase generation accuracy.</div></div></div>
                  <div class="alert-banner"><div>${warningIcon()}</div><div><strong>Coverage is uneven.</strong><div class="muted">Automate repetitive login flows before expanding to edge-case validation.</div></div></div>
                </div>
              `)}
            `
    }
  `;
}

function renderSummaryCards(label = "Organization summary") {
  return `
    <div class="summary-grid">
      ${summaryCard("Active projects", "3", "1 currently selected")}
      ${summaryCard("Total test cases", "18", "3 updated today")}
      ${summaryCard("Pass rate", "95%", "Last 7 days")}
      ${summaryCard("Open blockers", "3", "Needs triage")}
    </div>
  `;
}

function summaryCard(label, value, foot) {
  return `
    <article class="summary-card">
      <div class="summary-label">${label}</div>
      <div class="summary-value">${value}</div>
      <div class="summary-foot">${foot}</div>
    </article>
  `;
}

function metricCard(label, value, foot) {
  return `
    <article class="summary-card">
      <div class="summary-label">${label}</div>
      <div class="summary-value">${value}</div>
      <div class="summary-foot">${foot}</div>
    </article>
  `;
}

function metricTile(value, label, foot) {
  return `
    <div class="metric-tile">
      <strong>${value}</strong>
      <span>${label}</span>
      <div class="summary-foot">${foot}</div>
    </div>
  `;
}

function renderDonutChartCard(title, subtitle, value, leftLabel, rightLabel, fill = "info") {
  const palette = {
    info: "var(--info)",
    brand: "linear-gradient(90deg, var(--brand), var(--brand-strong))",
    accent: "var(--accent)",
  };
  return `
    <article class="chart-card">
      <div class="card-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
      </div>
      <div class="donut-row">
        <div class="donut" style="--value:${value}; --fill:${palette[fill] || "var(--info)"}">
          <div class="donut-label">
            <strong>${value}%</strong>
            <span>covered</span>
          </div>
        </div>
        <div>
          <div class="bar-list">
            <div class="legend-item"><span class="swatch brand"></span>${leftLabel}</div>
            <div class="legend-item"><span class="swatch ok"></span>${rightLabel}</div>
          </div>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="swatch brand"></span>${leftLabel}</span>
        <span class="legend-item"><span class="swatch ok"></span>${rightLabel}</span>
      </div>
    </article>
  `;
}

function renderBarChartCard(title, subtitle, bars) {
  return `
    <article class="chart-card">
      <div class="card-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
      </div>
      <div class="bar-list">
        ${bars
          .map(
            ([label, value, tone]) => `
              <div class="bar-row">
                <div>${label}</div>
                <div class="bar-track">
                  <div class="bar-fill ${tone}" style="width:${value}%"></div>
                </div>
                <div style="text-align:right; font-weight:800;">${value}%</div>
              </div>
            `,
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderLineChartCard(title, subtitle, points) {
  const svg = lineChartSvg(points, {
    color: "#ffde00",
    fill: "rgba(255, 237, 122, 0.26)",
  });
  return `
    <article class="chart-card">
      <div class="card-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
      </div>
      <div class="chart-box">${svg}</div>
    </article>
  `;
}

function renderPanelCard(title, subtitle, content) {
  return `
    <article class="panel-card">
      <div class="card-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
      </div>
      ${content}
    </article>
  `;
}

function renderTableCard(title, subtitle, body) {
  return `
    <article class="table-card">
      <div class="card-head">
        <div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
      </div>
      ${body}
    </article>
  `;
}

function renderActivityList() {
  return `
    <div class="activity-list">
      ${state.activity
        .map(
          (item) => `
            <div class="activity-item">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <div><small>${escapeHtml(item.detail)}</small></div>
              </div>
              <small>${escapeHtml(item.time)}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProjectDetailsTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Total tests</th>
            <th>Automated</th>
            <th>Automation %</th>
            <th>Pass rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test Project</td>
            <td>18</td>
            <td>14</td>
            <td>78%</td>
            <td>95%</td>
            <td><span class="status passed">Healthy</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderProjects() {
  const q = state.search.projects.toLowerCase();
  const rows = state.projects.filter((project) =>
    [project.name, project.description, project.owner, project.status].some((v) => v.toLowerCase().includes(q)),
  );
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Workspace</span><span> / </span><span>Projects</span></div>
        <h1>All Projects</h1>
        <p>Keep your test programs organized with a clear project overview.</p>
      </div>
      <div class="card-actions">
        <button class="ghost-btn" data-action="show-toast" data-toast="Projects exported">Export</button>
        <button class="primary-btn dark" data-action="open-editor" data-entity="project" data-mode="create">Add project</button>
      </div>
    </section>
    <div class="controls-row">
      <label class="page-search search-inline">
        ${searchIcon()}
        <input value="${escapeAttr(state.search.projects)}" data-search="projects" placeholder="Search projects..." />
      </label>
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Healthy</button>
      <button class="filter-chip">Monitoring</button>
    </div>
    ${renderTableCard("Project list", "A compact table for the current workspace", renderProjectTable(rows))}
  `;
}

function renderProjectTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project name</th>
            <th>Description</th>
            <th>Created by</th>
            <th>Created date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.name)}</strong><div class="workspace-meta">${escapeHtml(row.id)}</div></td>
                  <td>${escapeHtml(row.description)}</td>
                  <td>${escapeHtml(row.owner)}</td>
                  <td>${escapeHtml(row.created)}</td>
                  <td><span class="status passed">${escapeHtml(row.status)}</span></td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="ghost-btn" data-action="switch-project" data-project="${escapeAttr(row.name)}">Select</button>
                      <button class="icon-btn" data-action="open-editor" data-entity="project" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit project">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="project" data-id="${escapeAttr(row.id)}" aria-label="Delete project">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRequirements() {
  const q = state.search.requirements.toLowerCase();
  const rows = state.requirements.filter((row) =>
    [row.id, row.name, row.status, row.score, row.created].some((v) => String(v).toLowerCase().includes(q)),
  );
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Requirements</span></div>
        <h1>Requirements</h1>
        <p>Import source documents and keep extracted requirements traceable.</p>
      </div>
      <button class="primary-btn dark" data-action="open-editor" data-entity="requirement" data-mode="create">Add requirement</button>
    </section>
    <div class="controls-row">
      <label class="page-search search-inline">
        ${searchIcon()}
        <input value="${escapeAttr(state.search.requirements)}" data-search="requirements" placeholder="Search requirements..." />
      </label>
      <select class="input" style="max-width: 180px;">
        <option>All status</option>
        <option>Draft</option>
        <option>Reviewed</option>
      </select>
    </div>
    ${renderTableCard("Requirement register", "One row in the reference design becomes a working list here.", renderRequirementsTable(rows))}
  `;
}

function renderRequirementsTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Requirement ID</th>
            <th>Name</th>
            <th>Attachment</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.id)}</strong></td>
                  <td>${escapeHtml(row.name)}</td>
                  <td>
                    ${
                      row.attachmentName
                        ? `<button class="link-btn" data-action="preview-file" data-file="${escapeAttr(row.attachmentName)}"><strong>${escapeHtml(row.attachmentName)}</strong></button><div class="workspace-meta">${escapeHtml(row.attachmentType || "Uploaded file")}</div>`
                        : `<span class="workspace-meta">No file attached</span>`
                    }
                  </td>
                  <td><span class="pill ${row.status.toLowerCase()}">${escapeHtml(row.status)}</span></td>
                  <td>${escapeHtml(row.created)}</td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="ghost-btn" data-action="view-entity" data-entity="requirement" data-id="${escapeAttr(row.id)}">View</button>
                      <button class="icon-btn" data-action="open-editor" data-entity="requirement" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit requirement">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="requirement" data-id="${escapeAttr(row.id)}" aria-label="Delete requirement">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTestCases() {
  const q = state.search.cases.toLowerCase();
  const selectedFolder = getSelectedFolder();
  const rows = state.testCases.filter((row) =>
    [row.id, row.title, row.type, row.priority, row.platform, row.caseType, row.folder].some((v) =>
      String(v).toLowerCase().includes(q),
    ),
  ).filter((row) => !selectedFolder || row.folder === selectedFolder);

  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Test Cases</span></div>
        <h1>Test Cases</h1>
        <p>Manage folders, generate drafts from sources, and curate each execution step.</p>
      </div>
      <div class="card-actions">
        <button class="ghost-btn" data-action="open-modal" data-modal="ai">Generate with AI</button>
        <button class="primary-btn dark" data-action="open-editor" data-entity="test-case" data-mode="create">Add test case</button>
      </div>
    </section>
    <div class="split-grid">
      <aside class="folder-card">
        <div class="card-head">
          <div>
            <h3>Folder</h3>
            <p>Organize by flow and coverage area.</p>
          </div>
        </div>
        <div class="folder-tree">
          <button class="folder-row ${!selectedFolder ? "active" : ""}" data-action="select-folder" data-folder="all">
            ${folderIcon()}
            <strong>All folders</strong>
            <span class="badge">${state.testCases.length}</span>
          </button>
          ${state.folders
            .map(
              (folder) => `
                <button class="folder-row ${selectedFolder === folder.name ? "active" : ""}" data-action="select-folder" data-folder="${escapeAttr(folder.name)}">
                  ${folderIcon()}
                  <strong>${escapeHtml(folder.name)}</strong>
                  <span class="badge">${getFolderCaseCount(folder.name)}</span>
                </button>
              `,
            )
            .join("")}
          <button class="folder-row" data-action="open-modal" data-modal="folder">
            ${plusIcon()} <strong>New folder</strong>
          </button>
        </div>
      </aside>
      <div>
        <div class="controls-row">
          <label class="page-search search-inline">
            ${searchIcon()}
            <input value="${escapeAttr(state.search.cases)}" data-search="cases" placeholder="Search test case..." />
          </label>
          ${selectedFolder ? `<span class="filter-chip active">Folder: ${escapeHtml(selectedFolder)}</span>` : ""}
          <button class="filter-chip active">All filters</button>
          <button class="filter-chip">Manual</button>
          <button class="filter-chip">Automated</button>
          <button class="icon-btn" data-action="open-modal" data-modal="import" aria-label="Import cases">${uploadIcon()}</button>
        </div>
        ${renderTableCard("Test case library", "A compact table with the same working density as the reference.", renderTestCaseTable(rows))}
      </div>
    </div>
  `;
}

function renderTestCaseTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Platform</th>
            <th>Test case type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.id)}</strong></td>
                  <td>${escapeHtml(row.title)}</td>
                  <td>${escapeHtml(row.type)}</td>
                  <td><span class="pill ${row.priority.toLowerCase()}">${escapeHtml(row.priority)}</span></td>
                  <td>${escapeHtml(row.platform)}</td>
                  <td>${escapeHtml(row.caseType)}</td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="ghost-btn" data-action="view-entity" data-entity="test-case" data-id="${escapeAttr(row.id)}">View</button>
                      <button class="icon-btn" data-action="open-editor" data-entity="test-case" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit test case">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="test-case" data-id="${escapeAttr(row.id)}" aria-label="Delete test case">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTestPlans() {
  const q = state.search.plans.toLowerCase();
  const rows = state.plans.filter((row) =>
    [row.name, row.status, row.grouping, row.environment, row.build, row.release].some((v) =>
      String(v).toLowerCase().includes(q),
    ),
  );

  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Test Suite</span></div>
        <h1>Test Suite</h1>
        <p>Group runs into a release suite and keep environments consistent.</p>
      </div>
      <button class="primary-btn dark" data-action="open-editor" data-entity="test-suite" data-mode="create">Add test suite</button>
    </section>
    <div class="controls-row">
      <label class="page-search search-inline">
        ${searchIcon()}
        <input value="${escapeAttr(state.search.plans)}" data-search="plans" placeholder="Search test suites..." />
      </label>
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Draft</button>
      <button class="filter-chip">Active</button>
      <button class="filter-chip">Completed</button>
    </div>
    ${
      rows.length
        ? renderTableCard("Test suites", "Manage the release grouping logic.", renderTestPlanTable(rows))
        : renderEmptyState("No test suites yet", "Add your first suite to start grouping runs and reporting quality.")
    }
  `;
}

function renderTestPlanTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Multi-run grouping</th>
            <th>Environment</th>
            <th>Build</th>
            <th>Release</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.name)}</strong></td>
                  <td><span class="pill ${row.status.toLowerCase()}">${escapeHtml(row.status)}</span></td>
                  <td>${escapeHtml(row.grouping)}</td>
                  <td>${escapeHtml(row.environment)}</td>
                  <td>${escapeHtml(row.build)}</td>
                  <td>${escapeHtml(row.release)}</td>
                  <td>${escapeHtml(row.created)}</td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="ghost-btn" data-route="test-plans/${escapeAttr(row.id)}">View</button>
                      <button class="icon-btn" data-action="open-editor" data-entity="test-suite" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit test suite">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="test-suite" data-id="${escapeAttr(row.id)}" aria-label="Delete test suite">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTestSuiteDetail(id) {
  const suite = state.plans.find((item) => item.id === id);
  if (!suite) {
    return renderEmptyState("Test suite not found", "The selected suite is not available in this workspace.");
  }
  const includedFolders = suite.includedFolders || [];
  const includedCases = suite.includedCaseIds?.length
    ? state.testCases.filter((item) => suite.includedCaseIds.includes(item.id))
    : includedFolders.length
      ? state.testCases.filter((item) => includedFolders.includes(item.folder))
      : state.testCases;
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Test Suite</span><span> / </span><span>${escapeHtml(suite.name)}</span></div>
        <h1>${escapeHtml(suite.name)}</h1>
        <p>${escapeHtml(suite.description || "Suite")} · ${escapeHtml(suite.environment)} · build ${escapeHtml(suite.build)} · release ${escapeHtml(suite.release)}</p>
      </div>
      <div class="card-actions">
        <button class="ghost-btn" data-route="test-plans">Back to test suites</button>
        <button class="soft-btn" data-action="open-editor" data-entity="test-suite" data-mode="edit" data-id="${escapeAttr(suite.id)}">Edit suite</button>
        <button class="primary-btn dark" data-action="open-editor" data-entity="test-run" data-mode="create">Create run</button>
      </div>
    </section>
    <div class="summary-grid">
      ${summaryCard("Folders", String(includedFolders.length || state.folders.length), "Selected folders")}
      ${summaryCard("Test cases", String(includedCases.length), "Included in suite")}
      ${summaryCard("Status", suite.status || "Draft", "Suite state")}
      ${summaryCard("Grouping", suite.grouping || "Dynamic", "How this suite is bundled")}
    </div>
    <div class="chart-grid">
      ${renderPanelCard("Suite scope", "Folders and cases selected for this suite", `
        <div class="stack">
          ${includedFolders.length ? includedFolders.map((folder) => smallStat("Folder", folder)).join("") : `<div class="empty-panel"><strong>All folders</strong><small class="muted">This suite uses the full case library.</small></div>`}
        </div>
      `)}
      ${renderPanelCard("Cases in suite", "Direct and folder-based selection", `
        <div class="stack selection-scroll">
          ${includedCases
            .map(
              (testCase) => `
                <div class="activity-item">
                  <div>
                    <strong>${escapeHtml(testCase.title)}</strong>
                    <div><small>${escapeHtml(testCase.id)} · ${escapeHtml(testCase.folder)}</small></div>
                  </div>
                  <span class="pill neutral">${escapeHtml(testCase.priority)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      `)}
    </div>
    ${renderTableCard("Suite overview", "Current suite record", renderPlanSummaryTable())}
  `;
}

function renderTestRuns() {
  const q = state.search.runs.toLowerCase();
  const rows = state.runs.filter((row) =>
    [row.name, row.type, row.environment, row.build, row.release].some((v) => String(v).toLowerCase().includes(q)),
  );

  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Test Runs</span></div>
        <h1>Test Runs</h1>
        <p>Track execution progress and summarize outcome states.</p>
      </div>
      <button class="primary-btn dark" data-action="open-editor" data-entity="test-run" data-mode="create">Add test run</button>
    </section>
    <div class="controls-row">
      <label class="page-search search-inline">
        ${searchIcon()}
        <input value="${escapeAttr(state.search.runs)}" data-search="runs" placeholder="Search test runs..." />
      </label>
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Open</button>
      <button class="filter-chip">Completed</button>
    </div>
    ${renderTableCard("Run registry", "A concise table with the same layout density as the reference.", renderRunTable(rows))}
  `;
}

function renderRunTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Environment</th>
            <th>Build</th>
            <th>Release</th>
            <th>Created</th>
            <th>Progress</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>
                    <button class="link-btn" data-action="open-run-detail" data-id="${escapeAttr(row.id)}"><strong>${escapeHtml(row.name)}</strong></button>
                    <div class="workspace-meta">${escapeHtml(row.id)} · ${escapeHtml(row.status || "In Progress")}</div>
                  </td>
                  <td>${escapeHtml(row.type)}</td>
                  <td>${escapeHtml(row.environment)}</td>
                  <td>${escapeHtml(row.build)}</td>
                  <td>${escapeHtml(row.release)}</td>
                  <td>${escapeHtml(row.created)}</td>
                  <td>
                    <div class="stack" style="gap:6px;">
                      <div class="bar-track"><div class="bar-fill" style="width:${row.progress}%"></div></div>
                      <span class="workspace-meta">${row.progress}% complete</span>
                    </div>
                  </td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="ghost-btn" data-action="open-run-detail" data-id="${escapeAttr(row.id)}">View</button>
                      <button class="icon-btn" data-action="open-editor" data-entity="test-run" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit test run">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="test-run" data-id="${escapeAttr(row.id)}" aria-label="Delete test run">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTestRunDetail(id) {
  const run = state.runs.find((item) => item.id === id);
  if (!run) {
    return renderEmptyState("Run not found", "The selected test run is not available in this workspace.");
  }
  recalcRunSummary(run);
  const cases = run.cases || [];
  const totals = cases.reduce(
    (acc, item) => {
      const status = String(item.status || "Untested").toLowerCase();
      acc.total += 1;
      if (status === "passed") acc.passed += 1;
      else if (status === "failed") acc.failed += 1;
      else if (status === "blocked") acc.blocked += 1;
      else if (status === "skipped") acc.skipped += 1;
      else acc.untested += 1;
      return acc;
    },
    { total: 0, passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0 },
  );
  const referenceFiles = run.referenceFiles || [];
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Test Runs</span><span> / </span><span>${escapeHtml(run.name)}</span></div>
        <h1>${escapeHtml(run.name)}</h1>
        <p>${escapeHtml(run.description || "Run Login")} · ${escapeHtml(run.environment)} · build ${escapeHtml(run.build)} · release ${escapeHtml(run.release)}</p>
      </div>
      <div class="card-actions">
        <button class="ghost-btn" data-route="test-runs">Back to test runs</button>
        <button class="soft-btn" data-action="open-modal" data-modal="run-cases" data-run-id="${escapeAttr(run.id)}">Add test case</button>
        <button class="soft-btn" data-action="start-test-run" data-id="${escapeAttr(run.id)}">Start test run</button>
        <button class="primary-btn dark" data-action="show-toast" data-toast="Run summary updated">Refresh summary</button>
        <button class="danger-btn" data-action="end-test-run" data-id="${escapeAttr(run.id)}">${run.failed > 0 ? "End as failed" : "End test run"}</button>
      </div>
    </section>
    <div class="summary-grid">
      ${summaryCard("Total test", String(totals.total), "Cases in this run")}
      ${summaryCard("Passed", `${totals.passed} (${totals.total ? Math.round((totals.passed / totals.total) * 100) : 0}%)`, "Current status")}
      ${summaryCard("Failed", `${totals.failed} (${totals.total ? Math.round((totals.failed / totals.total) * 100) : 0}%)`, "Needs retest")}
      ${summaryCard("Blocked", `${totals.blocked} (${totals.total ? Math.round((totals.blocked / totals.total) * 100) : 0}%)`, "Waiting on dependency")}
    </div>
    <div class="chart-grid">
      ${renderPanelCard("Run details", "Execution metadata", `
        <div class="stack">
          ${smallStat("Type", run.type)}
          ${smallStat("Environment", run.environment)}
          ${smallStat("Build", run.build)}
          ${smallStat("Release", run.release)}
          ${smallStat("Overall status", run.status || "In Progress")}
        </div>
      `)}
      ${renderPanelCard("Reference files", "Source documents attached to this execution", `
        <div class="stack">
          ${
            referenceFiles.length
              ? referenceFiles.map((file) => `
                <button class="reference-chip" type="button" data-action="preview-file" data-file="${escapeAttr(file)}">${documentIcon()} <span>${escapeHtml(file)}</span></button>
              `).join("")
              : `<div class="empty-panel"><strong>No reference files</strong><small class="muted">Attach requirement sources to see them here.</small></div>`
          }
        </div>
      `)}
    </div>
    ${renderTableCard("Run test cases", "Update each case status one by one.", renderRunCasesTable(run))}
  `;
}

function renderRunCasePicker(run) {
  const existing = new Set((run?.cases || []).map((item) => item.id));
  const options = state.testCases.filter((item) => !existing.has(item.id));
  return `
    <section class="modal wide" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div>
          <h3>Add test cases</h3>
          <div class="workspace-meta">Add existing cases into <strong>${escapeHtml(run?.name || "this run")}</strong>.</div>
        </div>
        <button class="icon-btn" data-close="true">${closeIcon()}</button>
      </div>
      <form class="modal-body" data-submit="add-run-cases">
        <div class="stack selection-scroll">
          ${options.length ? options.map((testCase) => `
            <label class="toggle">
              <input type="checkbox" name="caseIds" value="${escapeAttr(testCase.id)}" />
              <span><strong>${escapeHtml(testCase.title)}</strong><div class="workspace-meta">${escapeHtml(testCase.folder)} · ${escapeHtml(testCase.priority)}</div></span>
            </label>
          `).join("") : `<div class="empty-panel"><strong>No more cases available</strong><small class="muted">All test cases are already included in this run.</small></div>`}
        </div>
        <div class="modal-actions">
          <button class="ghost-btn" type="button" data-close="true">Cancel</button>
          <button class="primary-btn dark" type="submit">Add selected</button>
        </div>
      </form>
    </section>
  `;
}

function renderRunCasesTable(run) {
  const cases = run.cases || [];
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Folder</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${cases
            .map(
              (item) => `
                <tr>
                  <td><strong>${escapeHtml(item.id)}</strong></td>
                  <td>${escapeHtml(item.title)}</td>
                  <td><span class="pill ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span></td>
                  <td>${escapeHtml(item.folder)}</td>
                  <td>
                    <select class="input" data-run-status data-run-id="${escapeAttr(run.id)}" data-case-id="${escapeAttr(item.id)}">
                      ${["Untested", "Passed", "Failed", "Blocked", "Skipped"]
                        .map((option) => `<option value="${option}" ${option === item.status ? "selected" : ""}>${option}</option>`)
                        .join("")}
                    </select>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderIssues() {
  const q = state.search.issues.toLowerCase();
  const rows = state.issues.filter((row) =>
    [row.id, row.title, row.priority, row.status, row.assignee, row.updated].some((v) =>
      String(v).toLowerCase().includes(q),
    ),
  );
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Project</span><span> / </span><span>Issues</span></div>
        <h1>Issues</h1>
        <p>Track defect intake and integration state in one place.</p>
      </div>
      <button class="soft-btn" data-action="show-toast" data-toast="Jira sync started">${syncIcon()} Sync with JIRA</button>
    </section>
    <div class="controls-row">
      <label class="page-search search-inline">
        ${searchIcon()}
        <input value="${escapeAttr(state.search.issues)}" data-search="issues" placeholder="Search issues..." />
      </label>
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Open</button>
      <button class="filter-chip">Closed</button>
    </div>
    <div class="alert-banner">
      <div>${warningIcon()}</div>
      <div>
        <strong>Find Bug? Track your defect here</strong>
        <div class="muted">Connect the issue tracker to push defects from QA Pal into your team workflow.</div>
        <div style="margin-top:12px;"><button class="primary-btn" data-action="open-editor" data-entity="issue" data-mode="create">Create issue</button></div>
      </div>
    </div>
    ${renderTableCard("Issue tracker", "Active defects and their current triage state.", renderIssueTable(rows))}
  `;
}

function renderIssueTable(rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.id)}</strong></td>
                  <td>${escapeHtml(row.title)}</td>
                  <td><span class="pill ${row.priority.toLowerCase()}">${escapeHtml(row.priority)}</span></td>
                  <td><span class="status draft">${escapeHtml(row.status)}</span></td>
                  <td>${escapeHtml(row.assignee)}</td>
                  <td>${escapeHtml(row.updated)}</td>
                  <td>
                    <div class="card-actions" style="justify-content:flex-end;">
                      <button class="icon-btn" data-action="open-editor" data-entity="issue" data-mode="edit" data-id="${escapeAttr(row.id)}" aria-label="Edit issue">${editIcon()}</button>
                      <button class="icon-btn" data-action="delete-entity" data-entity="issue" data-id="${escapeAttr(row.id)}" aria-label="Delete issue">${trashIcon()}</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderReports() {
  const tabs = ["overview", "test-case-analytics", "test-plan-analytics", "test-run-performance", "execution-efficiency"];
  const latestRun = state.runs[0];
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Workspace</span><span> / </span><span>Reports</span></div>
        <h1>Reports</h1>
        <p>QA analytics that stay dense, readable, and tuned for release review.</p>
      </div>
      <button class="share-btn" data-action="show-toast" data-toast="Report shared">${shareIcon()} Share</button>
    </section>
    <div class="page-tabs">
      ${tabs.map((tab) => tabChip(tab, prettyReportTab(tab), state.reportsTab === tab, "data-report-tab")).join("")}
    </div>
    ${
      state.reportsTab === "overview"
        ? `
          <div class="chart-grid three">
            ${renderDonutChartCard("Automation coverage", "Manual versus automated execution mix", 78, "Manual", "Automation", "brand")}
            ${renderBarChartCard("Test case growth", "Cases added over the last 6 months", [
              ["Mar", 28, "blue"],
              ["Apr", 34, "blue"],
              ["May", 42, "blue"],
            ])}
            ${renderPanelCard("Quick stats", "Highlights from the workspace", `
              <div class="kpi-grid">
                ${smallKpi("18", "Total test cases")}
                ${smallKpi("14", "Automated")}
                ${smallKpi("2", "Flaky tests")}
              </div>
            `)}
          </div>
          <div class="chart-grid">
            ${renderLineChartCard("Recent test run results", "Pass, fail, skipped trend", [55, 68, 70, 73, 81, 84, 89, 91, 94])}
            ${renderPanelCard("Latest test run", "Most recent execution in the workspace", latestRun ? `
              <div class="stack">
                ${smallStat("Name", latestRun.name)}
                ${smallStat("Status", latestRun.status || "In Progress")}
                ${smallStat("Passed", String(latestRun.passed ?? 0))}
                ${smallStat("Failed", String(latestRun.failed ?? 0))}
                ${smallStat("Blocked", String(latestRun.blocked ?? 0))}
              </div>
            ` : `<div class="empty-panel"><strong>No runs yet</strong><small class="muted">Create a run to see the latest result here.</small></div>`)}
          </div>
          <div class="chart-grid">
            ${renderPanelCard("Recent alerts", "Items worth review", `
              <div class="stack">
                <div class="recommendation">No flaky tests detected in the latest release slice.</div>
                <div class="recommendation">Coverage for the checkout flow is still below target.</div>
              </div>
            `)}
          </div>
        `
        : state.reportsTab === "test-case-analytics"
          ? `
            <div class="chart-grid three">
              ${renderDonutChartCard("Test case types", "Functional, regression, and smoke coverage", 100, "Functional", "Regression", "info")}
              ${renderDonutChartCard("Priority distribution", "High priority cases dominate the suite", 58, "High", "Normal", "accent")}
              ${renderDonutChartCard("Platform distribution", "Web remains the primary target", 72, "Web", "Mobile", "brand")}
            </div>
            ${renderLineChartCard("Test case growth over time", "Monthly additions to the suite", [12, 18, 24, 28, 31, 36, 40, 46])}
          `
          : state.reportsTab === "test-plan-analytics"
            ? `
              <div class="chart-grid">
                ${renderDonutChartCard("Test suite status", "Drafts versus active suites", 72, "Draft", "Active", "info")}
                ${renderPanelCard("Test suite summary", "Snapshot metrics", `
                  <div class="kpi-grid">
                    ${smallKpi("1", "Test suites")}
                    ${smallKpi("1", "Active suites")}
                    ${smallKpi("0", "Completed")}
                  </div>
                `)}
              </div>
              ${renderBarChartCard("Pass rate by plan", "Grouped run performance", [["Release 1.8", 50, "warn"]])}
              ${renderTableCard("Suite grouping summary", "Each suite and the runs bundled into it", renderPlanSummaryTable())}
            `
            : state.reportsTab === "test-run-performance"
              ? `
                ${renderLineChartCard("Pass/fail trends", "Recent execution outcomes", state.runs.length ? state.runs.map((run) => Math.max(20, 100 - (run.failed || 0) * 15)) : [68, 70, 72, 76, 80, 86, 88, 91])}
                <div class="chart-grid">
                  ${renderPanelCard("Execution time", "Average runtime by run", `<div class="empty-state" style="min-height:180px;">${emptyMini("No regressions found yet")}</div>`)}
                  ${renderPanelCard("Flaky tests", "Identified unstable tests", `<div class="empty-state" style="min-height:180px;">${emptyMini("No flaky tests detected")}</div>`)}
                  ${renderPanelCard("Performance summary", "Key outcome totals", `
                    <div class="kpi-grid">
                      ${smallKpi(String(state.runs.length), "Test runs analyzed")}
                      ${smallKpi("0s", "Avg execution time")}
                      ${smallKpi("0", "Flaky tests")}
                    </div>
                  `)}
                </div>
                ${renderTableCard("Run history", "Latest runs and their current outcome", renderRunPerformanceTable())}
              `
              : `
                <div class="chart-grid">
                  ${renderPanelCard("Time savings through automation", "How much time is being reclaimed", `
                    <div class="kpi-grid">
                      ${smallKpi("0", "Minutes saved")}
                      ${smallKpi("0%", "Efficiency gain")}
                      ${smallKpi("0", "Hours saved")}
                    </div>
                  `)}
                  ${renderDonutChartCard("Automation vs manual testing", "Split by source", 76, "Manual", "Automation", "brand")}
                </div>
                ${renderBarChartCard("Most frequently executed tests", "Hot spots in the regression suite", [["Login Google", 92, "red"]])}
              `
    }
  `;
}

function renderPlanSummaryTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Test suite</th>
            <th>Status</th>
            <th>Grouped runs</th>
            <th>Total cases</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Untested</th>
            <th>Pass rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Release 1.8 Verification</strong></td>
            <td><span class="pill passed">Active</span></td>
            <td>1 run</td>
            <td>18</td>
            <td>17</td>
            <td>1</td>
            <td>0</td>
            <td>95%</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderRunPerformanceTable() {
  const rows = state.runs.slice().sort((a, b) => String(b.created).localeCompare(String(a.created)));
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Status</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Blocked</th>
            <th>Skipped</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>
                    <button class="link-btn" data-action="open-run-detail" data-id="${escapeAttr(row.id)}"><strong>${escapeHtml(row.name)}</strong></button>
                    <div class="workspace-meta">${escapeHtml(row.id)}</div>
                  </td>
                  <td><span class="pill ${String(row.status || "draft").toLowerCase()}">${escapeHtml(row.status || "Draft")}</span></td>
                  <td>${escapeHtml(String((row.cases || []).length))}</td>
                  <td>${escapeHtml(String(row.passed ?? 0))}</td>
                  <td>${escapeHtml(String(row.failed ?? 0))}</td>
                  <td>${escapeHtml(String(row.blocked ?? 0))}</td>
                  <td>${escapeHtml(String(row.skipped ?? 0))}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSettings() {
  const s = state.settings;
  return `
    <section class="page-head">
      <div class="page-title">
        <div class="breadcrumb"><span>Workspace</span><span> / </span><span>Settings</span></div>
        <h1>Settings</h1>
        <p>Adjust the QA Pal experience and workspace defaults.</p>
      </div>
      <button class="primary-btn dark" form="settings-form" type="submit">Save settings</button>
    </section>
    <form id="settings-form" class="settings-grid" data-submit="save-settings">
      <div class="settings-card">
        <div class="card-head">
          <div>
            <h3>Branding</h3>
            <p>Workspace identity and color usage.</p>
          </div>
        </div>
        <div class="stack">
          <label class="field">
            <span>Workspace name</span>
            <input class="input" name="workspaceName" value="${escapeAttr(s.workspaceName)}" />
          </label>
          <div class="form-grid two">
            <label class="field">
              <span>Primary color</span>
              <input class="input" name="primaryColor" value="${escapeAttr(s.primaryColor)}" />
            </label>
            <label class="field">
              <span>Secondary color</span>
              <input class="input" name="secondaryColor" value="${escapeAttr(s.secondaryColor)}" />
            </label>
            <label class="field">
              <span>Accent color</span>
              <input class="input" name="accentColor" value="${escapeAttr(s.accentColor)}" />
            </label>
            <label class="field">
              <span>Owner name</span>
              <input class="input" name="ownerName" value="${escapeAttr(s.ownerName)}" />
            </label>
          </div>
        </div>
      </div>
      <div class="settings-card">
        <div class="card-head">
          <div>
            <h3>Notifications</h3>
            <p>Control how QA updates reach the team.</p>
          </div>
        </div>
        <div class="stack">
          <label class="toggle"><input type="checkbox" name="emailNotifications" ${s.emailNotifications ? "checked" : ""} /> <span>Email notifications</span></label>
          <label class="toggle"><input type="checkbox" name="runAlerts" ${s.runAlerts ? "checked" : ""} /> <span>Run completion alerts</span></label>
          <label class="toggle"><input type="checkbox" name="slackSummaries" ${s.slackSummaries ? "checked" : ""} /> <span>Slack summaries</span></label>
          <label class="toggle"><input type="checkbox" name="releaseReminders" ${s.releaseReminders ? "checked" : ""} /> <span>Release reminders</span></label>
        </div>
      </div>
      <div class="settings-card">
        <div class="card-head">
          <div>
            <h3>Roles</h3>
            <p>Who can manage suites, runs, and integrations.</p>
          </div>
        </div>
        <div class="stack">
          <div class="activity-item"><div><strong>QA Engineer</strong><div><small>Full workspace control</small></div></div><span class="pill passed">Active</span></div>
          <div class="activity-item"><div><strong>Contributor</strong><div><small>Create and execute tests</small></div></div><span class="pill neutral">Default</span></div>
          <div class="activity-item"><div><strong>Viewer</strong><div><small>Read-only reporting access</small></div></div><span class="pill neutral">Limited</span></div>
        </div>
      </div>
      <div class="settings-card">
        <div class="card-head">
          <div>
            <h3>Danger zone</h3>
            <p>Archive this demo workspace or export its content.</p>
          </div>
        </div>
        <div class="stack">
          <button class="ghost-btn" type="button" data-action="show-toast" data-toast="Workspace archived">Archive workspace</button>
          <button class="danger-btn" type="button" data-action="show-toast" data-toast="Workspace deletion is disabled in demo">Delete workspace</button>
        </div>
      </div>
    </form>
  `;
}

function tabChip(id, label, active, attr) {
  return `<button class="tab-chip ${active ? "active" : ""}" ${attr}="${id}">${label}</button>`;
}

function prettyTab(tab) {
  return {
    overview: "Overview",
    "project-quality": "Project quality",
    "testing-health": "Testing health",
    "ai-impact": "AI impact",
  }[tab] || tab;
}

function prettyReportTab(tab) {
  return {
    overview: "Overview",
    "test-case-analytics": "Test case analytics",
    "test-plan-analytics": "Test suite analytics",
    "test-run-performance": "Test run performance",
    "execution-efficiency": "Execution efficiency",
  }[tab] || tab;
}

function renderEmptyState(title, copy) {
  return `
    <div class="empty-state surface-card">
      <div class="empty-panel">
        <div class="empty-icon">${documentIcon()}</div>
        <h3>${title}</h3>
        <p class="muted">${copy}</p>
        <button class="primary-btn dark" data-action="show-toast" data-toast="Empty state action used">Add item</button>
      </div>
    </div>
  `;
}

function emptyMini(text) {
  return `
    <div class="empty-panel">
      <div class="empty-icon" style="width:72px;height:72px;border-radius:22px;">${documentIcon()}</div>
      <strong>${text}</strong>
    </div>
  `;
}

function smallStat(label, value) {
  return `<div class="activity-item"><div><strong>${label}</strong></div><strong>${value}</strong></div>`;
}

function smallKpi(value, label) {
  return `<div class="kpi-card"><strong>${value}</strong><span>${label}</span></div>`;
}

function editIcon() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/></svg>`;
}

function trashIcon() {
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></svg>`;
}

function renderBackdrop() {
  return state.modal || state.drawer || state.confirmDelete ? `<div class="backdrop" data-close="true"></div>` : "";
}

function renderDrawer() {
  if (state.drawer !== "test-case" || !state.editor) return "";
  const editor = getEditorState(state.editor.entity, state.editor.mode, state.editor.id);
  if (!editor) return "";
  return `
    <aside class="drawer open">
      <div class="drawer-head">
        <div>
          <h3>${editor.title}</h3>
          <div class="workspace-meta">${editor.description}</div>
        </div>
        <button class="icon-btn" data-close="true" aria-label="Close drawer">${closeIcon()}</button>
      </div>
      <form class="drawer-body" data-submit="save-entity">
        ${renderEditorFields(editor.fields, "drawer")}
        <div class="drawer-actions">
          <button class="ghost-btn" type="button" data-close="true">Cancel</button>
          <button class="primary-btn dark" type="submit">${editor.submitLabel}</button>
        </div>
      </form>
    </aside>
  `;
}

function renderModal() {
  const modal = state.modal;
  if (state.confirmDelete) {
    const { entity, id } = state.confirmDelete;
    const record = getEntityRecord(entity, id);
    return `
      <section class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Delete ${getEntityLabel(entity).toLowerCase()}</h3>
            <div class="workspace-meta">This action will remove <strong>${escapeHtml(record?.name || record?.title || record?.id || "this item")}</strong>.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="delete-entity-confirm">
          <p class="muted">This cannot be undone.</p>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="danger-btn" type="submit">Delete</button>
          </div>
        </form>
      </section>
    `;
  }
  if (state.viewer) {
    const { entity, id } = state.viewer;
    if (entity === "file") {
      return `
        <section class="modal" role="dialog" aria-modal="true">
          <div class="modal-head">
            <div>
              <h3>Reference file</h3>
              <div class="workspace-meta">${escapeHtml(id)}</div>
            </div>
            <button class="icon-btn" data-close="true">${closeIcon()}</button>
          </div>
          <div class="modal-body">
            <div class="empty-panel">
              <div class="empty-icon">${documentIcon()}</div>
              <strong>${escapeHtml(id)}</strong>
              <div class="muted">Reference preview is attached to the current test run.</div>
            </div>
          </div>
        </section>
      `;
    }
    const record = getEntityRecord(entity, id);
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>${getEntityLabel(entity)} details</h3>
            <div class="workspace-meta">Read-only view for the selected item.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <div class="modal-body">
          ${renderEntityPreview(entity, record)}
        </div>
      </section>
    `;
  }
  if (!modal) return "";
  if (modal === "entity" && state.editor?.entity === "test-suite") {
    const editor = getEditorState(state.editor.entity, state.editor.mode, state.editor.id);
    if (!editor) return "";
    const currentSuite = getEntityRecord("test-suite", state.editor.id);
    const selectedFolderNames = new Set(currentSuite?.includedFolders || []);
    const selectedCaseIds = new Set(currentSuite?.includedCaseIds || []);
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>${editor.title}</h3>
            <div class="workspace-meta">${editor.description}</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="save-entity">
          ${renderEditorFields(editor.fields, "modal")}
          <div class="selection-grid">
            <div class="selection-card">
              <div class="card-head"><div><h3>Include folders</h3><p>Select a folder to take every test case inside.</p></div></div>
              <div class="stack">
                ${state.folders
                  .map(
                    (folder) => `
                      <label class="toggle">
                        <input type="checkbox" name="includedFolders" value="${escapeAttr(folder.name)}" ${selectedFolderNames.has(folder.name) ? "checked" : ""} />
                        <span>${escapeHtml(folder.name)} <small class="workspace-meta">(${getFolderCaseCount(folder.name)} cases)</small></span>
                      </label>
                    `,
                  )
                  .join("")}
              </div>
            </div>
            <div class="selection-card">
              <div class="card-head"><div><h3>Pick individual cases</h3><p>Choose one by one when you do not want the full folder.</p></div></div>
              <div class="stack selection-scroll">
                ${state.testCases
                  .map(
                    (testCase) => `
                      <label class="toggle">
                        <input type="checkbox" name="includedCaseIds" value="${escapeAttr(testCase.id)}" ${selectedCaseIds.has(testCase.id) ? "checked" : ""} />
                        <span><strong>${escapeHtml(testCase.title)}</strong><div class="workspace-meta">${escapeHtml(testCase.folder)} · ${escapeHtml(testCase.priority)}</div></span>
                      </label>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">${editor.submitLabel}</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "entity" && state.editor) {
    const editor = getEditorState(state.editor.entity, state.editor.mode, state.editor.id);
    if (!editor) return "";
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>${editor.title}</h3>
            <div class="workspace-meta">${editor.description}</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="save-entity">
          ${renderEditorFields(editor.fields, "modal")}
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">${editor.submitLabel}</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "run-cases") {
    const run = state.runs.find((item) => item.id === state.modalContext?.runId);
    if (!run) return "";
    return renderRunCasePicker(run);
  }
  if (modal === "project") {
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Add project</h3>
            <div class="workspace-meta">Create a new project in the workspace.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="add-project">
          <div class="form-grid">
            <label class="field">
              <span>Project name</span>
              <input class="input" name="name" placeholder="Enter project name" required />
            </label>
            <label class="field">
              <span>Description</span>
              <textarea class="input textarea" name="description" placeholder="Enter description"></textarea>
            </label>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Save</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "folder") {
    return `
      <section class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Create new folder</h3>
            <div class="workspace-meta">Group related test cases together.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="create-folder">
          <label class="field">
            <span>Folder name</span>
            <input class="input" name="folder" placeholder="Enter folder name" required />
          </label>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Create</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "import") {
    return `
      <section class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Import requirements</h3>
            <div class="workspace-meta">Upload a PDF, Markdown, or text source.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="import-requirements">
          <div class="upload-zone">
            <div>
              ${uploadIconLarge()}
              <strong>Drop file here or browse</strong>
              <span>Maximum file size 10MB</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Import</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "ai") {
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Generate with AI</h3>
            <div class="workspace-meta">Create a draft test case from a source document or URL.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="generate-ai">
          <div class="form-grid">
            <label class="field">
              <span>Test case name</span>
              <input class="input" name="name" placeholder="Enter test case name" required />
            </label>
            <div class="field">
              <span>Preferred method</span>
              <div class="controls-row">
                <label class="toggle"><input type="radio" name="source" checked /> <span>Upload file</span></label>
                <label class="toggle"><input type="radio" name="source" /> <span>Public URL</span></label>
                <label class="toggle"><input type="radio" name="source" /> <span>3rd party source</span></label>
              </div>
            </div>
          </div>
          <div class="upload-zone">
            <div>
              ${uploadIconLarge()}
              <strong>Drop file here or browse</strong>
              <span>Supported formats: PDF, DOCX, MD, TXT, CSV</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Continue</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "requirements") {
    return `
      <section class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Upload requirements</h3>
            <div class="workspace-meta">Upload and extract requirement content.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="import-requirements">
          <div class="upload-zone">
            <div>
              ${uploadIconLarge()}
              <strong>Drop file here or browse</strong>
              <span>Supported formats: PDF, DOCX</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Upload requirements</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "test-plan") {
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Create test plan</h3>
            <div class="workspace-meta">Build a plan and group the runs it should own.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="add-test-plan">
          <div class="form-grid">
            <label class="field"><span>Name</span><input class="input" name="name" placeholder="Enter test plan name" required /></label>
            <label class="field"><span>Description</span><textarea class="input textarea" name="description" placeholder="Enter test plan description"></textarea></label>
          </div>
          <div class="form-grid two">
            <label class="field"><span>Status</span><select class="input" name="status"><option>Draft</option><option>Active</option><option>Completed</option></select></label>
            <label class="field"><span>Environment</span><input class="input" name="environment" placeholder="staging, production" /></label>
            <label class="field"><span>Build version</span><input class="input" name="build" placeholder="v1.2.3" /></label>
            <label class="field"><span>Release version</span><input class="input" name="release" placeholder="2026.8" /></label>
          </div>
          <label class="field"><span>Run grouping</span><input class="input" name="grouping" placeholder="1 Run or dynamic grouping" /></label>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Create</button>
          </div>
        </form>
      </section>
    `;
  }
  if (modal === "test-run") {
    return `
      <section class="modal wide" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3>Create test run</h3>
            <div class="workspace-meta">Define the execution window and included cases.</div>
          </div>
          <button class="icon-btn" data-close="true">${closeIcon()}</button>
        </div>
        <form class="modal-body" data-submit="add-test-run">
          <div class="form-grid">
            <label class="field"><span>Name</span><input class="input" name="name" placeholder="Enter test run name" required /></label>
            <label class="field"><span>Description</span><textarea class="input textarea" name="description" placeholder="Enter test run description"></textarea></label>
          </div>
          <div class="form-grid two">
            <label class="field"><span>Environment</span><input class="input" name="environment" placeholder="staging, production" /></label>
            <label class="field"><span>Build version</span><input class="input" name="build" placeholder="v1.2.3" /></label>
            <label class="field"><span>Release version</span><input class="input" name="release" placeholder="2026.8" /></label>
            <label class="field"><span>Type</span><select class="input" name="type"><option>General</option><option>Smoke</option><option>Regression</option></select></label>
          </div>
          <label class="field">
            <span>Source suite</span>
            <select class="input" name="suite">
              <option value="">Use current test cases</option>
              ${state.plans.map((plan) => `<option value="${escapeAttr(plan.id)}">${escapeHtml(plan.name)}</option>`).join("")}
            </select>
          </label>
          <div class="modal-actions">
            <button class="ghost-btn" type="button" data-close="true">Cancel</button>
            <button class="primary-btn dark" type="submit">Create</button>
          </div>
        </form>
      </section>
    `;
  }
  return "";
}

function renderEditorFields(fields, surface = "modal") {
  const layoutClass = surface === "drawer" ? "form-grid" : "form-grid";
  return `
    <div class="${layoutClass}">
      ${fields
        .map((field) => {
          if (field.type === "file") {
            return `
              <label class="field">
                <span>${escapeHtml(field.label)}</span>
                <input class="input" type="file" name="${escapeAttr(field.name)}" ${field.accept ? `accept="${escapeAttr(field.accept)}"` : ""} ${field.multiple ? "multiple" : ""} />
              </label>
            `;
          }
          if (field.type === "textarea") {
            return `
              <label class="field">
                <span>${escapeHtml(field.label)}</span>
                <textarea class="input textarea" name="${escapeAttr(field.name)}" placeholder="${escapeAttr(field.label)}">${escapeHtml(field.value || "")}</textarea>
              </label>
            `;
          }
          if (field.type === "select") {
            return `
              <label class="field">
                <span>${escapeHtml(field.label)}</span>
                <select class="input" name="${escapeAttr(field.name)}">
                  ${field.options
                    .map(
                      (option) => `
                        <option value="${escapeAttr(option)}" ${option === field.value ? "selected" : ""}>${escapeHtml(option)}</option>
                      `,
                    )
                    .join("")}
                </select>
              </label>
            `;
          }
          return `
            <label class="field">
              <span>${escapeHtml(field.label)}</span>
              <input class="input" type="${field.type || "text"}" name="${escapeAttr(field.name)}" value="${escapeAttr(field.value || "")}" placeholder="${escapeAttr(field.label)}" />
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderEntityPreview(entity, record) {
  if (!record) {
    return `<div class="empty-panel"><strong>No details available</strong></div>`;
  }
  if (entity === "requirement") {
    return `
      <div class="stack">
        ${smallStat("Requirement ID", record.id)}
        ${smallStat("Name", record.name)}
        ${smallStat("Status", record.status)}
        ${record.score ? smallStat("Score", record.score) : ""}
        ${
          record.attachmentName
            ? `
              <div class="activity-item">
                <div>
                  <strong>Uploaded requirement</strong>
                  <div><small>${escapeHtml(record.attachmentName)}</small></div>
                  <div class="workspace-meta">${escapeHtml(record.attachmentType || "Uploaded file")}</div>
                </div>
                <button class="ghost-btn" type="button" data-action="preview-file" data-file="${escapeAttr(record.attachmentName)}">Open file</button>
              </div>
            `
            : `<div class="empty-panel"><strong>No uploaded file</strong><small class="muted">Upload a PDF or DOCX to see it here.</small></div>`
        }
      </div>
    `;
  }
  if (entity === "test-case") {
    return `
      <div class="stack">
        ${smallStat("Test case ID", record.id)}
        ${smallStat("Title", record.title)}
        ${smallStat("Folder", record.folder)}
        ${smallStat("Priority", record.priority)}
        ${smallStat("Status", record.status)}
        ${record.precondition ? smallStat("Pre-conditions", record.precondition) : ""}
        ${record.steps ? smallStat("Step", record.steps) : ""}
        ${record.expected ? smallStat("Expected result", record.expected) : ""}
      </div>
    `;
  }
  if (entity === "test-suite") {
    return `
      <div class="stack">
        ${smallStat("Suite ID", record.id)}
        ${smallStat("Name", record.name)}
        ${smallStat("Status", record.status)}
        ${smallStat("Grouping", record.grouping || "Dynamic")}
        ${smallStat("Environment", record.environment || "staging")}
      </div>
    `;
  }
  if (entity === "project") {
    return `
      <div class="stack">
        ${smallStat("Project ID", record.id)}
        ${smallStat("Name", record.name)}
        ${smallStat("Owner", record.owner)}
        ${smallStat("Status", record.status)}
        ${smallStat("Description", record.description || "No description")}
      </div>
    `;
  }
  return `<div class="stack">${smallStat("ID", record.id)}${smallStat("Name", record.name || record.title || "Item")}</div>`;
}

function renderToast() {
  if (!state.toast) return "";
  return `
    <div style="position:fixed; right:20px; bottom:20px; z-index:60; padding:14px 16px; border-radius:16px; background:#111; color:#fff; box-shadow:0 18px 32px rgba(0,0,0,0.22);">
      ${escapeHtml(state.toast)}
    </div>
  `;
}

function hydrateCharts() {
  document.querySelectorAll("[data-line-chart]").forEach((el) => {
    const points = JSON.parse(el.dataset.points || "[]");
    el.innerHTML = lineChartSvg(points, { color: "#ffde00", fill: "rgba(255, 237, 122, 0.22)" });
  });
}

function lineChartSvg(points, palette = {}) {
  const width = 640;
  const height = 240;
  const padding = 26;
  const min = 0;
  const max = 100;
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);
  const mapY = (value) => height - padding - ((value - min) / (max - min)) * (height - padding * 2);
  const coords = points.map((value, index) => [padding + index * stepX, mapY(value)]);
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${padding},${height - padding} ${coords.map(([x, y]) => `${x},${y}`).join(" ")} ${width - padding},${height - padding}`;
  return `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.fill || "rgba(255, 237, 122, 0.24)"}" />
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>
      ${Array.from({ length: 5 }, (_, i) => {
        const y = padding + (i * (height - padding * 2)) / 4;
        return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" stroke="rgba(233,236,239,0.96)" />`;
      }).join("")}
      <polygon points="${area}" fill="url(#chartFill)" />
      <polyline points="${line}" fill="none" stroke="${palette.color || "#4d7cff"}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      ${coords
        .map(
          ([x, y]) => `
            <circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="${palette.color || "#4d7cff"}" stroke-width="4" />
          `,
        )
        .join("")}
    </svg>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function dashboardIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h7V4H4z"/><path d="M13 20h7V12h-7z"/><path d="M13 4h7v5h-7z"/><path d="M4 16h7v4H4z"/></svg>`;
}

function folderIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 7.5h6l2 2H20.5v8.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2z"/><path d="M3.5 7.5V6a2 2 0 0 1 2-2h3.4c.5 0 1 .2 1.4.6l1.2 1.4"/></svg>`;
}

function requirementIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 4h10v16H7z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`;
}

function testcaseIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7h13M8 12h13M8 17h13"/><path d="M3 7h.01M3 12h.01M3 17h.01"/></svg>`;
}

function planIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`;
}

function runIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 6h10v12H7z"/><path d="M10 9l5 3-5 3z"/></svg>`;
}

function issueIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 2.7 18h18.6L12 2z"/><path d="M12 9v4"/><path d="M12 16h.01"/></svg>`;
}

function reportIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5z"/><path d="M8 15v-3M12 15V9M16 15V7"/></svg>`;
}

function settingsIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z"/><path d="M19.4 12a7.4 7.4 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7.8 7.8 0 0 0-1.7-1l-.4-2.6H9.2l-.4 2.6a7.8 7.8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.8 7.8 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7.8 7.8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.6.1-1z"/></svg>`;
}

function searchIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>`;
}

function shareIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 13l8-4"/><path d="M8 11l8 4"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/></svg>`;
}

function bellIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 18H5l1.2-2.2A7.8 7.8 0 0 0 7 12V9a5 5 0 0 1 10 0v3c0 .9.2 1.7.8 3L19 18z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>`;
}

function sparkIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/></svg>`;
}

function avatarIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`;
}

function menuIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
}

function uploadIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M4 19h16"/></svg>`;
}

function uploadIconLarge() {
  return `<svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><rect x="4" y="17" width="16" height="2" rx="1"/></svg>`;
}

function syncIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 12a8 8 0 0 0-14.3-4.9"/><path d="M4 12a8 8 0 0 0 14.3 4.9"/><path d="M20 5v6h-6"/><path d="M4 19v-6h6"/></svg>`;
}

function warningIcon() {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2.8 19h18.4L12 3z"/><path d="M12 9v4"/><path d="M12 16h.01"/></svg>`;
}

function ellipsisIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>`;
}

function documentIcon() {
  return `<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6M9 9h2"/></svg>`;
}

function plusIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>`;
}

function closeIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
}

function projectIcon() {
  return `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8"/></svg>`;
}

render();
