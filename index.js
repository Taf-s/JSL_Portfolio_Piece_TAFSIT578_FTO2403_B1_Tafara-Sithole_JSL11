// Importing helper functions from utils

import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";

// Immporting initialData
import { initialData } from "./initialData.js";

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  console.log("Checking if data exists in localStorage...");
  if (!localStorage.getItem("tasks")) {
    console.log("Data does not exist in localStorage. Loading initial data...");
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

initializeData();

// Got elements from the DOM
const elements = {
  navSideBar: {
    sideBarDiv: document.getElementById("side-bar-div"),
    sideLogo: document.getElementById("side-logo-div"),
    logo: document.getElementById("logo"),
    boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
    headlineSidePanel: document.getElementById("headline-sidepanel"),
    iconDark: document.getElementById("icon-dark"),
    iconLight: document.getElementById("icon-light"),
    hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
    showSideBarBtn: document.getElementById("show-side-bar-btn"),
    themeSwitch: document.getElementById("switch"),
  },

  header: {
    headerBoardName: document.getElementById("header-board-name"),
    dropdownBtn: document.getElementById("dropdownBtn"),
    dropDownIcon: document.getElementById("dropDownIcon"),
    logoMobile: document.querySelector(".logo-mobile"),
    addNewTaskBtn: document.getElementById("add-new-task-btn"),
    editBoardBtn: document.getElementById("edit-board-btn"),
    editBoardDiv: document.getElementById("editBoardDiv"),
    deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  },

  taskColumns: {
    todoHeadDiv: document.getElementById("todo-head-div"),
    todoText: document.getElementById("toDoText"),
    doingHeadDiv: document.getElementById("doing-head-div"),
    doingText: document.getElementById("doingText"),
    doneHeadDiv: document.getElementById("done-head-div"),
    doneText: document.getElementById("doneText"),
  },

  newTaskModal: {
    newTaskModalWindow: document.getElementById("new-task-modal-window"),
    titleInput: document.getElementById("title-input"),
    descInput: document.getElementById("desc-input"),
    selectStatus: document.getElementById("select-status"),
    createTaskBtn: document.getElementById("create-task-btn"),
    cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  },

  editTaskModal: {
    editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
    editTaskForm: document.getElementById("edit-task-form"),
    editTaskTitleInput: document.getElementById("edit-task-title-input"),
    editTaskDescInput: document.getElementById("edit-task-desc-input"),
    editSelectStatus: document.getElementById("edit-select-status"),
    saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
    cancelEditBtn: document.getElementById("cancel-edit-btn"),
    deleteTaskBtn: document.getElementById("delete-task-btn"),
  },

  filterDiv: document.getElementById("filterDiv"),
  columnDivs: document.getElementsByClassName("tasks-container"),
  modalWindow: document.querySelector(".modal-window"),
};

let activeBoard = "";

// // Function fetches tasks from localStorage and extracts unique board names
// // Filters out empty or null board names and removes duplicates
// // Displays the boards in the DOM
// // If there are boards, selects the active board based on localStorage or the first board in the list
// // Updates the header with the active board name
// // Calls the styleActiveBoard function to style the active board
// // Calls the refreshTasksUI function to refresh the UI with tasks for the active board
function fetchAndDisplayBoardsAndTasks() {
  try {
    // Get tasks from localStorage
    const tasks = getTasks();

    // Extract board names from tasks
    const boards = tasks
      .map((task) => task.board)
      .filter(Boolean)
      .filter((board) => board !== null);

    // Remove duplicates from board names
    const uniqueBoards = [...new Set(boards)];

    // Display the boards in the DOM
    displayBoards(uniqueBoards);

    // If there are boards, set the active board
    if (uniqueBoards.length > 0) {
      // Get the active board from localStorage or use the first board in the list
      const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
      activeBoard = localStorageBoard || uniqueBoards[0];

      // Update the header with the active board name
      elements.header.headerBoardName.textContent = activeBoard;

      // Style the active board
      styleActiveBoard(activeBoard);

      // Refresh the UI with tasks for the active board
      refreshTasksUI();
    }
  } catch (error) {
    // If there's an error, log it to the console
    console.error("Error fetching and displaying boards:", error);
  }
}

// // Function for creating different boards in the DOM

function displayBoards(boards) {
  const boardsContainer = elements.navSideBar.boardsNavLinksDiv;
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.header.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// // Function that filters tasks corresponding to the board name and displays them on the DOM.

// // Column titles defined globally
const columnTitles = {
  todo: "TODO",
  doing: "DOING",
  done: "DONE",
};
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function

  const filteredTasks = tasks.filter((task) => task.board === boardName);
  console.log(filteredTasks);

  Array.prototype.forEach.call(elements.columnDivs, (column, index) => {
    const status = column.getAttribute("data-status");
    const title = columnTitles[index]; // Utilize columnTitles based on index

    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                      
                       
                      </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

// // Function for refreshing the task UI
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// // Function that styles the active board by adding an active class
function styleActiveBoard(boardName) {
  const buttons = document.querySelectorAll(".board-btn");

  buttons.forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  console.log(boardName);
}

// // Function for appending the task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(
    '.column-div[data-status="${task.status}"]'
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild();
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () => {
    toggleModal(false, elements.editTaskModal.editTaskModalWindow);
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false, elements);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Hide sidebar event listener
  elements.navSideBar.hideSideBarBtn.addEventListener("click", () => {
    toggleSidebar(false);
  });

  // Show sidebar event listener
  elements.navSideBar.showSideBarBtn.addEventListener("click", () => {
    toggleSidebar(true);
  });

  // Show the side Bar button
  elements.navSideBar.showSideBarBtn.style.display = "block";

  // Theme switch event listener
  elements.navSideBar.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.header.addNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// // Function that Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

// // Function for adding a new task
function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task_id = JSON.parse(localStorage.getItem("id"));
  const titleInput = elements.newTaskModal.titleInput.value;
  const descInput = elements.newTaskModal.descInput.value;
  const selectStatus = elements.newTaskModal.selectStatus.value;

  const task = {
    id: task_id,
    title: titleInput,
    desc: descInput,
    status: selectStatus,
    board: activeBoard,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

// Function for toogling the SideBar
function toggleSidebar(show) {
  const sidebar = elements.navSideBar.sideBarDiv;
  sidebar.style.display = show ? "block" : "none";
}
// Event listener for button that shows the SideBar
const showSidebarBtn = elements.navSideBar.showSideBarBtn;
showSidebarBtn.addEventListener("click", () => {
  toggleSidebar(true);
});
// Event listener for button that hides the SideBar
const hideSidebarBtn = elements.navSideBar.hideSideBarBtn;
hideSidebarBtn.addEventListener("click", () => {
  toggleSidebar(false);
});

// Set initial theme based on localStorage value
const lightMode = localStorage.getItem("lightMode") === "true";
if (lightMode) {
  document.body.classList.add("light-mode");
  elements.navSideBar.themeSwitch.checked = true;
  elements.navSideBar.iconDark.style.display = "none";
  elements.navSideBar.iconLight.style.display = "block";
} else {
  document.body.classList.remove("light-mode");
  elements.navSideBar.themeSwitch.checked = false;
  elements.navSideBar.iconDark.style.display = "block";
  elements.navSideBar.iconLight.style.display = "none";
}

// Function for handling theme switch between light and dark mode
function toggleTheme() {
  const isLightTheme = elements.navSideBar.themeSwitch.checked;
  console.log("Theme toggle called. Is Light Theme:", isLightTheme);

  if (isLightTheme) {
    console.log("Switching to Light Mode");
    document.body.classList.add("light-mode");
    elements.navSideBar.iconDark.style.display = "none";
    elements.navSideBar.iconLight.style.display = "block";
    localStorage.setItem("lightMode", "true");
  } else {
    console.log("Switching to Dark Mode");
    document.body.classList.remove("light-mode");
    elements.navSideBar.iconDark.style.display = "block";
    elements.navSideBar.iconLight.style.display = "none";
    localStorage.setItem("lightMode", "false");
  }

  console.log("New theme applied");
  console.log("Light Mode:", document.body.classList.contains("light-mode"));
  console.log("Theme Switch Checked:", elements.navSideBar.themeSwitch.checked);
  console.log("Icon Dark Display:", elements.navSideBar.iconDark.style.display);
  console.log(
    "Icon Light Display:",
    elements.navSideBar.iconLight.style.display
  );
  console.log(
    "Light Mode in Local Storage:",
    localStorage.getItem("lightMode")
  );
}
// // Function for opening the Edit Task Modal
function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = elements.editTaskModal.editTaskTitleInput;
  const descriptionInput = elements.editTaskModal.editTaskDescInput;
  const statusInput = elements.editTaskModal.editSelectStatus;

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusInput.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  // Remove previous event listeners to prevent duplication
  const newSaveChangesBtn = saveChangesBtn.cloneNode(true);
  saveChangesBtn.parentNode.replaceChild(newSaveChangesBtn, saveChangesBtn);
  const newDeleteTaskBtn = deleteTaskBtn.cloneNode(true);
  deleteTaskBtn.parentNode.replaceChild(newDeleteTaskBtn, deleteTaskBtn);

  // Add event listeners to the new buttons
  newSaveChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
    refreshTasksUI();
  });

  newDeleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal.editTaskModalWindow);
    refreshTasksUI();
  });

  toggleModal(true, elements.editTaskModal.editTaskModalWindow); // Show the edit task modal
}

