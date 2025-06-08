// Firebase v8 compat - loaded via script tags in HTML

// Declare firebase variable
const firebase = window.firebase

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClfhBHT3B5AYmH_EU3s4MVbkYgQjXcZFk",
  authDomain: "school-organizer-project.firebaseapp.com",
  projectId: "school-organizer-project",
  storageBucket: "school-organizer-project.firebasestorage.app",
  messagingSenderId: "1031486054079",
  appId: "1:1031486054079:web:d0a67647d02cd83e0d300a",
  measurementId: "G-R82EF7TCLT",
}

// Initialize Firebase using v8 compat syntax
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
const auth = firebase.auth()

// Global variables
let subjects = []
let assignments = []
let notes = []
let lectures = []
let currentUser = null
let unsubscribeFunctions = [] // Store unsubscribe functions for cleanup
let isDebugMode = false // Toggle debug mode

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 School Organizer initializing...")

  // Test Firebase immediately
  testFirebaseConnection()

  setupAuthStateListener()
  setupEventListeners()

  // Enable debug mode if URL contains debug parameter
  if (window.location.search.includes("debug=true")) {
    enableDebugMode()
  }
})

// Test Firebase connection function
function testFirebaseConnection() {
  console.log("Testing Firebase connection...")
  updateDebugInfo("Testing Firebase connection...")

  try {
    if (typeof firebase !== "undefined") {
      updateDebugInfo("✅ Firebase SDK loaded successfully")
      console.log("✅ Firebase SDK loaded successfully")

      if (firebase.apps.length > 0) {
        updateDebugInfo("✅ Firebase app initialized")
        console.log("✅ Firebase app initialized")
      } else {
        updateDebugInfo("❌ Firebase app NOT initialized")
        console.log("❌ Firebase app NOT initialized")
      }

      if (auth) {
        updateDebugInfo("✅ Auth service available")
        console.log("✅ Auth service available")
      } else {
        updateDebugInfo("❌ Auth service NOT available")
        console.log("❌ Auth service NOT available")
      }

      if (db) {
        updateDebugInfo("✅ Firestore service available")
        console.log("✅ Firestore service available")
      } else {
        updateDebugInfo("❌ Firestore service NOT available")
        console.log("❌ Firestore service NOT available")
      }
    } else {
      updateDebugInfo("❌ Firebase SDK not loaded")
      console.log("❌ Firebase SDK not loaded")
    }
  } catch (error) {
    updateDebugInfo(`❌ Firebase test error: ${error.message}`)
    console.error("Firebase test error:", error)
  }
}

// Debug functions
function enableDebugMode() {
  isDebugMode = true
  const debugPanel = document.getElementById("debugPanel")
  if (debugPanel) {
    debugPanel.style.display = "block"
  }
  updateDebugInfo("Debug mode enabled")
}

function updateDebugInfo(message) {
  const timestamp = new Date().toLocaleTimeString()
  console.log(`🐛 ${timestamp}: ${message}`)

  if (!isDebugMode) return

  const debugInfo = document.getElementById("debugInfo")
  if (debugInfo) {
    debugInfo.innerHTML += `<div><small>${timestamp}: ${message}</small></div>`
    // Auto-scroll to bottom
    debugInfo.scrollTop = debugInfo.scrollHeight
  }
}

// Setup authentication state listener
function setupAuthStateListener() {
  updateDebugInfo("Setting up auth state listener...")

  auth.onAuthStateChanged((user) => {
    if (user) {
      updateDebugInfo(`User signed in: ${user.email}`)
      currentUser = user
      showMainApp()
      updateUserProfile(user)
      setupRealtimeListeners()
      initializeAppDashboard()
    } else {
      updateDebugInfo("User signed out")
      currentUser = null
      showLoginScreen()
      clearData()
      cleanupListeners()
    }
  })
}

// Cleanup listeners when user signs out
function cleanupListeners() {
  updateDebugInfo(`Cleaning up ${unsubscribeFunctions.length} listeners...`)
  unsubscribeFunctions.forEach((unsubscribe) => {
    if (typeof unsubscribe === "function") {
      try {
        unsubscribe()
      } catch (error) {
        console.error("Error cleaning up listener:", error)
      }
    }
  })
  unsubscribeFunctions = []
}

// Show login screen
function showLoginScreen() {
  const loginScreen = document.getElementById("loginScreen")
  const mainApp = document.getElementById("mainApp")

  if (loginScreen) loginScreen.style.display = "block"
  if (mainApp) mainApp.style.display = "none"
}

