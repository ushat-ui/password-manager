// ============= FIREBASE =============
const firebaseConfig = {
    apiKey: "AIzaSyD0_0HEiKov6a1IHZwL8zLgCh-V_28vQIs",
    authDomain: "password-manager-app-3ec4d.firebaseapp.com",
    projectId: "password-manager-app-3ec4d",
    storageBucket: "password-manager-app-3ec4d.firebasestorage.app",
    messagingSenderId: "588609077068",
    appId: "1:588609077068:web:c5ec834c1a74a0e0c919e9",
    measurementId: "G-73L452P9C0"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let passwords = [];
let masterKey = null;
let customUrls = {};

// Загрузка пользовательских URL
function loadCustomUrls() {
    const saved = localStorage.getItem('customSiteUrls');
    if (saved) {
        try { customUrls = JSON.parse(saved); } catch(e) {}
    }
}
function saveCustomUrl(service, url) {
    const key = service.toLowerCase().trim();
    customUrls[key] = url;
    localStorage.setItem('customSiteUrls', JSON.stringify(customUrls));
}
loadCustomUrls();

// Шифрование
function deriveKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 10000 }).toString();
}
function encryptData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}
function decryptData(encrypted, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch(e) { return null; }
}

// Аутентификация
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { alert('Заполните все поля'); return; }
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        masterKey = deriveKey(password, currentUser.uid);
        await loadUserData();
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userEmail').textContent = currentUser.email;
    } catch (error) { alert('Ошибка: ' + error.message); }
}

async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const masterHint = document.getElementById('regMasterHint').value;

    if (!email || !password) { alert('Заполните все поля'); return; }
    if (password !== confirm) { alert('Пароли не совпадают'); return; }
    if (password.length < 6) { alert('Пароль минимум 6 символов'); return; }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        masterKey = deriveKey(password, currentUser.uid);
        await db.collection('users').doc(currentUser.uid).set({
            encryptedData: encryptData([], masterKey),
            email: email,
            masterHint: masterHint || '',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        passwords = [];
        renderPasswords();
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userEmail').textContent = currentUser.email;
        alert('Регистрация успешна!\n\n' + (masterHint ? 'Ваша подсказка сохранена!' : 'Совет: добавьте подсказку для мастер-пароля в настройках профиля.'));
    } catch (error) { 
        alert('Ошибка: ' + error.message); 
    }
}

async function logout() {
    await auth.signOut();
    currentUser = null;
    masterKey = null;
    passwords = [];
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

async function loadUserData() {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists && doc.data().encryptedData) {
        const decrypted = decryptData(doc.data().encryptedData, masterKey);
        passwords = decrypted || [];
        passwords.forEach(p => { 
            if (p.showPassword === undefined) p.showPassword = false; 
            if (p.needsCheck === undefined) p.needsCheck = false;
        });
    } else { passwords = []; }
    renderPasswords();
}

async function saveUserData() {
    if (!currentUser || !masterKey) return;
    const encrypted = encryptData(passwords, masterKey);
    await db.collection('users').doc(currentUser.uid).set({
        encryptedData: encrypted,
        email: currentUser.email,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const statusElem = document.getElementById('syncStatus');
    statusElem.innerHTML = '<i class="fas fa-check-circle"></i> Синхронизировано';
    setTimeout(() => { statusElem.innerHTML = '<i class="fas fa-check-circle"></i> Синхронизировано'; }, 2000);
}

// Переключение вкладок
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const recoverForm = document.getElementById('recoverForm');
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        recoverForm.classList.remove('active');
        tabs[0].classList.add('active');
        document.getElementById('recoverStep1').style.display = 'block';
        document.getElementById('recoverByEmail').style.display = 'none';
        document.getElementById('masterHintPanel').style.display = 'none';
        document.getElementById('supportContact').style.display = 'none';
    } else if (tab === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        recoverForm.classList.remove('active');
        tabs[1].classList.add('active');
    } else if (tab === 'recover') {
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        recoverForm.classList.add('active');
        tabs[2].classList.add('active');
        document.getElementById('recoverStep1').style.display = 'block';
        document.getElementById('recoverByEmail').style.display = 'none';
        document.getElementById('masterHintPanel').style.display = 'none';
        document.getElementById('supportContact').style.display = 'none';
    }
}

