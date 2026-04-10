(function() {
  "use strict";

  // Select all necessary elements using the exact data-testid and classes from HTML.
  const todoCard = document.querySelector('[data-testid="test-todo-card"]');
  const titleElement = document.querySelector('[data-testid="test-todo-title"]');
  const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const statusBadgeSpan = document.querySelector('[data-testid="test-todo-status"] span');
  const timeRemainingSpan = document.getElementById('time-remaining-text');
  const dueDateElement = document.querySelector('[data-testid="test-todo-due-date"]');
  const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');

  // Get due date from the <time> element
  function getDueDate() {
    const timeElement = document.querySelector('[data-testid="test-todo-due-date"]');
    if (!timeElement) return null;
   // Use datetime attribute if available
    const dateTimeAttr = timeElement.getAttribute('datetime');
    if (dateTimeAttr) {
      return new Date(dateTimeAttr);
    }
    // Fallback to text content
    const fallbackDate = new Date(timeElement.textContent);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

 // Calculate remaining time
  function calculateTimeRemaining() {
    const due = getDueDate();
    if (!due) return "No due date";

    const now = new Date();
    const diffMs = due - now;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // If overdue
    if (diffMs < 0) {
      const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
      const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      if (overdueDays >= 1) {
        return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
      } else if (overdueHours >= 1) {
        return `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;
      } else {
        return "Overdue by less than an hour";
      }
    }

    // Due now
    if (diffMinutes < 1) {
      return "Due now!";
    }

   // Less than 24 hours
    if (diffHours < 24) {
      if (diffHours === 0) {
        // less than 1 hour but > 0 min
        return `Due in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
      return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }

    // More than 24 hours: show days
    if (diffDays === 1) {
      return "Due tomorrow";
    }
    return `Due in ${diffDays} days`;
  }

 // Update time remaining UI
  function updateTimeRemainingDisplay() {
    if (!timeRemainingSpan) return;
    const remainingText = calculateTimeRemaining();
    timeRemainingSpan.textContent = remainingText;

    // Highlight if overdue
    const timeRemainingContainer = document.querySelector('[data-testid="test-todo-time-remaining"]');
    if (timeRemainingContainer && remainingText.toLowerCase().includes('overdue')) {
      timeRemainingContainer.classList.add('overdue');
    } else if (timeRemainingContainer) {
      timeRemainingContainer.classList.remove('overdue');
    }
  }

  // Toggle task status
  function toggleTaskCompletion(isChecked) {
    if (!titleElement || !statusBadgeSpan) return;

    if (isChecked) {
      // Mark as done
      titleElement.classList.add('todo-card__title--completed');
      statusBadgeSpan.textContent = "Done";
      statusBadgeSpan.className = "status-badge status-badge--done";
    } else {
     // Back to pending
      titleElement.classList.remove('todo-card__title--completed');
      statusBadgeSpan.textContent = "Pending";
      statusBadgeSpan.className = "status-badge status-badge--pending";
    }
  }

  // Handle checkbox change
  if (checkbox) {
    checkbox.addEventListener('change', (event) => {
      toggleTaskCompletion(event.target.checked);
    });
  }


  // Edit action
  if (editButton) {
    editButton.addEventListener('click', () => {
      console.log("edit clicked");
    });
  }

  // Delete button: shows alert as required.
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      alert("Delete clicked");
    });
  }

  // Initialize task state
  function initializeTaskState() {
    if (checkbox) {
      // Default: pending
      checkbox.checked = false;
      toggleTaskCompletion(false);
    }
    // Update time on load
    updateTimeRemainingDisplay();
  }

  // Refresh time every 60s
  let refreshInterval = null;
  function startTimeRefreshInterval() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
      updateTimeRemainingDisplay();
    }, 60000); // update every 60 seconds
  }

 // Improve accessibility
  function enhanceAccessibility() {
    const dueTimeElement = document.querySelector('[data-testid="test-todo-due-date"]');
    if (dueTimeElement && dueTimeElement.tagName === 'TIME') {
      const dateValue = dueTimeElement.getAttribute('datetime');
      if (dateValue) {
        dueTimeElement.setAttribute('aria-label', `Due date: ${dueTimeElement.textContent}`);
      }
    }
   
    const statusElement = document.querySelector('[data-testid="test-todo-status"]');
    if (statusElement) {
      statusElement.setAttribute('aria-live', 'polite');
    }
  }


  function init() {
    initializeTaskState();
    startTimeRefreshInterval();
    enhanceAccessibility();
    // Update time when page is focused
    window.addEventListener('focus', () => {
      updateTimeRemainingDisplay();
    });
  }

 // Init app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();