class HubManager {
    constructor() {
        this.checkLogin();
        this.loadUserInfo();
        this.setupOptions();
    }

    checkLogin() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
    }

    loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userInfo = document.getElementById('currentUser');
        const roleText = currentUser.role === 'front-desk' ? 'フロントデスク' : '清掃スタッフ';
        userInfo.textContent = `${currentUser.username} (${roleText})`;
    }

    setupOptions() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const hubOptions = document.getElementById('hubOptions');
        
        const allOptions = [
            {
                id: 'front-desk',
                icon: '🏪',
                title: 'フロントデスク',
                subtitle: 'Front Desk',
                description: 'お客様情報の登録<br>Guest Registration',
                roles: ['front-desk']
            },
            {
                id: 'cleaning',
                icon: '🧹',
                title: '清掃スタッフ',
                subtitle: 'Cleaning Staff',
                description: '清掃情報の確認<br>Cleaning Information',
                roles: ['front-desk', 'cleaning']
            },
            {
                id: 'calendar',
                icon: '📅',
                title: 'カレンダー',
                subtitle: 'Calendar',
                description: '予約状況の確認<br>Reservation Status',
                roles: ['front-desk', 'cleaning']
            },
            {
                id: 'customers',
                icon: '👥',
                title: '顧客データベース',
                subtitle: 'Customer Database',
                description: '全顧客情報の管理<br>All Customer Information',
                roles: ['front-desk', 'cleaning']
            }
        ];

        const availableOptions = allOptions.filter(option => 
            option.roles.includes(currentUser.role)
        );

        hubOptions.innerHTML = availableOptions.map(option => `
            <div class="option-card" onclick="navigateTo('${option.id}')">
                <div class="card-icon">${option.icon}</div>
                <h3>${option.title}</h3>
                <h4>${option.subtitle}</h4>
                <p>${option.description}</p>
            </div>
        `).join('');
    }
}

function navigateTo(page) {
    window.location.href = `${page}.html`;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    new HubManager();
});