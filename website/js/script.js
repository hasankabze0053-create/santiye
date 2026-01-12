document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // 1. Check LocalStorage for saved tab
    const savedTabId = localStorage.getItem('activeTab');

    if (savedTabId) {
        // Find the button associated with the saved tab
        const savedButton = document.querySelector(`.tab-btn[data-target="${savedTabId}"]`);
        if (savedButton) {
            // Remove default actives
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Activate saved tab
            savedButton.classList.add('active');
            const targetPane = document.getElementById(savedTabId);
            if (targetPane) targetPane.classList.add('active');
        }
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show target pane
            const targetId = btn.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            // 2. Save to LocalStorage
            localStorage.setItem('activeTab', targetId);
        });
    });
});
