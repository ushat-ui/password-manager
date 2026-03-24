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
const auth     = firebase.auth();
const db       = firebase.firestore();

let currentUser = null;
let passwords   = [];
let masterKey   = null;
let customUrls  = {};

// ============= ТЁМНАЯ ТЕМА =============
function initTheme() {
    if (localStorage.getItem('darkTheme') === '1') {
        document.body.classList.add('dark-theme');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i> <span>Светлая</span>';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', isDark ? '1' : '0');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i> <span>Светлая</span>'
        : '<i class="fas fa-moon"></i> <span>Тёмная</span>';
}

initTheme();

// ============= АВТОБЛОКИРОВКА =============
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 минут
let lockTimer = null;

function resetLockTimer() {
    if (!currentUser || !masterKey) return;
    if (lockTimer) clearTimeout(lockTimer);
    lockTimer = setTimeout(lockApp, LOCK_TIMEOUT_MS);
}

function lockApp() {
    masterKey = null;
    passwords  = [];
    if (lockTimer) { clearTimeout(lockTimer); lockTimer = null; }
    document.getElementById('lockScreen').style.display = 'flex';
    document.getElementById('unlockPassword').value = '';
    document.getElementById('unlockError').textContent = '';
}

async function unlockApp() {
    const pwd = document.getElementById('unlockPassword').value;
    const errEl = document.getElementById('unlockError');
    errEl.textContent = '';

    if (!pwd) { errEl.textContent = '⚠️ Введите мастер-пароль'; return; }
    if (!currentUser) { window.location.reload(); return; }

    const testKey = deriveKey(pwd, currentUser.uid);
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (!doc.exists) { errEl.textContent = '❌ Ошибка загрузки данных'; return; }
        const decrypted = decryptData(doc.data().encryptedData, testKey);
        if (decrypted === null) {
            errEl.textContent = '❌ Неверный мастер-пароль';
            return;
        }
        masterKey = testKey;
        passwords  = decrypted;
        passwords.forEach(p => {
            if (p.showPassword === undefined) p.showPassword = false;
            if (p.needsCheck   === undefined) p.needsCheck   = false;
        });
        renderPasswords();
        document.getElementById('lockScreen').style.display = 'none';
        resetLockTimer();
    } catch (e) {
        errEl.textContent = '❌ Ошибка: ' + e.message;
    }
}

// Сброс таймера при любой активности пользователя
['click','keydown','mousemove','touchstart'].forEach(evt => {
    document.addEventListener(evt, () => { if (masterKey) resetLockTimer(); }, { passive: true });
});

// ============= ПОЛЬЗОВАТЕЛЬСКИЕ URL =============
function loadCustomUrls() {
    try { customUrls = JSON.parse(localStorage.getItem('customSiteUrls') || '{}'); }
    catch(e) { customUrls = {}; }
}

function saveCustomUrl(service, url) {
    customUrls[service.toLowerCase().trim()] = url;
    localStorage.setItem('customSiteUrls', JSON.stringify(customUrls));
}

loadCustomUrls();

// ============= ШИФРОВАНИЕ =============
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

// ============= АУТЕНТИФИКАЦИЯ =============
async function login() {
    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { alert('Заполните все поля'); return; }
    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        currentUser = cred.user;
        masterKey   = deriveKey(password, currentUser.uid);
        await loadUserData();
        showMainApp();
    } catch (e) { alert('Ошибка: ' + e.message); }
}

async function register() {
    const email      = document.getElementById('regEmail').value;
    const password   = document.getElementById('regPassword').value;
    const confirm    = document.getElementById('regConfirm').value;
    const masterHint = document.getElementById('regMasterHint').value;

    if (!email || !password) { alert('Заполните все поля'); return; }
    if (password !== confirm) { alert('Пароли не совпадают'); return; }
    if (password.length < 6)  { alert('Пароль минимум 6 символов'); return; }

    try {
        const cred  = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = cred.user;
        masterKey   = deriveKey(password, currentUser.uid);
        await db.collection('users').doc(currentUser.uid).set({
            encryptedData: encryptData([], masterKey),
            email:         email,
            masterHint:    masterHint || '',
            lastUpdated:   firebase.firestore.FieldValue.serverTimestamp()
        });
        passwords = [];
        renderPasswords();
        showMainApp();
        alert('Регистрация успешна!' + (masterHint ? '\nПодсказка сохранена!' : ''));
    } catch (e) { alert('Ошибка: ' + e.message); }
}