// Show main app
function showMainApp() {
  const loginScreen = document.getElementById("loginScreen")
  const mainApp = document.getElementById("mainApp")

  if (loginScreen) loginScreen.style.display = "none"
  if (mainApp) mainApp.style.display = "block"
}

// Update user profile in navbar
function updateUserProfile(user) {
  const userName = document.getElementById("userName")
  const userEmail = document.getElementById("userEmail")
  const userPhoto = document.getElementById("userPhoto")

  if (userName) userName.textContent = user.displayName || "User"
  if (userEmail) userEmail.textContent = user.email
  if (userPhoto) userPhoto.src = user.photoURL || userPhoto.src // Keep default if no photo
}

// Clear all data when user signs out
function clearData() {
  updateDebugInfo("Clearing all data...")
  subjects = []
  assignments = []
  notes = []
  lectures = []

  // Reset dashboard with loading state
  updateDashboard()
  updateConnectionStatus("disconnected")
}

// Update connection status
function updateConnectionStatus(status) {
  const statusElement = document.getElementById("connectionStatus")
  if (!statusElement) return

  if (status === "connected") {
    statusElement.className = "alert alert-success"
    statusElement.innerHTML = '<i class="fas fa-wifi me-2"></i>Connected to Firebase'
  } else if (status === "disconnected") {
    statusElement.className = "alert alert-secondary"
    statusElement.innerHTML = '<i class="fas fa-wifi me-2"></i>Disconnected from Firebase'
  } else if (status === "error") {
    statusElement.className = "alert alert-danger"
    statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Connection Error'
  }
}

// Initialize application
function initializeAppDashboard() {
  updateDebugInfo("Initializing dashboard...")
  showSection("dashboard")
  updateDashboard()
}

// Setup event listeners
function setupEventListeners() {
  updateDebugInfo("Setting up event listeners...")

  // Google Sign In
  const googleSignInBtn = document.getElementById("googleSignInBtn")
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", signInWithGoogle)
    updateDebugInfo("Google sign-in button listener added")
  } else {
    updateDebugInfo("ERROR: Google sign-in button not found!")
  }

  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

// Authentication functions
async function signInWithGoogle() {
  updateDebugInfo("Sign-in button clicked!")

  const provider = new firebase.auth.GoogleAuthProvider()
  const signInBtn = document.getElementById("googleSignInBtn")
  const errorDiv = document.getElementById("loginError")

  try {
    updateDebugInfo("Starting sign-in process...")

    // Update button state
    if (signInBtn) {
      signInBtn.disabled = true
      signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...'
    }

    if (errorDiv) {
      errorDiv.style.display = "none"
    }

    updateDebugInfo("Calling signInWithPopup...")
    const result = await auth.signInWithPopup(provider)
    updateDebugInfo(`Sign-in successful: ${result.user.email}`)
  } catch (error) {
    console.error("Error signing in:", error)
    updateDebugInfo(`Sign-in error: ${error.code} - ${error.message}`)

    let errorMessage = "Failed to sign in. Please try again."

    // Handle specific error cases
    if (error.code === "auth/popup-blocked") {
      errorMessage = "Popup was blocked. Please allow popups for this site and try again."
    } else if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in was cancelled. Please try again."
    } else if (error.code === "auth/unauthorized-domain") {
      errorMessage = "This domain is not authorized. Please contact support."
    }

    if (errorDiv) {
      errorDiv.textContent = errorMessage
      errorDiv.style.display = "block"
    }

    // Reset button state
    if (signInBtn) {
      signInBtn.disabled = false
      signInBtn.innerHTML = '<i class="fab fa-google me-2"></i>Sign in with Google'
    }
  }
}

// Sign out function
async function signOut() {
  try {
    updateDebugInfo("Signing out...")
    await auth.signOut()
    updateDebugInfo("Sign out successful")
  } catch (error) {
    console.error("Error signing out:", error)
    updateDebugInfo(`Sign out error: ${error.message}`)
    showAlert("Error signing out. Please try again.", "danger")
  }
}

