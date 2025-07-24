function quickLogin(username, password, role) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('role').value = role;
    login({ username, password, role });
}

function login(creds) {
    const users = [
        { username: 'front', password: 'desk123', role: 'front-desk', name: 'フロントスタッフ' },
        { username: 'clean', password: 'staff123', role: 'cleaning', name: '清掃スタッフ' }
    ];
    
    // Also check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const allUsers = [...users, ...registeredUsers];
    
    const user = allUsers.find(u => 
        u.username === creds.username && 
        u.password === creds.password && 
        u.role === creds.role
    );
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            name: user.name || user.fullName,
            role: user.role,
            loginTime: new Date().toISOString()
        }));
        location.href = 'index.html';
    } else {
        alert('ログインに失敗しました / Login failed');
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            login({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            });
        });
    }
});

// Redirect if already logged in
if (localStorage.getItem('currentUser')) {
    location.href = 'index.html';
}