async function logout() {
    if (lockTimer) { clearTimeout(lockTimer); lockTimer = null; }
    await auth.signOut();
    currentUser = null;
    masterKey   = null;
    passwords   = [];
    document.getElementById('authScreen').style.display  = 'flex';
    document.getElementById('mainApp').style.display     = 'none';
    document.getElementById('lockScreen').style.display  = 'none';
}

function showMainApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display    = 'block';
    document.getElementById('userEmail').textContent    = currentUser.email || currentUser.phoneNumber || '';
    resetLockTimer();
}

async function loadUserData() {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists && doc.data().encryptedData) {
        const decrypted = decryptData(doc.data().encryptedData, masterKey);
        passwords = decrypted || [];
        passwords.forEach(p => {
            if (p.showPassword === undefined) p.showPassword = false;
            if (p.needsCheck   === undefined) p.needsCheck   = false;
        });
    } else { passwords = []; }
    renderPasswords();
}

async function saveUserData() {
    if (!currentUser || !masterKey) return;
    await db.collection('users').doc(currentUser.uid).set({
        encryptedData: encryptData(passwords, masterKey),
        email:         currentUser.email || '',
        lastUpdated:   firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const el = document.getElementById('syncStatus');
    if (el) el.innerHTML = '<i class="fas fa-check-circle"></i> Синхронизировано';
}

// ============= ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =============
function switchAuthTab(tab) {
    const forms = { login: 'loginForm', register: 'registerForm', recover: 'recoverForm' };
    Object.values(forms).forEach(id => document.getElementById(id).classList.remove('active'));
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(forms[tab]).classList.add('active');
    document.querySelectorAll('.auth-tab')[['login','register','recover'].indexOf(tab)].classList.add('active');
    backToRecoverMenu();
}

function showRecoverByEmail()  { _showRecoverPanel('recoverByEmail'); }
function showMasterHint()      { _showRecoverPanel('masterHintPanel'); }
function showSupportContact()  { _showRecoverPanel('supportContact'); }

function _showRecoverPanel(panelId) {
    ['recoverStep1','recoverByEmail','masterHintPanel','supportContact'].forEach(id => {
        document.getElementById(id).style.display = id === panelId ? 'block' : 'none';
    });
}

function backToRecoverMenu() {
    ['recoverByEmail','masterHintPanel','supportContact'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById('recoverStep1').style.display = 'block';
}

async function sendPasswordReset() {
    const email = document.getElementById('recoverEmail').value;
    if (!email) { alert('Введите ваш email'); return; }
    try {
        await auth.sendPasswordResetEmail(email);
        alert(`✅ Ссылка отправлена на ${email}. Проверьте папку Спам.`);
        backToRecoverMenu();
    } catch (e) {
        alert(e.code === 'auth/user-not-found' ? '❌ Пользователь не найден' : '❌ Ошибка: ' + e.message);
    }
}

async function sendMasterHint() {
    const email = document.getElementById('hintEmail').value;
    if (!email) { alert('Введите email'); return; }
    try {
        const snap = await db.collection('users').where('email','==',email).get();
        if (snap.empty) { alert('❌ Пользователь не найден'); return; }
        const hint = snap.docs[0].data().masterHint;
        alert(hint
            ? `📝 Ваша подсказка: "${hint}"`
            : 'ℹ️ Подсказка не задана. Обратитесь: halteh@mail.ru');
        backToRecoverMenu();
    } catch (e) { alert('❌ Ошибка. Напишите: halteh@mail.ru'); }
}

function showMasterHintDialog() {
    if (!currentUser) return;
    db.collection('users').doc(currentUser.uid).get().then(doc => {
        const cur  = doc.exists ? (doc.data().masterHint || '') : '';
        const hint = prompt(`Подсказка для мастер-пароля:\nТекущая: ${cur || 'не задана'}`);
        if (hint !== null) {
            db.collection('users').doc(currentUser.uid).update({ masterHint: hint, email: currentUser.email })
              .then(() => alert('✅ Подсказка сохранена!'))
              .catch(e => alert('❌ Ошибка: ' + e.message));
        }
    });
}

// ============= GOOGLE ВХОД =============
async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        await handleSocialLogin(result.user);
    } catch (e) { alert('Не удалось войти через Google: ' + e.message); }
}

// ============= ТЕЛЕФОННЫЙ ВХОД =============
let phoneConfirmationResult = null;

function showPhoneLogin() {
    document.getElementById('phoneStep1').style.display = 'block';
    document.getElementById('phoneStep2').style.display = 'none';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('phoneCode').value   = '';
    document.getElementById('phoneResult').innerHTML = '';
    document.getElementById('phoneModal').style.display = 'flex';
}

async function sendPhoneCode() {
    const phone = document.getElementById('phoneNumber').value.trim();
    if (!phone) { alert('Введите номер телефона'); return; }
    try {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible', callback: () => {}
        });
        phoneConfirmationResult = await auth.signInWithPhoneNumber(phone, window.recaptchaVerifier);
        document.getElementById('phoneStep1').style.display = 'none';
        document.getElementById('phoneStep2').style.display = 'block';
        document.getElementById('phoneResult').textContent = `Код отправлен на ${phone}`;
    } catch (e) { alert('Ошибка отправки кода: ' + e.message); }
}

