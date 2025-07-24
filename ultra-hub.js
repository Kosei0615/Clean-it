const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) location.href = 'login.html';

document.addEventListener('DOMContentLoaded', function() {
    // Display user info
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name || user.username;
    }

    // Setup options based on role
    const options = [
        { id: 'front-desk', icon: '🏪', title: 'フロントデスク', subtitle: 'Guest Registration', roles: ['front-desk'] },
        { id: 'cleaning', icon: '🧹', title: '清掃管理', subtitle: 'Cleaning Management', roles: ['front-desk', 'cleaning'] },
        { id: 'calendar', icon: '📅', title: 'カレンダー', subtitle: 'Calendar View', roles: ['front-desk', 'cleaning'] }
    ];

    const userOptions = options.filter(option => option.roles.includes(user.role));
    
    const optionsContainer = document.getElementById('options');
    if (optionsContainer) {
        optionsContainer.innerHTML = userOptions.map(option => `
            <div class="option" onclick="location.href='${option.id}.html'">
                <div class="option-icon">${option.icon}</div>
                <h3>${option.title}</h3>
                <p>${option.subtitle}</p>
            </div>
        `).join('');
    }
});

function logout() {
    if (confirm('ログアウトしますか？ / Logout?')) {
        localStorage.removeItem('currentUser');
        location.href = 'login.html';
    }
}