function showRecoverByEmail() {
    document.getElementById('recoverStep1').style.display = 'none';
    document.getElementById('recoverByEmail').style.display = 'block';
}
function showMasterHint() {
    document.getElementById('recoverStep1').style.display = 'none';
    document.getElementById('masterHintPanel').style.display = 'block';
}
function showSupportContact() {
    document.getElementById('recoverStep1').style.display = 'none';
    document.getElementById('supportContact').style.display = 'block';
}
function backToRecoverMenu() {
    document.getElementById('recoverStep1').style.display = 'block';
    document.getElementById('recoverByEmail').style.display = 'none';
    document.getElementById('masterHintPanel').style.display = 'none';
    document.getElementById('supportContact').style.display = 'none';
}

async function sendPasswordReset() {
    const email = document.getElementById('recoverEmail').value;
    if (!email) { alert('Введите ваш email'); return; }
    try {
        await auth.sendPasswordResetEmail(email);
        alert(`✅ Ссылка для сброса пароля отправлена на ${email}\n\nПроверьте почту (включая папку Спам).`);
        backToRecoverMenu();
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            alert('❌ Пользователь с таким email не найден');
        } else {
            alert('❌ Ошибка: ' + error.message);
        }
    }
}

async function sendMasterHint() {
    const email = document.getElementById('hintEmail').value;
    if (!email) { alert('Введите ваш email'); return; }
    try {
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();
        if (usersSnapshot.empty) {
            alert('❌ Пользователь с таким email не найден');
            return;
        }
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        if (userData.masterHint && userData.masterHint.trim() !== '') {
            alert(`📝 Ваша подсказка: "${userData.masterHint}"\n\nЕсли не помогло, обратитесь в поддержку: halteh@mail.ru`);
        } else {
            alert('ℹ️ Подсказка не была установлена при регистрации.\n\nОбратитесь в поддержку: halteh@mail.ru');
        }
        backToRecoverMenu();
    } catch (error) {
        console.error(error);
        alert('❌ Ошибка при получении подсказки. Обратитесь в поддержку: halteh@mail.ru');
    }
}

function showMasterHintDialog() {
    if (!currentUser) return;
    db.collection('users').doc(currentUser.uid).get().then(doc => {
        const currentHint = doc.exists ? (doc.data().masterHint || '') : '';
        const newHint = prompt(`Введите подсказку для мастер-пароля (чтобы не забыть его):\n\nПример: "Мой любимый фильм" или "Дата рождения"\n\nТекущая: ${currentHint || 'не задана'}\n\nЕсли не хотите менять, нажмите Отмена`);
        if (newHint !== null) {
            db.collection('users').doc(currentUser.uid).update({
                masterHint: newHint,
                email: currentUser.email
            }).then(() => alert('✅ Подсказка сохранена!\n\nПри восстановлении пароля вы сможете её увидеть.'))
            .catch(error => alert('❌ Ошибка сохранения: ' + error.message));
        }
    });
}

// Вспомогательные функции
function escapeHtml(text) { 
    if (!text) return '';
    const div = document.createElement('div'); 
    div.textContent = text; 
    return div.innerHTML; 
}

function toggleShowPassword(id) {
    const index = passwords.findIndex(p => p.id === id);
    if (index !== -1) {
        passwords[index].showPassword = !passwords[index].showPassword;
        renderPasswords();
    }
}

async function copyText(text, type) {
    if (!text || text === 'без логина' || text === '' || text === 'no login') {
        alert(`❌ ${type} пуст`);
        return;
    }
    await navigator.clipboard.writeText(text);
    alert(`📋 ${type} скопирован!`);
}