async function verifyPhoneCode() {
    const code = document.getElementById('phoneCode').value.trim();
    if (!code) { alert('Введите код'); return; }
    try {
        const result = await phoneConfirmationResult.confirm(code);
        await handleSocialLogin(result.user);
        closeModal('phoneModal');
    } catch (e) { alert('Неверный код: ' + e.message); }
}

// ============= СОЦИАЛЬНЫЙ ВХОД (общий) =============
async function handleSocialLogin(user) {
    const docRef = db.collection('users').doc(user.uid);
    const doc    = await docRef.get();

    if (!doc.exists) {
        const pwd = prompt('Придумайте мастер-пароль для шифрования (запомните его!):');
        if (!pwd) { await auth.signOut(); alert('Мастер-пароль обязателен.'); return; }
        masterKey   = deriveKey(pwd, user.uid);
        currentUser = user;
        await docRef.set({
            encryptedData: encryptData([], masterKey),
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            masterHint: '',
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        passwords = [];
        renderPasswords();
        showMainApp();
        alert('✅ Регистрация успешна!');
    } else {
        for (let attempt = 0; attempt < 3; attempt++) {
            const pwd = prompt(`Введите мастер-пароль (осталось попыток: ${3 - attempt}):`);
            if (!pwd) { await auth.signOut(); return; }
            const testKey   = deriveKey(pwd, user.uid);
            const decrypted = decryptData(doc.data().encryptedData, testKey);
            if (decrypted !== null) {
                masterKey   = testKey;
                passwords   = decrypted;
                passwords.forEach(p => {
                    if (p.showPassword === undefined) p.showPassword = false;
                    if (p.needsCheck   === undefined) p.needsCheck   = false;
                });
                currentUser = user;
                renderPasswords();
                showMainApp();
                return;
            }
            if (attempt < 2) alert(`❌ Неверный мастер-пароль. Осталось: ${2 - attempt}`);
        }
        alert('❌ Превышено количество попыток.'); await auth.signOut();
    }
}

// Восстановление сессии при перезагрузке страницы
auth.onAuthStateChanged(async (user) => {
    if (user && !currentUser) {
        for (let attempt = 0; attempt < 3; attempt++) {
            const pwd = prompt(`Введите мастер-пароль (осталось попыток: ${3 - attempt}):`);
            if (!pwd) { await auth.signOut(); return; }
            const testKey = deriveKey(pwd, user.uid);
            const doc     = await db.collection('users').doc(user.uid).get();
            if (doc.exists && doc.data().encryptedData) {
                const decrypted = decryptData(doc.data().encryptedData, testKey);
                if (decrypted !== null) {
                    currentUser = user;
                    masterKey   = testKey;
                    passwords   = decrypted;
                    passwords.forEach(p => {
                        if (p.showPassword === undefined) p.showPassword = false;
                        if (p.needsCheck   === undefined) p.needsCheck   = false;
                    });
                    renderPasswords();
                    showMainApp();
                    return;
                }
            } else {
                // Новый пользователь — нет зашифрованных данных
                currentUser = user;
                masterKey   = testKey;
                passwords   = [];
                renderPasswords();
                showMainApp();
                return;
            }
            if (attempt < 2) alert(`❌ Неверный мастер-пароль. Осталось: ${2 - attempt}`);
        }
        alert('❌ Превышено количество попыток.'); await auth.signOut();
    }
});

// ============= ГЕНЕРАТОР ПАРОЛЕЙ =============
const CHAR_SETS = {
    lower:   'abcdefghijklmnopqrstuvwxyz',
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

function generatePassword(length = 16, opts = { lower: true, upper: true, numbers: true, symbols: true }) {
    let chars = '';
    if (opts.lower)   chars += CHAR_SETS.lower;
    if (opts.upper)   chars += CHAR_SETS.upper;
    if (opts.numbers) chars += CHAR_SETS.numbers;
    if (opts.symbols) chars += CHAR_SETS.symbols;
    if (!chars) chars = CHAR_SETS.lower + CHAR_SETS.numbers;

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, n => chars[n % chars.length]).join('');
}

function openGeneratorModal(targetFieldId) {
    document.getElementById('generatorModal').style.display = 'flex';
    document.getElementById('generatorModal').dataset.target = targetFieldId || '';
    refreshGeneratorOutput();
}

function refreshGeneratorOutput() {
    const length = parseInt(document.getElementById('genLength').value) || 16;
    document.getElementById('genLengthValue').textContent = length;
    const opts = {
        lower:   document.getElementById('genLower').checked,
        upper:   document.getElementById('genUpper').checked,
        numbers: document.getElementById('genNumbers').checked,
        symbols: document.getElementById('genSymbols').checked
    };
    const pwd = generatePassword(length, opts);
    document.getElementById('generatorOutput').textContent = pwd;
    // Показать индикатор надёжности в модальном окне генератора
    updateStrengthUI('genStrengthBar', 'genStrengthLabel', pwd);
}

async function copyGeneratedPassword() {
    const pwd = document.getElementById('generatorOutput').textContent;
    if (!pwd) return;
    try {
        await navigator.clipboard.writeText(pwd);
        const btn = document.getElementById('genCopyBtn');
        btn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Копировать'; }, 1500);
    } catch(e) { alert('Не удалось скопировать'); }
}

function useGeneratedPassword() {
    const pwd      = document.getElementById('generatorOutput').textContent;
    const targetId = document.getElementById('generatorModal').dataset.target;
    if (targetId && document.getElementById(targetId)) {
        document.getElementById(targetId).value = pwd;
        // Обновить индикатор в форме добавления/редактирования
        if (targetId === 'addPassword')  updateStrengthUI('addStrengthBar',  'addStrengthLabel',  pwd);
        if (targetId === 'editPassword') updateStrengthUI('editStrengthBar', 'editStrengthLabel', pwd);
        document.getElementById(targetId).dispatchEvent(new Event('input'));
    }
    closeModal('generatorModal');
}

// ============= ИНДИКАТОР НАДЁЖНОСТИ =============
function getStrengthInfo(password) {
    if (!password) return { pct: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password))        score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { pct: 20,  label: '😟 Слабый',        color: '#ef4444' };
    if (score <= 3) return { pct: 45,  label: '😐 Средний',       color: '#f59e0b' };
    if (score <= 5) return { pct: 70,  label: '😊 Сильный',       color: '#10b981' };
                    return { pct: 100, label: '🔥 Очень сильный', color: '#059669' };
}

function updateStrengthUI(barId, labelId, password) {
    const info = getStrengthInfo(password);
    const bar  = document.getElementById(barId);
    const lbl  = document.getElementById(labelId);
    if (!bar || !lbl) return;
    const meter = bar.closest('.strength-meter');
    if (meter) meter.style.display = password ? 'block' : 'none';
    bar.style.width      = info.pct + '%';
    bar.style.background = info.color;
    lbl.textContent      = info.label;
    lbl.style.color      = info.color;
}

// ============= ДОБАВЛЕНИЕ / РЕДАКТИРОВАНИЕ ПАРОЛЕЙ =============
function showAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    ['addService','addUsername','addPassword','addNotes'].forEach(id => {
        document.getElementById(id).value = '';
    });
    updateStrengthUI('addStrengthBar', 'addStrengthLabel', '');
}

