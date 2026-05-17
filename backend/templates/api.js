// js/api.js
const API_BASE = 'http://localhost:8000/api';

const api = {
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    },

    async get(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: this.getHeaders()
        });
        if (res.status === 401) { logout(); return; }
        return res.json();
    },

    async post(endpoint, data) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return { ok: res.ok, data: await res.json() };
    },

    async postFormData(endpoint, formData) {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return { ok: res.ok, data: await res.json() };
    },

    async delete(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return res.ok;
    },

    downloadFile(endpoint, filename) {
        const token = localStorage.getItem('access_token');
        fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
};