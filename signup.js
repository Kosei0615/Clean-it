// Create a new file: signup.js
class SignupManager {
    constructor() {
        this.initializeEventListeners();
        this.checkExistingLogin();
    }

    initializeEventListeners() {
        const form = document.getElementById('signupForm');
        form.addEventListener('submit', (e) => this.handleSignup(e));
    }

    checkExistingLogin() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            window.location.href = 'index.html';
        }
    }

    handleSignup(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const signupData = {
            fullName: formData.get('fullName'),
            username: formData.get('username'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            role: formData.get('role'),
            employeeId: formData.get('employeeId')
        };

        if (this.validateSignupData(signupData)) {
            this.createAccount(signupData);
        }
    }

    validateSignupData(data) {
        if (data.password !== data.confirmPassword) {
            alert('パスワードが一致しません / Passwords do not match');
            return false;
        }

        if (data.password.length < 6) {
            alert('パスワードは6文字以上である必要があります / Password must be at least 6 characters');
            return false;
        }

        if (data.username.length < 3) {
            alert('ユーザー名は3文字以上である必要があります / Username must be at least 3 characters');
            return false;
        }

        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        if (existingUsers.some(user => user.username === data.username)) {
            alert('このユーザー名は既に使用されています / Username already exists');
            return false;
        }

        if (!this.validateEmployeeId(data.employeeId, data.role)) {
            alert('無効な従業員IDです。フロントデスク: FD001, 清掃: CL001 の形式で入力してください');
            return false;
        }

        return true;
    }

    validateEmployeeId(employeeId, role) {
        const validPatterns = {
            'front-desk': /^FD\d{3}$/,
            'cleaning': /^CL\d{3}$/
        };

        return validPatterns[role] && validPatterns[role].test(employeeId);
    }

    createAccount(signupData) {
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        const newUser = {
            id: Date.now(),
            fullName: signupData.fullName,
            username: signupData.username,
            password: signupData.password,
            role: signupData.role,
            employeeId: signupData.employeeId,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        alert('アカウントが正常に作成されました！ログインページに移動します。\nAccount created successfully! Redirecting to login page.');
        
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SignupManager();
});