function renderPasswords() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filtered = passwords.filter(p => 
        p.service.toLowerCase().includes(searchText) || 
        (p.username && p.username.toLowerCase().includes(searchText))
    );
    const container = document.getElementById('passwordsList');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;"><i class="fas fa-lock"></i> Нет сохранённых паролей</p>';
        return;
    }
    container.innerHTML = filtered.map(p => `
        <div class="password-item">
            <div class="password-info">
                <div class="password-service">
                    <i class="fas fa-globe"></i> ${escapeHtml(p.service)}
                    ${p.needsCheck ? '<span class="check-badge"><i class="fas fa-exclamation-triangle"></i> не работает</span>' : ''}
                </div>
                <div class="password-username"><i class="fas fa-user"></i> ${escapeHtml(p.username || 'без логина')}</div>
                <div class="password-pass"><i class="fas fa-key"></i> ${p.showPassword ? escapeHtml(p.password) : '••••••••'}</div>
                ${p.lastUpdated ? `<div style="font-size: 11px; color: #999; margin-top: 6px;"><i class="far fa-calendar-alt"></i> изменено: ${escapeHtml(p.lastUpdated)}</div>` : ''}
            </div>
            <div class="password-actions">
                <button class="small-btn btn-outline" onclick="toggleShowPassword(${p.id})" title="${p.showPassword ? 'Скрыть пароль' : 'Показать пароль'}"><i class="fas ${p.showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.username || '').replace(/'/g, "\\'")}', 'Логин')" title="Скопировать логин"><i class="fas fa-copy"></i> Логин</button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.password).replace(/'/g, "\\'")}', 'Пароль')" title="Скопировать пароль"><i class="fas fa-copy"></i> Пароль</button>
                <button class="small-btn btn-outline" onclick="openCheckModal(${p.id})" title="Проверить вход"><i class="fas fa-search"></i></button>
                <button class="small-btn btn-warning" onclick="showEditModal(${p.id})" title="Редактировать"><i class="fas fa-edit"></i></button>
                <button class="small-btn btn-danger" onclick="deletePassword(${p.id})" title="Удалить"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `).join('');
}

// Добавление/редактирование паролей
function showAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('addService').value = '';
    document.getElementById('addUsername').value = '';
    document.getElementById('addPassword').value = '';
    document.getElementById('addNotes').value = '';
}

async function addPassword() {
    const service = document.getElementById('addService').value.trim();
    const password = document.getElementById('addPassword').value.trim();
    if (!service || !password) { alert('Сервис и пароль обязательны!'); return; }
    const newId = passwords.length > 0 ? Math.max(...passwords.map(p => p.id)) + 1 : 1;
    passwords.push({
        id: newId,
        service: service,
        username: document.getElementById('addUsername').value.trim(),
        password: password,
        notes: document.getElementById('addNotes').value.trim(),
        lastUpdated: new Date().toLocaleString(),
        showPassword: false,
        needsCheck: false
    });
    await saveUserData();
    closeModal('addModal');
    renderPasswords();
}

function showEditModal(id) {
    const p = passwords.find(p => p.id === id);
    if (p) {
        document.getElementById('editId').value = id;
        document.getElementById('editService').value = p.service;
        document.getElementById('editUsername').value = p.username || '';
        document.getElementById('editPassword').value = p.password;
        document.getElementById('editNotes').value = p.notes || '';
        document.getElementById('editModal').style.display = 'flex';
    }
}

async function updatePassword() {
    const id = parseInt(document.getElementById('editId').value);
    const index = passwords.findIndex(p => p.id === id);
    if (index !== -1) {
        passwords[index] = {
            ...passwords[index],
            service: document.getElementById('editService').value.trim(),
            username: document.getElementById('editUsername').value.trim(),
            password: document.getElementById('editPassword').value.trim(),
            notes: document.getElementById('editNotes').value.trim(),
            lastUpdated: new Date().toLocaleString(),
            needsCheck: false
        };
        await saveUserData();
    }
    closeModal('editModal');
    renderPasswords();
}

