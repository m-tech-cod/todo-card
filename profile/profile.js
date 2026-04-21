(function() {
  "use strict";

  // DOM Elements
  const followButton = document.getElementById('followButton');
  const buttonText = followButton?.querySelector('.action-button__text');
  const buttonIcon = followButton?.querySelector('.action-button__icon');

  if (!followButton || !buttonText || !buttonIcon) return;

  // State
  let isFollowing = false;

  // Update UI
  function updateButtonUI() {
    if (isFollowing) {
      buttonText.textContent = 'Following';
      followButton.classList.add('action-button--followed');

      buttonIcon.innerHTML = `
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;

      followButton.setAttribute('aria-label', 'Unfollow');
    } else {
      buttonText.textContent = 'Follow';
      followButton.classList.remove('action-button--followed');

      buttonIcon.innerHTML = `
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      `;

      followButton.setAttribute('aria-label', 'Follow');
    }
  }

  // Toggle state
  function toggleFollowState() {
    isFollowing = !isFollowing;
    updateButtonUI();
  }

  // Init
  function init() {
    followButton.addEventListener('click', toggleFollowState);
  }

  init();
})();