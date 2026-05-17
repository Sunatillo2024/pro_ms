// js/auth.js
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showAlert('Barcha maydonlarni to\'ldiring', 'error');
        return;
    }

    try {
        const res = await fetch(`http://localhost:8000/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // User ma'lumotini olish
            const userRes = await fetch('http://localhost:8000/api/users/me/', {
                headers: { 'Authorization': `Bearer ${data.access}` }
            });
            const user = await userRes.json();
            localStorage.setItem('user', JSON.stringify(user));

            window.location.href = 'index.html';
        } else {
            showAlert('Login yoki parol noto\'g\'ri', 'error');
        }
    } catch (e) {
        showAlert('Server bilan bog\'lanib bo\'lmadi', 'error');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function showAlert(msg, type) {
    const alert = document.getElementById('alert');
    alert.textContent = msg;
    alert.className = `alert ${type}`;
    alert.classList.remove('hidden');
    setTimeout(() => alert.classList.add('hidden'), 3000);
}

// Sahifa yuklanishida tekshirish
if (!window.location.href.includes('login')) {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
    }
}