async function deletePassword(id) {
    if (confirm('🗑️ Удалить запись?')) {
        passwords = passwords.filter(p => p.id !== id);
        await saveUserData();
        renderPasswords();
    }
}

function filterPasswords() { renderPasswords(); }

function exportData() {
    const data = passwords.map(p => ({ 'Сервис': p.service, 'Логин': p.username, 'Пароль': p.password, 'Заметки': p.notes }));
    const csv = ['Сервис,Логин,Пароль,Заметки', ...data.map(d => `"${(d['Сервис'] || '').replace(/"/g, '""')}","${(d['Логин'] || '').replace(/"/g, '""')}","${(d['Пароль'] || '').replace(/"/g, '""')}","${(d['Заметки'] || '').replace(/"/g, '""')}"`)].join('\n');
    const blob = new Blob(["\uFEFF" + csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'passwords.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function toggleImportMenu() {
    const menu = document.getElementById('importMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
    const menu = document.getElementById('importMenu');
    const btn = e.target.closest('.import-btn-wrapper');
    if (menu && !btn && !menu.contains(e.target)) menu.style.display = 'none';
});

function importFromSource(source) {
    const menu = document.getElementById('importMenu');
    if (menu) menu.style.display = 'none';
    if (source === 'google') alert('Как выгрузить пароли из Google Chrome:\n\n1. Откройте Chrome\n2. Нажмите на три точки → Настройки\n3. Автозаполнение → Пароли\n4. Нажмите три точки → Экспорт паролей\n5. Сохраните CSV файл\n6. После OK выберите этот файл');
    else if (source === 'yandex') alert('Как выгрузить пароли из Яндекс.Браузера:\n\n1. Откройте Яндекс.Браузер\n2. Нажмите на три полоски → Настройки\n3. Пароли и карты → Пароли\n4. Нажмите "Экспорт паролей"\n5. Сохраните CSV файл\n6. После OK выберите этот файл');
    else if (source === 'icloud') alert('Как выгрузить пароли из iCloud:\n\nНа Mac: Системные настройки → Пароли → выбрать все → экспорт\nНа iPhone: Настройки → Пароли → нажмите и удерживайте → экспорт\n\nПосле OK выберите CSV файл');
    else if (source === 'excel') importFromExcel();
    else if (source === 'text') importFromText();
}

function importFromExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                processCSVContent(event.target.result);
            };
            reader.readAsText(file, 'UTF-8');
            return;
        }
        if (typeof XLSX === 'undefined') {
            alert('Библиотека для чтения Excel не загружена. Пожалуйста, сохраните файл как CSV и импортируйте заново.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                const records = [];
                for (const row of json) {
                    const service = row['Название'] || row['Сервис'] || row['service'] || row['name'] || row['url'] || '';
                    const username = row['Логин'] || row['username'] || row['login'] || row['user'] || '';
                    const password = row['Пароль'] || row['password'] || row['pass'] || '';
                    const notes = row['Заметки'] || row['notes'] || '';
                    if (service && password) {
                        records.push({ service: String(service).trim(), username: String(username).trim(), password: String(password).trim(), notes: String(notes).trim() });
                    }
                }
                importRecords(records);
            } catch(e) { alert('Ошибка при чтении файла: ' + e.message); }
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
}