// Setup real-time listeners for Firestore (user-specific data)
function setupRealtimeListeners() {
  if (!currentUser) {
    updateDebugInfo("No current user, skipping listener setup")
    return
  }

  const userId = currentUser.uid
  updateDebugInfo(`Setting up real-time listeners for user: ${userId}`)

  // Clean up existing listeners first
  cleanupListeners()

  try {
    // Subjects listener
    const subjectsUnsubscribe = db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .onSnapshot(
        (snapshot) => {
          updateDebugInfo(`Subjects snapshot received: ${snapshot.size} documents`)
          subjects = []
          snapshot.forEach((doc) => {
            subjects.push({ id: doc.id, ...doc.data() })
          })
          subjects.sort((a, b) => a.name.localeCompare(b.name))
          updateDebugInfo(`Processed ${subjects.length} subjects`)
          updateDashboard()
          updateConnectionStatus("connected")
          renderSubjects()
          populateSubjectSelect()
        },
        (error) => {
          console.error("Subjects listener error:", error)
          updateDebugInfo(`Subjects listener error: ${error.message}`)
          updateConnectionStatus("error")
        },
      )

    // Assignments listener
    const assignmentsUnsubscribe = db
      .collection("users")
      .doc(userId)
      .collection("assignments")
      .onSnapshot(
        (snapshot) => {
          updateDebugInfo(`Assignments snapshot received: ${snapshot.size} documents`)
          assignments = []
          snapshot.forEach((doc) => {
            assignments.push({ id: doc.id, ...doc.data() })
          })
          // Sort by due date
          assignments.sort((a, b) => {
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate) - new Date(b.dueDate)
          })
          updateDebugInfo(`Processed ${assignments.length} assignments`)
          updateDashboard()
          updateConnectionStatus("connected")
          renderAssignments()
        },
        (error) => {
          console.error("Assignments listener error:", error)
          updateDebugInfo(`Assignments listener error: ${error.message}`)
          updateConnectionStatus("error")
        },
      )

    // Notes listener
    const notesUnsubscribe = db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .onSnapshot(
        (snapshot) => {
          updateDebugInfo(`Notes snapshot received: ${snapshot.size} documents`)
          notes = []
          snapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() })
          })
          notes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          updateDebugInfo(`Processed ${notes.length} notes`)
          updateDashboard()
          updateConnectionStatus("connected")
          renderNotes()
        },
        (error) => {
          console.error("Notes listener error:", error)
          updateDebugInfo(`Notes listener error: ${error.message}`)
          updateConnectionStatus("error")
        },
      )

    // Lectures listener
    const lecturesUnsubscribe = db
      .collection("users")
      .doc(userId)
      .collection("lectures")
      .onSnapshot(
        (snapshot) => {
          updateDebugInfo(`Lectures snapshot received: ${snapshot.size} documents`)
          lectures = []
          snapshot.forEach((doc) => {
            lectures.push({ id: doc.id, ...doc.data() })
          })
          lectures.sort((a, b) => (a.topic || "").localeCompare(b.topic || ""))
          updateDebugInfo(`Processed ${lectures.length} lectures`)
          updateDashboard()
          updateConnectionStatus("connected")
          renderLectures()
        },
        (error) => {
          console.error("Lectures listener error:", error)
          updateDebugInfo(`Lectures listener error: ${error.message}`)
          updateConnectionStatus("error")
        },
      )

    // Store unsubscribe functions for cleanup
    unsubscribeFunctions.push(subjectsUnsubscribe, assignmentsUnsubscribe, notesUnsubscribe, lecturesUnsubscribe)

    updateDebugInfo("All real-time listeners set up successfully")
  } catch (error) {
    console.error("Error setting up listeners:", error)
    updateDebugInfo(`Listener setup error: ${error.message}`)
    updateConnectionStatus("error")
  }
}
// Navigation function
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none"
  })

  // Show selected section
  const targetSection = document.getElementById(sectionName)
  if (targetSection) {
    targetSection.style.display = "block"
  }

  // Update navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  // Find and activate the corresponding nav link
  const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }
}

// Enhanced dashboard update function
function updateDashboard() {
  updateDebugInfo("Updating dashboard...")

  // Update counts with animation
  updateCountWithAnimation("totalSubjects", subjects.length)
  updateCountWithAnimation("totalAssignments", assignments.length)
  updateCountWithAnimation("totalNotes", notes.length)
  updateCountWithAnimation("totalLectures", lectures.length)

  // Update upcoming assignments
  updateUpcomingAssignments()

  updateDebugInfo(
    `Dashboard updated - S:${subjects.length}, A:${assignments.length}, N:${notes.length}, L:${lectures.length}`,
  )
}