async function addPassword() {
    const service  = document.getElementById('addService').value.trim();
    const password = document.getElementById('addPassword').value.trim();
    if (!service || !password) { alert('Сервис и пароль обязательны!'); return; }
    const newId = passwords.length ? Math.max(...passwords.map(p => p.id)) + 1 : 1;
    passwords.push({
        id:          newId,
        service:     service,
        username:    document.getElementById('addUsername').value.trim(),
        password:    password,
        notes:       document.getElementById('addNotes').value.trim(),
        lastUpdated: new Date().toLocaleString(),
        showPassword: false,
        needsCheck:   false
    });
    await saveUserData();
    closeModal('addModal');
    renderPasswords();
}

function showEditModal(id) {
    const p = passwords.find(p => p.id === id);
    if (!p) return;
    document.getElementById('editId').value       = id;
    document.getElementById('editService').value  = p.service;
    document.getElementById('editUsername').value = p.username || '';
    document.getElementById('editPassword').value = p.password;
    document.getElementById('editNotes').value    = p.notes || '';
    updateStrengthUI('editStrengthBar', 'editStrengthLabel', p.password);
    document.getElementById('editModal').style.display = 'flex';
}

async function updatePassword() {
    const id    = parseInt(document.getElementById('editId').value);
    const index = passwords.findIndex(p => p.id === id);
    if (index !== -1) {
        passwords[index] = {
            ...passwords[index],
            service:     document.getElementById('editService').value.trim(),
            username:    document.getElementById('editUsername').value.trim(),
            password:    document.getElementById('editPassword').value.trim(),
            notes:       document.getElementById('editNotes').value.trim(),
            lastUpdated: new Date().toLocaleString(),
            needsCheck:  false
        };
        await saveUserData();
    }
    closeModal('editModal');
    renderPasswords();
}