function processCSVContent(content) {
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.split(/\r?\n/);
    if (lines.length < 2) { alert('Файл пуст'); return; }
    let delimiter = ';';
    const firstLine = lines[0];
    if (firstLine.includes(',') && !firstLine.includes(';')) delimiter = ',';
    const headers = firstLine.split(delimiter).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    let serviceIdx = -1, usernameIdx = -1, passwordIdx = -1, notesIdx = -1;
    for (let i = 0; i < headers.length; i++) {
        const h = headers[i];
        if (h.includes('название') || h.includes('сервис') || h.includes('service') || h.includes('name') || h.includes('url')) serviceIdx = i;
        if (h.includes('логин') || h.includes('login') || h.includes('user') || h.includes('username') || h.includes('email')) usernameIdx = i;
        if (h.includes('пароль') || h.includes('password') || h.includes('pass') || h === 'pwd') passwordIdx = i;
        if (h.includes('заметки') || h.includes('notes') || h.includes('note')) notesIdx = i;
    }
    if (serviceIdx === -1 || passwordIdx === -1) { alert('Не удалось найти столбцы "Сервис" и/или "Пароль".\n\nДоступные заголовки: ' + headers.join(', ')); return; }
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === delimiter && !inQuotes) { values.push(current.trim()); current = ''; }
            else current += char;
        }
        values.push(current.trim());
        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
        if (cleanValues.length <= Math.max(serviceIdx, passwordIdx, usernameIdx)) continue;
        const service = cleanValues[serviceIdx];
        const password = cleanValues[passwordIdx];
        if (!service || !password) continue;
        if (service === 'Название' || service === 'Сервис') continue;
        const username = usernameIdx !== -1 && cleanValues[usernameIdx] ? cleanValues[usernameIdx] : '';
        const notes = notesIdx !== -1 && cleanValues[notesIdx] ? cleanValues[notesIdx] : '';
        records.push({ service, username, password, notes });
    }
    if (records.length === 0) { alert('Не найдено записей для импорта.'); return; }
    importRecords(records);
}

function importFromText() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const content = event.target.result;
            const lines = content.split(/\r?\n/);
            const records = [];
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed.includes(':') || trimmed.includes('=')) {
                    let parts = trimmed.split(/[:=]/);
                    if (parts.length >= 2) {
                        const service = parts[0].trim();
                        const rest = parts.slice(1).join(':').trim();
                        let username = '';
                        let password = rest;
                        const spaceMatch = rest.match(/^(\S+@\S+\.\S+)\s+(.+)$/);
                        if (spaceMatch) { username = spaceMatch[1]; password = spaceMatch[2]; }
                        else if (rest.includes(' ')) {
                            const spaceParts = rest.split(' ');
                            if (spaceParts.length >= 2 && (spaceParts[0].includes('@') || spaceParts[0].length > 3)) {
                                username = spaceParts[0];
                                password = spaceParts.slice(1).join(' ');
                            }
                        }
                        if (service && password) records.push({ service, username, password });
                    }
                }
            }
            importRecords(records);
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

async function importRecords(newRecords) {
    if (!newRecords.length) { alert('Не найдено записей для импорта'); return; }
    let imported = 0, duplicates = 0;
    for (const record of newRecords) {
        if (!record.service || !record.password) continue;
        const exists = passwords.some(p => p.service.toLowerCase() === record.service.toLowerCase() && (p.username?.toLowerCase() || '') === (record.username?.toLowerCase() || ''));
        if (exists) { duplicates++; continue; }
        const newId = passwords.length > 0 ? Math.max(...passwords.map(p => p.id), 0) + 1 : 1;
        passwords.push({
            id: newId, service: record.service, username: record.username || '', password: record.password,
            notes: record.notes || '', lastUpdated: new Date().toLocaleString(), showPassword: false, needsCheck: false
        });
        imported++;
    }
    if (imported > 0) {
        await saveUserData();
        renderPasswords();
        alert(`✅ Импортировано: ${imported} записей\n⏭️ Пропущено (дубликаты): ${duplicates}`);
    } else {
        alert(`⚠️ Не удалось импортировать записи.\nНайдено: ${newRecords.length}\nДубликатов: ${duplicates}`);
    }
}