function updateCountWithAnimation(elementId, newValue) {
  const element = document.getElementById(elementId)
  if (!element) return

  const currentValue = Number.parseInt(element.textContent) || 0

  if (currentValue !== newValue) {
    element.style.transform = "scale(1.1)"
    element.textContent = newValue

    setTimeout(() => {
      element.style.transform = "scale(1)"
    }, 200)
  }
}

function updateUpcomingAssignments() {
  const upcomingContainer = document.getElementById("upcomingAssignments")
  if (!upcomingContainer) return

  if (!assignments || assignments.length === 0) {
    upcomingContainer.innerHTML = '<p class="text-muted">No assignments found</p>'
    return
  }

  const today = new Date()
  const upcomingAssignments = assignments
    .filter((assignment) => {
      if (!assignment.dueDate) return false
      const dueDate = new Date(assignment.dueDate)
      const timeDiff = dueDate.getTime() - today.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
      return daysDiff >= 0 && daysDiff <= 7 // Next 7 days
    })
    .slice(0, 5) // Show only first 5

  if (upcomingAssignments.length === 0) {
    upcomingContainer.innerHTML = '<p class="text-muted">No upcoming assignments in the next 7 days</p>'
    return
  }

  upcomingContainer.innerHTML = upcomingAssignments
    .map((assignment) => {
      const dueDate = new Date(assignment.dueDate)
      const timeDiff = dueDate.getTime() - today.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      let badgeClass = "bg-success"
      let urgencyText = `${daysDiff} day(s)`

      if (daysDiff === 0) {
        badgeClass = "bg-danger"
        urgencyText = "Today"
      } else if (daysDiff === 1) {
        badgeClass = "bg-warning"
        urgencyText = "Tomorrow"
      } else if (daysDiff <= 3) {
        badgeClass = "bg-warning"
      }

      return `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <strong>${assignment.title || "Untitled Assignment"}</strong>
            <br>
            <small class="text-muted">${assignment.subjectName || "Unknown Subject"}</small>
          </div>
          <span class="badge ${badgeClass}">Due in ${urgencyText}</span>
        </div>
      `
    })
    .join("")
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "No date"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showAlert(message, type) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  // Insert at top of container
  const container = document.querySelector(".container")
  if (container) {
    container.insertBefore(alertDiv, container.firstChild)
  }

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 5000)
}

// ====================== SUBJECTS MANAGEMENT ======================

async function addSubject() {
  const subjectName = document.getElementById("subjectName").value.trim()
  const subjectCode = document.getElementById("subjectCode").value.trim()
  const subjectColor = document.getElementById("subjectColor").value

  if (!subjectName) {
    showAlert("Please enter a subject name", "warning")
    return
  }

  try {
    updateDebugInfo(`Adding subject: ${subjectName}`)

    await db.collection("users").doc(currentUser.uid).collection("subjects").add({
      name: subjectName,
      code: subjectCode,
      color: subjectColor,
      createdAt: new Date().toISOString(),
    })

    // Clear form
    document.getElementById("subjectForm").reset()
    showAlert("Subject added successfully!", "success")
    updateDebugInfo(`Subject ${subjectName} added successfully`)
  } catch (error) {
    console.error("Error adding subject:", error)
    updateDebugInfo(`Error adding subject: ${error.message}`)
    showAlert("Error adding subject. Please try again.", "danger")
  }
}

async function deleteSubject(subjectId) {
  if (
    !confirm(
      "Are you sure you want to delete this subject? This will also delete all related assignments, notes, and lectures.",
    )
  ) {
    return
  }

  try {
    updateDebugInfo(`Deleting subject: ${subjectId}`)

    // Delete the subject
    await db.collection("users").doc(currentUser.uid).collection("subjects").doc(subjectId).delete()

    // Delete related data
    const batch = db.batch()

    // Delete assignments
    const assignmentsSnapshot = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("assignments")
      .where("subjectId", "==", subjectId)
      .get()
    assignmentsSnapshot.forEach((doc) => batch.delete(doc.ref))

    // Delete notes
    const notesSnapshot = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("notes")
      .where("subjectId", "==", subjectId)
      .get()
    notesSnapshot.forEach((doc) => batch.delete(doc.ref))

    // Delete lectures
    const lecturesSnapshot = await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("lectures")
      .where("subjectId", "==", subjectId)
      .get()
    lecturesSnapshot.forEach((doc) => batch.delete(doc.ref))

    await batch.commit()

    showAlert("Subject and all related data deleted successfully!", "success")
    updateDebugInfo(`Subject ${subjectId} and related data deleted`)
  } catch (error) {
    console.error("Error deleting subject:", error)
    updateDebugInfo(`Error deleting subject: ${error.message}`)
    showAlert("Error deleting subject. Please try again.", "danger")
  }
}