async function deletePassword(id) {
    if (!confirm('🗑️ Удалить запись?')) return;
    passwords = passwords.filter(p => p.id !== id);
    await saveUserData();
    renderPasswords();
}

// ============= УТИЛИТЫ =============
function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function toggleShowPassword(id) {
    const p = passwords.find(p => p.id === id);
    if (p) { p.showPassword = !p.showPassword; renderPasswords(); }
}

async function copyText(text, type) {
    if (!text) { alert(`❌ ${type} пуст`); return; }
    try {
        await navigator.clipboard.writeText(text);
        alert(`📋 ${type} скопирован!`);
    } catch(e) { alert(`❌ Не удалось скопировать ${type}`); }
}

function filterPasswords() { renderPasswords(); }

// ============= РЕНДЕР ПАРОЛЕЙ =============
function renderPasswords() {
    const searchText = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const filtered   = passwords.filter(p =>
        p.service.toLowerCase().includes(searchText) ||
        (p.username && p.username.toLowerCase().includes(searchText))
    );
    const container = document.getElementById('passwordsList');
    if (!container) return;

    const total  = passwords.length;
    const el     = document.getElementById('passwordCount');
    if (el) el.textContent = total;

    if (!filtered.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)"><i class="fas fa-lock"></i> Нет сохранённых паролей</p>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const strength = getStrengthInfo(p.password);
        const strengthDot = p.password
            ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${strength.color};margin-right:4px;" title="${strength.label}"></span>`
            : '';
        return `
        <div class="password-item">
            <div class="password-info">
                <div class="password-service">
                    <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(p.service)}&sz=16"
                         width="16" height="16" style="vertical-align:middle;margin-right:6px;" alt="">
                    ${escapeHtml(p.service)}
                    ${p.needsCheck ? '<span class="check-badge"><i class="fas fa-exclamation-triangle"></i> не работает</span>' : ''}
                </div>
                <div class="password-username"><i class="fas fa-user"></i> ${escapeHtml(p.username || 'без логина')}</div>
                <div class="password-pass">${strengthDot}<i class="fas fa-key"></i> ${p.showPassword ? escapeHtml(p.password) : '••••••••'}</div>
                ${p.lastUpdated ? `<div class="password-date"><i class="far fa-calendar-alt"></i> изменено: ${escapeHtml(p.lastUpdated)}</div>` : ''}
            </div>
            <div class="password-actions">
                <button class="small-btn btn-outline" onclick="toggleShowPassword(${p.id})" title="${p.showPassword ? 'Скрыть' : 'Показать'}">
                    <i class="fas ${p.showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.username||'').replace(/'/g,"\\'")}','Логин')" title="Копировать логин">
                    <i class="fas fa-user"></i>
                </button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.password).replace(/'/g,"\\'")}','Пароль')" title="Копировать пароль">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="small-btn btn-outline" onclick="openCheckModal(${p.id})" title="Проверить вход">
                    <i class="fas fa-search"></i>
                </button>
                <button class="small-btn btn-warning" onclick="showEditModal(${p.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="small-btn btn-danger" onclick="deletePassword(${p.id})" title="Удалить">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

// ============= ЭКСПОРТ / ИМПОРТ =============
function exportData() {
    const rows = passwords.map(p => `"${(p.service||'').replace(/"/g,'""')}","${(p.username||'').replace(/"/g,'""')}","${(p.password||'').replace(/"/g,'""')}","${(p.notes||'').replace(/"/g,'""')}"`);
    const csv  = ['Сервис,Логин,Пароль,Заметки', ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'passwords.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function toggleImportMenu() {
    const menu = document.getElementById('importMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', e => {
    const menu = document.getElementById('importMenu');
    if (menu && !e.target.closest('.import-btn-wrapper')) menu.style.display = 'none';
});

function importFromSource(source) {
    const menu = document.getElementById('importMenu');
    if (menu) menu.style.display = 'none';
    const guides = {
        google: 'Google Chrome:\n1. ⋮ → Настройки → Автозаполнение → Пароли\n2. ⋮ → Экспорт паролей → Сохранить CSV',
        yandex: 'Яндекс.Браузер:\n1. ☰ → Настройки → Пароли\n2. Экспорт паролей → Сохранить CSV',
        icloud: 'iCloud (Mac): Системные настройки → Пароли → ⋯ → Экспорт\niPhone: Настройки → Пароли → ⋯ → Экспортировать'
    };
    if (guides[source]) { alert(guides[source] + '\n\nПосле нажмите OK и выберите файл'); }
    if (source === 'excel' || guides[source]) importFromExcel();
    if (source === 'text')  importFromText();
}

function importFromExcel() {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = e => {
        const file = e.target.files[0];
        if (file.name.toLowerCase().endsWith('.csv')) {
            const r = new FileReader();
            r.onload = ev => processCSVContent(ev.target.result);
            r.readAsText(file, 'UTF-8');
        } else {
            if (typeof XLSX === 'undefined') { alert('Библиотека Excel не загружена. Сохраните как CSV.'); return; }
            const r = new FileReader();
            r.onload = ev => {
                try {
                    const wb   = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                    const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                    importRecords(json.map(row => ({
                        service:  String(row['Название'] || row['Сервис'] || row['service'] || row['name'] || row['url'] || '').trim(),
                        username: String(row['Логин']    || row['username'] || row['login'] || row['email'] || '').trim(),
                        password: String(row['Пароль']   || row['password'] || row['pass']  || '').trim(),
                        notes:    String(row['Заметки']  || row['notes']    || '').trim()
                    })));
                } catch(e) { alert('Ошибка: ' + e.message); }
            };
            r.readAsArrayBuffer(file);
        }
    };
    input.click();
}

function processCSVContent(content) {
    const lines   = content.replace(/^\uFEFF/, '').split(/\r?\n/);
    if (lines.length < 2) { alert('Файл пуст'); return; }
    const delim   = lines[0].includes(',') && !lines[0].includes(';') ? ',' : ';';
    const headers = lines[0].split(delim).map(h => h.replace(/^"|"$/g,'').trim().toLowerCase());
    let sI=-1, uI=-1, pI=-1, nI=-1;
    headers.forEach((h,i) => {
        if (/название|сервис|service|name|url/.test(h)) sI=i;
        if (/логин|login|user|username|email/.test(h))  uI=i;
        if (/пароль|password|pass|pwd/.test(h))         pI=i;
        if (/заметки|notes/.test(h))                    nI=i;
    });
    if (sI<0||pI<0) { alert('Не найдены столбцы Сервис/Пароль.\nСтолбцы: ' + headers.join(', ')); return; }

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = [];
        let cur = '', inQ = false;
        for (const ch of lines[i]) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === delim && !inQ) { vals.push(cur.trim()); cur=''; }
            else cur += ch;
        }
        vals.push(cur.trim());
        const v = vals.map(x => x.replace(/^"|"$/g,'').trim());
        if (v[sI] && v[pI]) records.push({ service: v[sI], username: v[uI]||'', password: v[pI], notes: v[nI]||'' });
    }
    importRecords(records);
}

function importFromText() {
    const input  = document.createElement('input');
    input.type   = 'file'; input.accept = '.txt';
    input.onchange = e => {
        const r = new FileReader();
        r.onload = ev => {
            const records = ev.target.result.split(/\r?\n/)
                .filter(l => l.trim() && /[:=]/.test(l))
                .map(l => {
                    const [s, ...rest] = l.split(/[:=]/);
                    const full = rest.join(':').trim();
                    const m    = full.match(/^(\S+@\S+\.\S+)\s+(.+)$/);
                    return {
                        service:  s.trim(),
                        username: m ? m[1] : '',
                        password: m ? m[2] : full
                    };
                });
            importRecords(records);
        };
        r.readAsText(e.target.files[0], 'UTF-8');
    };
    input.click();
}

async function importRecords(newRecords) {
    if (!newRecords.length) { alert('Нет записей для импорта'); return; }
    let imported = 0, dupes = 0;
    for (const r of newRecords) {
        if (!r.service || !r.password) continue;
        if (passwords.some(p =>
            p.service.toLowerCase() === r.service.toLowerCase() &&
            (p.username||'').toLowerCase() === (r.username||'').toLowerCase()
        )) { dupes++; continue; }
        const newId = passwords.length ? Math.max(...passwords.map(p => p.id), 0) + 1 : 1;
        passwords.push({ id: newId, service: r.service, username: r.username||'', password: r.password,
            notes: r.notes||'', lastUpdated: new Date().toLocaleString(), showPassword: false, needsCheck: false });
        imported++;
    }
    if (imported > 0) { await saveUserData(); renderPasswords(); }
    alert(`✅ Импортировано: ${imported}\n⏭️ Пропущено (дубликаты): ${dupes}`);
}

// ============= ПРОВЕРКА ПАРОЛЕЙ =============
let currentCheckId = null;

function guessWebsiteUrl(service) {
    const s = service.toLowerCase().trim();
    if (customUrls[s]) return customUrls[s];
    const known = {
        google: 'https://accounts.google.com', gmail: 'https://mail.google.com',
        yandex: 'https://passport.yandex.ru',  'mail.ru': 'https://mail.ru',
        vk: 'https://vk.com',                  facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',     github: 'https://github.com/login',
        steam: 'https://store.steampowered.com/login',
        discord: 'https://discord.com/login',   twitch: 'https://www.twitch.tv/login'
    };
    for (const [k,v] of Object.entries(known)) { if (s.includes(k)) return v; }
    const m = s.match(/([a-z0-9-]+\.[a-z]{2,})/);
    if (m) return `https://${m[1]}`;
    return `https://${s.replace(/[^a-z0-9]/g,'')}.com`;
}

function openCheckModal(id) {
    const p = passwords.find(p => p.id === id);
    if (!p) return;
    currentCheckId = id;
    document.getElementById('checkServiceName').innerHTML = `<strong><i class="fas fa-globe"></i> ${escapeHtml(p.service)}</strong>`;
    document.getElementById('checkUrl').value      = customUrls[p.service.toLowerCase().trim()] || guessWebsiteUrl(p.service);
    document.getElementById('checkLogin').value    = p.username || '';
    document.getElementById('checkPassword').value = p.password;
    document.getElementById('checkResult').style.display = 'none';
    document.getElementById('checkModal').style.display  = 'flex';
}

function saveCurrentUrl() {
    if (!currentCheckId) return;
    const p   = passwords.find(p => p.id === currentCheckId);
    const url = document.getElementById('checkUrl').value;
    if (!url) { alert('Введите URL'); return; }
    saveCustomUrl(p.service, url);
    showCheckResult('URL сохранён!', '#d4edda', '#155724');
}

async function copyLoginOnly() {
    const v = document.getElementById('checkLogin').value;
    if (!v) { alert('❌ Логин пуст'); return; }
    try { await navigator.clipboard.writeText(v); showCheckResult('✅ Логин скопирован!', '#d4edda', '#155724'); }
    catch(e) { alert('Не удалось скопировать'); }
}

async function copyPasswordOnly() {
    const v = document.getElementById('checkPassword').value;
    if (!v) { alert('❌ Пароль пуст'); return; }
    try { await navigator.clipboard.writeText(v); showCheckResult('✅ Пароль скопирован!', '#d4edda', '#155724'); }
    catch(e) { alert('Не удалось скопировать'); }
}

async function copyLoginAndPassword() {
    const l = document.getElementById('checkLogin').value;
    const p = document.getElementById('checkPassword').value;
    const t = `Логин: ${l||'не указан'}\nПароль: ${p||'не указан'}`;
    try { await navigator.clipboard.writeText(t); showCheckResult('✅ Логин и пароль скопированы!', '#d4edda', '#155724'); }
    catch(e) { alert('Не удалось скопировать'); }
}

function testLogin() {
    const url = document.getElementById('checkUrl').value;
    if (!url) { alert('Введите URL сайта'); return; }
    const l = document.getElementById('checkLogin').value;
    const p = document.getElementById('checkPassword').value;
    navigator.clipboard.writeText(`${l}\n${p}`).catch(() => {});
    const win = window.open(url, '_blank');
    if (!win) { showCheckResult('⚠️ Браузер заблокировал всплывающее окно. Разрешите его.', '#f8d7da', '#721c24'); return; }
    setTimeout(() => showCheckResult(
        `<i class="fas fa-check-circle"></i> Сайт открыт.<br>
         <strong>📋 Данные скопированы:</strong><br>
         Логин: ${escapeHtml(l||'не указан')}<br>Пароль: ${escapeHtml(p||'не указан')}<br>
         <small>Нажмите Ctrl+V на странице входа</small>`,
        '#d4edda', '#155724'
    ), 800);
}

function markAsFailed() {
    if (!currentCheckId) return;
    const idx = passwords.findIndex(p => p.id === currentCheckId);
    if (idx !== -1) {
        passwords[idx].needsCheck = true;
        saveUserData(); renderPasswords();
        showCheckResult('<i class="fas fa-exclamation-triangle"></i> Отмечен как нерабочий.', '#f8d7da', '#721c24');
        setTimeout(() => closeModal('checkModal'), 2000);
    }
}

function showCheckResult(html, bg, color) {
    const el = document.getElementById('checkResult');
    el.style.display    = 'block';
    el.style.background = bg;
    el.style.color      = color;
    el.style.padding    = '10px';
    el.style.borderRadius = '8px';
    el.innerHTML        = html;
}