// ============= ПРОВЕРКА ПАРОЛЕЙ =============
let currentCheckId = null;
function guessWebsiteUrl(service) {
    const serviceLower = service.toLowerCase().trim();
    if (customUrls[serviceLower]) return customUrls[serviceLower];
    const domains = {
        'google': 'https://accounts.google.com', 'gmail': 'https://mail.google.com',
        'yandex': 'https://passport.yandex.ru', 'mail.ru': 'https://mail.ru',
        'vk': 'https://vk.com', 'facebook': 'https://facebook.com',
        'instagram': 'https://instagram.com', 'github': 'https://github.com/login',
        'steam': 'https://store.steampowered.com/login', 'epicgames': 'https://www.epicgames.com/id/login',
        'discord': 'https://discord.com/login', 'twitch': 'https://www.twitch.tv/login',
        'aol': 'https://login.aol.com'
    };
    for (const [key, url] of Object.entries(domains)) {
        if (serviceLower === key || serviceLower.includes(key)) return url;
    }
    const match = serviceLower.match(/([a-z0-9-]+\.[a-z]{2,})/);
    if (match) return `https://${match[1]}`;
    const clean = serviceLower.replace(/[^a-z0-9]/g, '');
    return clean ? `https://${clean}.com` : '';
}

function openCheckModal(id) {
    const p = passwords.find(p => p.id === id);
    if (!p) return;
    currentCheckId = id;
    document.getElementById('checkServiceName').innerHTML = `<strong><i class="fas fa-globe"></i> ${escapeHtml(p.service)}</strong>`;
    let url = customUrls[p.service.toLowerCase().trim()];
    if (!url) url = guessWebsiteUrl(p.service);
    document.getElementById('checkUrl').value = url;
    document.getElementById('checkLogin').value = p.username || '';
    document.getElementById('checkPassword').value = p.password;
    document.getElementById('checkResult').style.display = 'none';
    document.getElementById('checkResult').innerHTML = '';
    document.getElementById('checkModal').style.display = 'flex';
}

