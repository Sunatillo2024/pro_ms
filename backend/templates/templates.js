// js/templates.js
let allTemplates = [];
let currentTemplate = null;

async function loadTemplates() {
    const data = await api.get('/templates/');
    allTemplates = data.results || data;
    renderTemplates(allTemplates);
}

function renderTemplates(templates) {
    const grid = document.getElementById('templates-grid');

    if (!templates.length) {
        grid.innerHTML = '<div class="empty-state">Shablonlar topilmadi</div>';
        return;
    }

    grid.innerHTML = templates.map(t => `
        <div class="template-card">
            <div class="template-icon">📄</div>
            <div class="template-info">
                <h3>${t.name}</h3>
                <p>${t.description || 'Tavsif yo\'q'}</p>
                <span class="template-date">
                    ${new Date(t.created_at).toLocaleDateString('uz-UZ')}
                </span>
            </div>
            <div class="template-actions">
                <button class="btn btn-primary btn-sm" 
                        onclick="openFillModal(${t.id})">
                    ✏️ To'ldirish
                </button>
                ${isAdmin() ? `
                    <button class="btn btn-danger btn-sm" 
                            onclick="deleteTemplate(${t.id})">
                        🗑️
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function openFillModal(templateId) {
    // Placeholder'larni olish
    const data = await api.get(`/templates/${templateId}/placeholders/`);
    currentTemplate = { id: templateId, name: data.template_name };

    document.getElementById('modal-title').textContent =
        `${data.template_name} — to'ldirish`;

    // Dinamik inputlar yaratish
    const form = document.getElementById('modal-form');

    if (!data.placeholders.length) {
        form.innerHTML = '<p class="info">Bu shablonda o\'zgaruvchan maydonlar yo\'q</p>';
    } else {
        form.innerHTML = data.placeholders.map(p => `
            <div class="form-group">
                <label>${formatLabel(p)}</label>
                <input type="text" 
                       id="field-${p}" 
                       name="${p}"
                       placeholder="${formatLabel(p)} kiriting...">
            </div>
        `).join('');
    }

    document.getElementById('fill-modal').classList.remove('hidden');
}

function formatLabel(key) {
    // "familiya_ism" -> "Familiya Ism"
    return key.split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

async function generateDocument() {
    const form = document.getElementById('modal-form');
    const inputs = form.querySelectorAll('input');
    const filledData = {};

    for (let input of inputs) {
        filledData[input.name] = input.value;
    }

    // Loading ko'rsatish
    document.getElementById('loading-overlay').classList.remove('hidden');
    closeModal();

    const result = await api.post('/documents/', {
        template_id: currentTemplate.id,
        filled_data: filledData
    });

    document.getElementById('loading-overlay').classList.add('hidden');

    if (result.ok) {
        showDownloadOptions(result.data);
        loadDocuments(); // Ro'yxatni yangilash
    } else {
        alert('Xatolik yuz berdi!');
    }
}

function showDownloadOptions(doc) {
    const choice = confirm(
        `✅ Hujjat tayyor!\n\nQaysi formatda yuklaysiz?\nOK = PDF   |   Bekor = DOCX`
    );

    if (choice) {
        api.downloadFile(
            `/documents/${doc.id}/download_pdf/`,
            `${currentTemplate.name}.pdf`
        );
    } else {
        api.downloadFile(
            `/documents/${doc.id}/download_docx/`,
            `${currentTemplate.name}.docx`
        );
    }
}

function searchTemplates() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allTemplates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query)
    );
    renderTemplates(filtered);
}

async function uploadTemplate() {
    const name = document.getElementById('template-name').value;
    const desc = document.getElementById('template-desc').value;
    const file = document.getElementById('template-file').files[0];

    if (!name || !file) {
        alert('Nom va fayl majburiy!');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('file', file);

    const result = await api.postFormData('/templates/', formData);

    if (result.ok) {
        closeUploadModal();
        loadTemplates();
        alert('✅ Shablon muvaffaqiyatli yuklandi!');
    } else {
        alert('Xatolik: ' + JSON.stringify(result.data));
    }
}

async function deleteTemplate(id) {
    if (!confirm('Shablonni o\'chirishni tasdiqlaysizmi?')) return;

    const ok = await api.delete(`/templates/${id}/`);
    if (ok) {
        loadTemplates();
    }
}

function closeModal() {
    document.getElementById('fill-modal').classList.add('hidden');
}

function openUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
}