function renderSubjects() {
  const subjectsContainer = document.getElementById("subjectsList")
  if (!subjectsContainer) return

  if (subjects.length === 0) {
    subjectsContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-book fa-3x text-muted mb-3"></i>
        <p class="text-muted">No subjects added yet. Add your first subject above!</p>
      </div>
    `
    return
  }

  subjectsContainer.innerHTML = subjects
    .map(
      (subject) => `
    <div class="col-md-6 col-lg-4 mb-3">
      <div class="card h-100" style="border-left: 4px solid ${subject.color || "#007bff"}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0">${subject.name}</h5>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onclick="deleteSubject('${subject.id}')">
                  <i class="fas fa-trash me-2"></i>Delete
                </a></li>
              </ul>
            </div>
          </div>
          ${subject.code ? `<p class="text-muted mb-2">${subject.code}</p>` : ""}
          <div class="mt-3">
            <small class="text-muted">
              <i class="fas fa-calendar me-1"></i>
              Added ${formatDate(subject.createdAt)}
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// ====================== ASSIGNMENTS MANAGEMENT ======================

async function addAssignment() {
  const title = document.getElementById("assignmentTitle").value.trim()
  const description = document.getElementById("assignmentDescription").value.trim()
  const subjectId = document.getElementById("assignmentSubject").value
  const dueDate = document.getElementById("assignmentDueDate").value
  const priority = document.getElementById("assignmentPriority").value

  if (!title || !subjectId || !dueDate) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  try {
    const subject = subjects.find((s) => s.id === subjectId)

    await db.collection("users").doc(currentUser.uid).collection("assignments").add({
      title,
      description,
      subjectId,
      subjectName: subject.name,
      subjectColor: subject.color,
      dueDate,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    })

    document.getElementById("assignmentForm").reset()
    showAlert("Assignment added successfully!", "success")
    updateDebugInfo(`Assignment ${title} added successfully`)
  } catch (error) {
    console.error("Error adding assignment:", error)
    updateDebugInfo(`Error adding assignment: ${error.message}`)
    showAlert("Error adding assignment. Please try again.", "danger")
  }
}

async function toggleAssignmentComplete(assignmentId, completed) {
  try {
    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("assignments")
      .doc(assignmentId)
      .update({ completed: !completed })

    updateDebugInfo(`Assignment ${assignmentId} completion toggled`)
  } catch (error) {
    console.error("Error updating assignment:", error)
    updateDebugInfo(`Error updating assignment: ${error.message}`)
    showAlert("Error updating assignment. Please try again.", "danger")
  }
}

async function deleteAssignment(assignmentId) {
  if (!confirm("Are you sure you want to delete this assignment?")) {
    return
  }

  try {
    await db.collection("users").doc(currentUser.uid).collection("assignments").doc(assignmentId).delete()
    showAlert("Assignment deleted successfully!", "success")
    updateDebugInfo(`Assignment ${assignmentId} deleted`)
  } catch (error) {
    console.error("Error deleting assignment:", error)
    updateDebugInfo(`Error deleting assignment: ${error.message}`)
    showAlert("Error deleting assignment. Please try again.", "danger")
  }
}

function renderAssignments() {
  const assignmentsContainer = document.getElementById("assignmentsList")
  if (!assignmentsContainer) return

  if (assignments.length === 0) {
    assignmentsContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-tasks fa-3x text-muted mb-3"></i>
        <p class="text-muted">No assignments added yet. Add your first assignment above!</p>
      </div>
    `
    return
  }

  assignmentsContainer.innerHTML = assignments
    .map((assignment) => {
      const dueDate = new Date(assignment.dueDate)
      const today = new Date()
      const timeDiff = dueDate.getTime() - today.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      let urgencyClass = "border-success"
      let urgencyText = "On time"

      if (daysDiff < 0) {
        urgencyClass = "border-danger"
        urgencyText = "Overdue"
      } else if (daysDiff === 0) {
        urgencyClass = "border-warning"
        urgencyText = "Due today"
      } else if (daysDiff <= 3) {
        urgencyClass = "border-warning"
        urgencyText = "Due soon"
      }

      const priorityColors = {
        high: "danger",
        medium: "warning",
        low: "success",
      }

      return `
      <div class="col-12 mb-3">
        <div class="card ${assignment.completed ? "bg-light" : urgencyClass}">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-1">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" 
                    ${assignment.completed ? "checked" : ""} 
                    onchange="toggleAssignmentComplete('${assignment.id}', ${assignment.completed})">
                </div>
              </div>
              <div class="col-md-6">
                <h5 class="card-title mb-1 ${assignment.completed ? "text-decoration-line-through text-muted" : ""}">
                  ${assignment.title}
                </h5>
                <p class="text-muted mb-1">
                  <span class="badge" style="background-color: ${assignment.subjectColor || "#007bff"}">
                    ${assignment.subjectName}
                  </span>
                </p>
                ${assignment.description ? `<p class="card-text small">${assignment.description}</p>` : ""}
              </div>
              <div class="col-md-3">
                <p class="mb-1">
                  <i class="fas fa-calendar me-1"></i>
                  ${formatDate(assignment.dueDate)}
                </p>
                <span class="badge bg-${priorityColors[assignment.priority]}">
                  ${assignment.priority} priority
                </span>
                <br>
                <small class="text-muted">${urgencyText}</small>
              </div>
              <div class="col-md-2 text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAssignment('${assignment.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    })
    .join("")
}

function populateSubjectSelect() {
  const selects = document.querySelectorAll(".subject-select")
  selects.forEach((select) => {
    select.innerHTML =
      '<option value="">Select a subject</option>' +
      subjects
        .map(
          (subject) => `
        <option value="${subject.id}">${subject.name}${subject.code ? ` (${subject.code})` : ""}</option>
      `,
        )
        .join("")
  })
}

// ====================== NOTES MANAGEMENT ======================

async function addNote() {
  const title = document.getElementById("noteTitle").value.trim()
  const content = document.getElementById("noteContent").value.trim()
  const subjectId = document.getElementById("noteSubject").value
  const noteLinks = document.getElementById("noteLinks").value.trim()

  if (!title || !content) {
    showAlert("Please fill in title and content", "warning")
    return
  }

  // Parse links if provided
  let parsedLinks = []
  if (noteLinks) {
    const linkArray = noteLinks.split("\n").filter((link) => link.trim())
    parsedLinks = linkArray.map((link) => {
      const trimmedLink = link.trim()
      // Basic URL validation and formatting
      if (!trimmedLink.startsWith("http://") && !trimmedLink.startsWith("https://")) {
        return `https://${trimmedLink}`
      }
      return trimmedLink
    })
  }

  try {
    const subject = subjects.find((s) => s.id === subjectId)

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("notes")
      .add({
        title,
        content,
        links: parsedLinks,
        subjectId: subjectId || null,
        subjectName: subject ? subject.name : null,
        subjectColor: subject ? subject.color : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

    document.getElementById("noteForm").reset()
    showAlert("Note added successfully!", "success")
    updateDebugInfo(`Note ${title} added successfully`)
  } catch (error) {
    console.error("Error adding note:", error)
    updateDebugInfo(`Error adding note: ${error.message}`)
    showAlert("Error adding note. Please try again.", "danger")
  }
}

async function deleteNote(noteId) {
  if (!confirm("Are you sure you want to delete this note?")) {
    return
  }

  try {
    await db.collection("users").doc(currentUser.uid).collection("notes").doc(noteId).delete()
    showAlert("Note deleted successfully!", "success")
    updateDebugInfo(`Note ${noteId} deleted`)
  } catch (error) {
    console.error("Error deleting note:", error)
    updateDebugInfo(`Error deleting note: ${error.message}`)
    showAlert("Error deleting note. Please try again.", "danger")
  }
}

function renderNotes() {
  const notesContainer = document.getElementById("notesList")
  if (!notesContainer) return

  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-sticky-note fa-3x text-muted mb-3"></i>
        <p class="text-muted">No notes added yet. Add your first note above!</p>
      </div>
    `
    return
  }

  notesContainer.innerHTML = notes
    .map(
      (note) => `
    <div class="col-md-6 col-lg-4 mb-3">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title">${note.title}</h5>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${note.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          ${
            note.subjectName
              ? `
            <p class="mb-2">
              <span class="badge" style="background-color: ${note.subjectColor || "#007bff"}">
                ${note.subjectName}
              </span>
            </p>
          `
              : ""
          }
          <p class="card-text">${note.content.substring(0, 150)}${note.content.length > 150 ? "..." : ""}</p>
          
          ${
            note.links && note.links.length > 0
              ? `
            <div class="mt-3">
              <h6 class="text-muted mb-2"><i class="fas fa-link me-1"></i>Links (${note.links.length})</h6>
              <div class="d-flex flex-wrap gap-1">
                ${note.links
                  .slice(0, 3)
                  .map(
                    (link, index) => `
                  <button class="btn btn-sm btn-outline-primary" onclick="window.open('${link}', '_blank')" title="${link}">
                    <i class="fas fa-external-link-alt me-1"></i>Link ${index + 1}
                  </button>
                `,
                  )
                  .join("")}
                ${
                  note.links.length > 3
                    ? `
                  <button class="btn btn-sm btn-outline-secondary" onclick="showAllNoteLinks('${note.id}', '${note.title}', ${JSON.stringify(note.links).replace(/"/g, "&quot;")})">
                    <i class="fas fa-plus me-1"></i>+${note.links.length - 3} more
                  </button>
                `
                    : ""
                }
              </div>
            </div>
          `
              : ""
          }
          
          <div class="mt-auto pt-3">
            <small class="text-muted">
              <i class="fas fa-calendar me-1"></i>
              ${formatDate(note.createdAt)}
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Add function to show all links in a modal-like view
function showAllNoteLinks(noteId, noteTitle, links) {
  const linksHtml = links
    .map(
      (link, index) => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div class="flex-grow-1">
        <small class="text-muted">Link ${index + 1}</small>
        <br>
        <span class="text-break">${link}</span>
      </div>
      <button class="btn btn-sm btn-primary ms-2" onclick="window.open('${link}', '_blank')">
        <i class="fas fa-external-link-alt"></i>
      </button>
    </div>
  `,
    )
    .join("")

  // Create a simple alert with all links
  const alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-info alert-dismissible fade show position-fixed"
  alertDiv.style.cssText =
    "top: 20px; right: 20px; max-width: 400px; z-index: 9999; max-height: 400px; overflow-y: auto;"
  alertDiv.innerHTML = `
    <h6><i class="fas fa-link me-2"></i>All Links - ${noteTitle}</h6>
    <div style="max-height: 250px; overflow-y: auto;">
      ${linksHtml}
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(alertDiv)

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 10000)
}

// ====================== LECTURES MANAGEMENT ======================

// Update the addLecture function to handle video links instead of scheduling
async function addLecture() {
  const topic = document.getElementById("lectureTopic").value.trim()
  const description = document.getElementById("lectureDescription").value.trim()
  const subjectId = document.getElementById("lectureSubject").value
  const videoUrl = document.getElementById("lectureVideoUrl").value.trim()
  const duration = document.getElementById("lectureDuration").value.trim()

  if (!topic || !subjectId || !videoUrl) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  // Basic URL validation
  if (!isValidUrl(videoUrl)) {
    showAlert("Please enter a valid video URL", "warning")
    return
  }

  try {
    const subject = subjects.find((s) => s.id === subjectId)

    await db.collection("users").doc(currentUser.uid).collection("lectures").add({
      topic,
      description,
      subjectId,
      subjectName: subject.name,
      subjectColor: subject.color,
      videoUrl,
      duration,
      watched: false,
      createdAt: new Date().toISOString(),
    })

    document.getElementById("lectureForm").reset()
    showAlert("Lecture link added successfully!", "success")
    updateDebugInfo(`Lecture ${topic} added successfully`)
  } catch (error) {
    console.error("Error adding lecture:", error)
    updateDebugInfo(`Error adding lecture: ${error.message}`)
    showAlert("Error adding lecture. Please try again.", "danger")
  }
}

// Add URL validation function
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Add function to mark lecture as watched/unwatched
async function toggleLectureWatched(lectureId, watched) {
  try {
    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("lectures")
      .doc(lectureId)
      .update({ watched: !watched })

    updateDebugInfo(`Lecture ${lectureId} watch status toggled`)
  } catch (error) {
    console.error("Error updating lecture:", error)
    updateDebugInfo(`Error updating lecture: ${error.message}`)
    showAlert("Error updating lecture. Please try again.", "danger")
  }
}

// Add function to open video link
function openLectureVideo(url, lectureId, watched) {
  // Mark as watched when opened
  if (!watched) {
    toggleLectureWatched(lectureId, watched)
  }

  // Open video in new tab
  window.open(url, "_blank")
}

// Update renderLectures function to show video links
function renderLectures() {
  const lecturesContainer = document.getElementById("lecturesList")
  if (!lecturesContainer) return

  if (lectures.length === 0) {
    lecturesContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-video fa-3x text-muted mb-3"></i>
        <p class="text-muted">No lecture links added yet. Add your first lecture link above!</p>
      </div>
    `
    return
  }

  lecturesContainer.innerHTML = lectures
    .map((lecture) => {
      const videoIcon = getVideoIcon(lecture.videoUrl)

      return `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card h-100 ${lecture.watched ? "border-success" : ""}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title">${lecture.topic}</h5>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" onclick="toggleLectureWatched('${lecture.id}', ${lecture.watched})">
                    <i class="fas fa-${lecture.watched ? "eye-slash" : "eye"} me-2"></i>
                    Mark as ${lecture.watched ? "Unwatched" : "Watched"}
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="deleteLecture('${lecture.id}')">
                    <i class="fas fa-trash me-2"></i>Delete
                  </a></li>
                </ul>
              </div>
            </div>
            
            <p class="mb-2">
              <span class="badge" style="background-color: ${lecture.subjectColor || "#007bff"}">
                ${lecture.subjectName}
              </span>
              ${lecture.watched ? '<span class="badge bg-success ms-1">Watched</span>' : '<span class="badge bg-secondary ms-1">Not Watched</span>'}
            </p>
            
            ${lecture.description ? `<p class="card-text mb-3">${lecture.description}</p>` : ""}
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <i class="${videoIcon} me-2 text-primary"></i>
                <small class="text-muted">Video Link</small>
              </div>
              ${lecture.duration ? `<small class="text-muted"><i class="fas fa-clock me-1"></i>${lecture.duration}</small>` : ""}
            </div>
            
            <div class="d-grid">
              <button class="btn btn-primary" onclick="openLectureVideo('${lecture.videoUrl}', '${lecture.id}', ${lecture.watched})">
                <i class="fas fa-play me-2"></i>Watch Lecture
              </button>
            </div>
            
            <div class="mt-2">
              <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>
                Added ${formatDate(lecture.createdAt)}
              </small>
            </div>
          </div>
        </div>
      </div>
    `
    })
    .join("")
}

// Function to get appropriate video icon based on URL
function getVideoIcon(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "fab fa-youtube"
  } else if (url.includes("vimeo.com")) {
    return "fab fa-vimeo"
  } else if (url.includes("twitch.tv")) {
    return "fab fa-twitch"
  } else if (url.includes("zoom.us")) {
    return "fas fa-video"
  } else {
    return "fas fa-play-circle"
  }
}

// Add function to delete lecture
async function deleteLecture(lectureId) {
  if (!confirm("Are you sure you want to delete this lecture?")) {
    return
  }

  try {
    await db.collection("users").doc(currentUser.uid).collection("lectures").doc(lectureId).delete()
    showAlert("Lecture deleted successfully!", "success")
    updateDebugInfo(`Lecture ${lectureId} deleted`)
  } catch (error) {
    console.error("Error deleting lecture:", error)
    updateDebugInfo(`Error deleting lecture: ${error.message}`)
    showAlert("Error deleting lecture. Please try again.", "danger")
  }
}

// Add to the global window object
window.addSubject = addSubject
window.deleteSubject = deleteSubject
window.addAssignment = addAssignment
window.toggleAssignmentComplete = toggleAssignmentComplete
window.deleteAssignment = deleteAssignment
window.addNote = addNote
window.deleteNote = deleteNote
window.addLecture = addLecture
window.deleteLecture = deleteLecture

// Make functions globally available - THIS IS THE KEY FIX!
window.showSection = showSection
window.enableDebugMode = enableDebugMode
window.testFirebase = testFirebaseConnection
window.signOut = signOut

// Also expose for debugging
window.updateDebugInfo = updateDebugInfo
window.subjects = subjects
window.assignments = assignments
window.notes = notes
window.lectures = lectures

console.log("✅ All functions exposed to window object")

// Add the new functions to window object
window.toggleLectureWatched = toggleLectureWatched
window.openLectureVideo = openLectureVideo
window.showAllNoteLinks = showAllNoteLinks