function saveCurrentUrl() {
    if (!currentCheckId) return;
    const p = passwords.find(p => p.id === currentCheckId);
    if (!p) return;
    const url = document.getElementById('checkUrl').value;
    if (!url) { alert('Введите URL для сохранения'); return; }
    saveCustomUrl(p.service, url);
    const resultDiv = document.getElementById('checkResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> URL сохранён! При следующей проверке он будет использован автоматически.';
    resultDiv.style.background = '#d4edda';
    resultDiv.style.color = '#155724';
    setTimeout(() => resultDiv.style.display = 'none', 2000);
}

async function copyLoginOnly() {
    const login = document.getElementById('checkLogin').value;
    if (!login) { alert('❌ Логин пуст'); return; }
    await navigator.clipboard.writeText(login);
    const resultDiv = document.getElementById('checkResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Логин скопирован!\nМожно вставить (Ctrl+V)';
    resultDiv.style.background = '#d4edda';
    setTimeout(() => resultDiv.style.display = 'none', 2000);
}

async function copyPasswordOnly() {
    const password = document.getElementById('checkPassword').value;
    if (!password) { alert('❌ Пароль пуст'); return; }
    await navigator.clipboard.writeText(password);
    const resultDiv = document.getElementById('checkResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Пароль скопирован!\nМожно вставить (Ctrl+V)';
    resultDiv.style.background = '#d4edda';
    setTimeout(() => resultDiv.style.display = 'none', 2000);
}

async function copyLoginAndPassword() {
    const login = document.getElementById('checkLogin').value;
    const password = document.getElementById('checkPassword').value;
    if (!login && !password) { alert('❌ Нет данных для копирования'); return; }
    const text = `Логин: ${login || 'не указан'}\nПароль: ${password || 'не указан'}`;
    await navigator.clipboard.writeText(text);
    const resultDiv = document.getElementById('checkResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Логин и пароль скопированы!\nМожно вставить (Ctrl+V)';
    resultDiv.style.background = '#d4edda';
    setTimeout(() => resultDiv.style.display = 'none', 2000);
}

function testLogin() {
    const url = document.getElementById('checkUrl').value;
    const login = document.getElementById('checkLogin').value;
    const password = document.getElementById('checkPassword').value;
    const resultDiv = document.getElementById('checkResult');
    if (!url) { alert('Введите ссылку на сайт'); return; }
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Открывается сайт...<br><small>После открытия страницы вставьте логин и пароль (Ctrl+V)</small>';
    resultDiv.style.background = '#fff3cd';
    resultDiv.style.color = '#856404';
    navigator.clipboard.writeText(`${login}\n${password}`).then(() => {
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Открывается сайт...<br><i class="fas fa-check-circle"></i> Данные скопированы!<br><small>Логин и пароль уже в буфере. Нажмите Ctrl+V на странице входа</small>';
    }).catch(() => {
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Открывается сайт...<br><i class="fas fa-exclamation-triangle"></i> Не удалось скопировать данные автоматически';
    });
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
        resultDiv.innerHTML = '⚠️ Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для этого сайта.';
        resultDiv.style.background = '#f8d7da';
        resultDiv.style.color = '#721c24';
        return;
    }
    setTimeout(() => {
        resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> Сайт открыт в новой вкладке.<br><br><strong>📋 Данные уже скопированы!</strong><br><i class="fas fa-user"></i> Логин: ${escapeHtml(login || 'не указан')}<br><i class="fas fa-key"></i> Пароль: ${escapeHtml(password || 'не указан')}<br><br><strong>💡 Инструкция:</strong><br>1. Перейдите на открытую вкладку<br>2. Нажмите Ctrl+V (или Cmd+V на Mac), чтобы вставить данные<br>3. Нажмите Войти`;
        resultDiv.style.background = '#d4edda';
        resultDiv.style.color = '#155724';
    }, 1000);
}

function markAsFailed() {
    if (!currentCheckId) return;
    const idx = passwords.findIndex(p => p.id === currentCheckId);
    if (idx !== -1) {
        passwords[idx].needsCheck = true;
        saveUserData();
        renderPasswords();
        const resultDiv = document.getElementById('checkResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Пароль отмечен как нерабочий. Появится значок ⚠️ рядом с записью.';
        resultDiv.style.background = '#f8d7da';
        resultDiv.style.color = '#721c24';
        setTimeout(() => closeModal('checkModal'), 2000);
    }
}

// ============= ВХОД ЧЕРЕЗ GOOGLE =============
async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        await handleSocialLogin(user);
    } catch (error) {
        alert('Не удалось войти через Google: ' + error.message);
    }
}

// ============= ВХОД ПО ТЕЛЕФОНУ =============
let phoneConfirmationResult = null;

function showPhoneLogin() {
    document.getElementById('phoneStep1').style.display = 'block';
    document.getElementById('phoneStep2').style.display = 'none';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('phoneCode').value = '';
    document.getElementById('phoneResult').innerHTML = '';
    document.getElementById('phoneModal').style.display = 'flex';
}

async function sendPhoneCode() {
    const phone = document.getElementById('phoneNumber').value.trim();
    if (!phone) {
        alert('Введите корректный номер телефона');
        return;
    }
    try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible',
            callback: () => {}
        });
        phoneConfirmationResult = await auth.signInWithPhoneNumber(phone, window.recaptchaVerifier);
        document.getElementById('phoneStep1').style.display = 'none';
        document.getElementById('phoneStep2').style.display = 'block';
        document.getElementById('phoneResult').innerHTML = `Код отправлен на номер ${phone}`;
    } catch (error) {
        console.error(error);
        alert('Неверный код или ошибка отправки: ' + error.message);
    }
}

async function verifyPhoneCode() {
    const code = document.getElementById('phoneCode').value.trim();
    if (!code) {
        alert('Заполните все поля');
        return;
    }
    try {
        const result = await phoneConfirmationResult.confirm(code);
        const user = result.user;
        await handleSocialLogin(user);
        closeModal('phoneModal');
    } catch (error) {
        alert('Неверный код или ошибка отправки: ' + error.message);
    }
}

// ============= ОБЩАЯ ОБРАБОТКА СОЦИАЛЬНОГО/ТЕЛЕФОННОГО ВХОДА =============
async function handleSocialLogin(user) {
    const docRef = db.collection('users').doc(user.uid);
    const doc = await docRef.get();
    if (!doc.exists) {
        const masterPassword = prompt('Введите мастер-пароль (запомните его!):');
        if (!masterPassword) {
            await user.delete();
            alert('Для шифрования данных необходимо задать мастер-пароль.');
            return;
        }
        masterKey = deriveKey(masterPassword, user.uid);
        await docRef.set({
            encryptedData: encryptData([], masterKey),
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            masterHint: '',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        passwords = [];
        currentUser = user;
        renderPasswords();
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email || user.phoneNumber;
        alert('Регистрация успешна!');
    } else {
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        while (attempts < maxAttempts && !success) {
            const pwd = prompt(`Введите мастер-пароль для расшифровки данных:\n(Осталось попыток: ${maxAttempts - attempts})`);
            if (!pwd) {
                await auth.signOut();
                return;
            }
            const testKey = deriveKey(pwd, user.uid);
            const data = doc.data();
            const decrypted = decryptData(data.encryptedData, testKey);
            if (decrypted !== null) {
                success = true;
                masterKey = testKey;
                passwords = decrypted;
                passwords.forEach(p => { if (p.showPassword === undefined) p.showPassword = false; if (p.needsCheck === undefined) p.needsCheck = false; });
                renderPasswords();
                currentUser = user;
                document.getElementById('authScreen').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
                document.getElementById('userEmail').textContent = user.email || user.phoneNumber;
                alert('✅ Вход выполнен успешно!');
                return;
            } else {
                attempts++;
                if (attempts < maxAttempts) alert(`❌ Неверный мастер-пароль!\nОсталось попыток: ${maxAttempts - attempts}`);
            }
        }
        if (!success) {
            alert('❌ Превышено количество попыток. Выход из аккаунта.');
            await auth.signOut();
        }
    }
}

// Обработка состояния авторизации с мастер-паролем
auth.onAuthStateChanged(async (user) => {
    if (user && !currentUser) {
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        while (attempts < maxAttempts && !success) {
            const pwd = prompt(`Введите мастер-пароль для расшифровки данных:\n(Осталось попыток: ${maxAttempts - attempts})`);
            if (!pwd) { await auth.signOut(); return; }
            const testKey = deriveKey(pwd, user.uid);
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists && doc.data().encryptedData) {
                const decrypted = decryptData(doc.data().encryptedData, testKey);
                if (decrypted !== null) {
                    success = true;
                    currentUser = user;
                    masterKey = testKey;
                    passwords = decrypted;
                    passwords.forEach(p => { if (p.showPassword === undefined) p.showPassword = false; if (p.needsCheck === undefined) p.needsCheck = false; });
                    renderPasswords();
                    document.getElementById('authScreen').style.display = 'none';
                    document.getElementById('mainApp').style.display = 'block';
                    document.getElementById('userEmail').textContent = currentUser.email;
                    alert('✅ Вход выполнен успешно!');
                    return;
                } else {
                    attempts++;
                    if (attempts < maxAttempts) alert(`❌ Неверный мастер-пароль!\nОсталось попыток: ${maxAttempts - attempts}`);
                }
            } else {
                success = true;
                currentUser = user;
                masterKey = testKey;
                passwords = [];
                renderPasswords();
                document.getElementById('authScreen').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
                document.getElementById('userEmail').textContent = currentUser.email;
                return;
            }
        }
        if (!success) { alert('❌ Превышено количество попыток. Выход из аккаунта.'); await auth.signOut(); }
    }
});