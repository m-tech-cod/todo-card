(function() {
  "use strict";

  // ========== DOM ELEMENTS ==========
  const todoCard = document.querySelector('[data-testid="test-todo-card"]');
  const titleElement = document.querySelector('[data-testid="test-todo-title"]');
  const descriptionElement = document.querySelector('[data-testid="test-todo-description"]');
  const checkbox = document.querySelector('[data-testid="test-todo-complete-toggle"]');
  const statusBadgeSpan = document.querySelector('[data-testid="test-todo-status"] span');
  const statusControl = document.querySelector('[data-testid="test-todo-status-control"]');
  const timeRemainingSpan = document.getElementById('time-remaining-text');
  const overdueIndicator = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
  const priorityBadge = document.querySelector('[data-testid="test-todo-priority"] .priority-badge');
  const priorityIndicator = document.querySelector('[data-testid="test-todo-priority-indicator"]');
  const dueDateElement = document.querySelector('[data-testid="test-todo-due-date"]');
  const editButton = document.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteButton = document.querySelector('[data-testid="test-todo-delete-button"]');
  const editForm = document.querySelector('[data-testid="test-todo-edit-form"]');
  const expandToggle = document.querySelector('[data-testid="test-todo-expand-toggle"]');
  const collapsibleSection = document.querySelector('[data-testid="test-todo-collapsible-section"]');
  
  // Edit form inputs
  const editTitleInput = document.querySelector('[data-testid="test-todo-edit-title-input"]');
  const editDescriptionInput = document.querySelector('[data-testid="test-todo-edit-description-input"]');
  const editPrioritySelect = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
  const editDueDateInput = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
  const saveButton = document.querySelector('[data-testid="test-todo-save-button"]');
  const cancelButton = document.querySelector('[data-testid="test-todo-cancel-button"]');

  // Store original values for cancel
  let originalTaskData = {};

  // ========== HELPER FUNCTIONS ==========
  
  // Get due date from time element
  function getDueDate() {
    const timeElement = document.querySelector('[data-testid="test-todo-due-date"]');
    if (!timeElement) return null;
    const dateTimeAttr = timeElement.getAttribute('datetime');
    if (dateTimeAttr) {
      return new Date(dateTimeAttr);
    }
    const fallbackDate = new Date(timeElement.textContent);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  // Update priority UI based on value
  function updatePriorityUI(priority) {
    const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1);
    priorityBadge.textContent = priorityText;
    priorityBadge.className = `priority-badge priority-badge--${priority}`;
    
    const dotSpan = priorityIndicator.querySelector('.priority-dot');
    const labelSpan = priorityIndicator.querySelector('.priority-label');
    dotSpan.className = `priority-dot priority-dot--${priority}`;
    labelSpan.textContent = `${priorityText} Priority`;
  }

  // Update status UI
  function updateStatusUI(status) {
    let displayText = '';
    let badgeClass = '';
    
    switch(status) {
      case 'pending':
        displayText = 'Pending';
        badgeClass = 'status-badge--pending';
        todoCard.classList.remove('todo-card--in-progress');
        break;
      case 'in-progress':
        displayText = 'In Progress';
        badgeClass = 'status-badge--in-progress';
        todoCard.classList.add('todo-card--in-progress');
        break;
      case 'done':
        displayText = 'Done';
        badgeClass = 'status-badge--done';
        todoCard.classList.add('todo-card--completed');
        todoCard.classList.remove('todo-card--in-progress');
        break;
    }
    
    statusBadgeSpan.textContent = displayText;
    statusBadgeSpan.className = `status-badge ${badgeClass}`;
    statusControl.value = status;
    
    // Sync checkbox with done status
    if (status === 'done') {
      checkbox.checked = true;
      titleElement.classList.add('todo-card__title--completed');
    } else {
      checkbox.checked = false;
      titleElement.classList.remove('todo-card__title--completed');
    }
  }

  // Calculate time remaining text
  function calculateTimeRemaining() {
    const due = getDueDate();
    if (!due) return "No due date";
    
    const now = new Date();
    const diffMs = due - now;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Overdue
    if (diffMs < 0) {
      const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
      const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      if (overdueDays >= 1) {
        return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
      } else if (overdueHours >= 1) {
        return `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;
      } else {
        return "Overdue by <1 hour";
      }
    }
    
    // Due now
    if (diffMinutes < 1) return "Due now!";
    
    // Hours
    if (diffHours < 24) {
      if (diffHours === 0) {
        return `Due in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      }
      return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    
    // Days
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  }

  // Update time displays
  function updateTimeRemainingDisplay() {
    const currentStatus = statusControl.value;
    
    // If task is done, show "Completed"
    if (currentStatus === 'done') {
      timeRemainingSpan.textContent = "Completed";
      overdueIndicator.textContent = "";
      overdueIndicator.hidden = true;
      return;
    }
    
    const remainingText = calculateTimeRemaining();
    timeRemainingSpan.textContent = remainingText;
    
    // Update overdue indicator
    const timeRemainingContainer = document.querySelector('[data-testid="test-todo-time-remaining"]');
    const isOverdue = remainingText.toLowerCase().includes('overdue');
    
    if (isOverdue) {
      timeRemainingContainer.classList.add('overdue');
      todoCard.classList.add('todo-card--overdue');
    } else {
      timeRemainingContainer.classList.remove('overdue');
      overdueIndicator.textContent = "";
      overdueIndicator.hidden = true;
      todoCard.classList.remove('todo-card--overdue');
    }
  }

  // ========== EDIT MODE ==========
  function openEditMode() {
    // Store current values
    originalTaskData = {
      title: titleElement.textContent,
      description: descriptionElement.textContent,
      priority: priorityBadge.textContent.toLowerCase(),
      dueDate: dueDateElement.getAttribute('datetime')
    };
    
    // Populate form
    editTitleInput.value = titleElement.textContent;
    editDescriptionInput.value = descriptionElement.textContent;
    editPrioritySelect.value = priorityBadge.textContent.toLowerCase();
    
    const dueDateValue = dueDateElement.getAttribute('datetime');
    if (dueDateValue) {
      editDueDateInput.value = dueDateValue;
    }
    
    // Show form, hide main content
    editForm.hidden = false;
    document.querySelector('.todo-card__header').style.opacity = '0.3';
    document.querySelector('.todo-card__description-wrapper').style.opacity = '0.3';
    document.querySelector('.todo-card__meta').style.opacity = '0.3';
    document.querySelector('.todo-card__date-info').style.opacity = '0.3';
    document.querySelector('.todo-card__tags-container').style.opacity = '0.3';
    document.querySelector('.todo-card__actions').style.opacity = '0.3';
  }
  
  function closeEditMode() {
    editForm.hidden = true;
    document.querySelector('.todo-card__header').style.opacity = '1';
    document.querySelector('.todo-card__description-wrapper').style.opacity = '1';
    document.querySelector('.todo-card__meta').style.opacity = '1';
    document.querySelector('.todo-card__date-info').style.opacity = '1';
    document.querySelector('.todo-card__tags-container').style.opacity = '1';
    document.querySelector('.todo-card__actions').style.opacity = '1';
  }
  
  function saveTask() {
    // Update title
    titleElement.textContent = editTitleInput.value;
    
    // Update description (main truncated view)
    descriptionElement.textContent = editDescriptionInput.value;

    const fullDescription = document.querySelector('.todo-card__description-full');
    if (fullDescription) {
      fullDescription.textContent = editDescriptionInput.value;
    }
    
    // Update priority
    const newPriority = editPrioritySelect.value;
    updatePriorityUI(newPriority);
    
    // Update due date
    const newDueDate = editDueDateInput.value;
    if (newDueDate) {
      const dateObj = new Date(newDueDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      dueDateElement.textContent = formattedDate;
      dueDateElement.setAttribute('datetime', newDueDate);
    }
    
    // Update time remaining
    updateTimeRemainingDisplay();
    closeEditMode();
  }
  
  function cancelEdit() {
  titleElement.textContent = originalTaskData.title;
  descriptionElement.textContent = originalTaskData.description;
  updatePriorityUI(originalTaskData.priority);
  
  dueDateElement.setAttribute('datetime', originalTaskData.dueDate);
  dueDateElement.textContent = new Date(originalTaskData.dueDate)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  updateTimeRemainingDisplay();
  closeEditMode();
}

  // ========== EXPAND/COLLAPSE ==========
  function toggleExpand() {
    const isExpanded = expandToggle.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      collapsibleSection.hidden = true;
      expandToggle.setAttribute('aria-expanded', 'false');
      expandToggle.querySelector('.expand-toggle__text').textContent = 'Show more';
    } else {
      collapsibleSection.hidden = false;
      expandToggle.setAttribute('aria-expanded', 'true');
      expandToggle.querySelector('.expand-toggle__text').textContent = 'Show less';
    }
  }

  // ========== EVENT LISTENERS ==========
  
  // Checkbox change
  if (checkbox) {
    checkbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        updateStatusUI('done');
      } else {
        updateStatusUI('pending');
      }
      updateTimeRemainingDisplay();
    });
  }
  
  // Status control change
  if (statusControl) {
    statusControl.addEventListener('change', (event) => {
      updateStatusUI(event.target.value);
      updateTimeRemainingDisplay();
    });
  }
  
  // Edit button
  if (editButton) {
    editButton.addEventListener('click', () => {
      openEditMode();
    });
  }
  
  // Delete button
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      alert("Delete clicked");
    });
  }
  
  // Save button
  if (saveButton) {
    saveButton.addEventListener('click', saveTask);
  }
  
  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', cancelEdit);
  }
  
  // Expand toggle
  if (expandToggle) {
    expandToggle.addEventListener('click', toggleExpand);
    expandToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleExpand();
      }
    });
  }
  
  // ========== INITIALIZATION ==========

  function init() {
    updateStatusUI('pending');
    updatePriorityUI('high');
    updateTimeRemainingDisplay();

    intervalId = setInterval(() => {
      if (statusControl.value !== 'done') {
        updateTimeRemainingDisplay();
      }
    }, 30000);
  }
  
  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();