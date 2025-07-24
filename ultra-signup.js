document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('newRole').value;
        
        // Validation
        if (password !== confirmPassword) {
            alert('パスワードが一致しません / Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            alert('パスワードは6文字以上で入力してください / Password must be at least 6 characters');
            return;
        }
        
        // Check if username already exists
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const defaultUsers = ['front', 'clean'];
        
        if (defaultUsers.includes(username) || registeredUsers.find(u => u.username === username)) {
            alert('このユーザー名は既に使用されています / Username already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            fullName: fullName,
            username: username,
            password: password,
            role: role,
            registeredAt: new Date().toISOString()
        };
        
        // Save user
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        alert('登録が完了しました！ログインページに移動します。\nRegistration complete! Redirecting to login.');
        location.href = 'login.html';
    });
});