// // Function for saving the Task Changes
function saveTaskChanges(taskId) {
  if (!taskId) console.log("No taskId provided for saveTaskChanges");

  // Get new user inputs
  const titleInput = elements.editTaskModal.editTaskTitleInput;
  const descriptionInput = elements.editTaskModal.editTaskDescInput;
  const statusInput = elements.editTaskModal.editSelectStatus;

  const updatedTask = {
    title: titleInput.value,
    description: descriptionInput.value,
    status: statusInput.value,
  };

  // // Update task in local storage
  // const tasks = JSON.parse(localStorage.getItem("tasks"));
  // const updatedTasks = tasks.map((task) => {
  //   if (task.id === taskId) {
  //     return { ...task, ...updatedTask }; // Merge existing task with updatedTask
  //   }
  //   return task;
  // });
  // localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  // Update task using a helper function
  // putTask(taskId, updatedTask);

  // Update task using a helper function
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal.editTaskModalWindow);
  refreshTasksUI();
}

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  try {
    setupEventListeners();
    const showSidebar = localStorage.getItem("showSideBar");
    if (showSidebar === null) {
      console.log("No showSidebar in localStorage");
    }
    toggleSidebar(showSidebar === "true");

    const isLightTheme = localStorage.getItem("lightMode");
    if (isLightTheme === null) {
      console.log("No lightMode in localStorage");
    }
    document.body.classList.toggle("light-mode", isLightTheme === "true");
    elements.navSideBar.themeSwitch.checked = isLightTheme === "true";

    fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  } catch (error) {
    console.error("Error in init:", error);
  }
}
