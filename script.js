// ===================== МУЛЬТИЯЗЫЧНОСТЬ =====================
const languages = {
    ru: { flag: '🇷🇺', name: 'Русский' },
    en: { flag: '🇬🇧', name: 'English' },
    zh: { flag: '🇨🇳', name: '中文' },
    fr: { flag: '🇫🇷', name: 'Français' },
    de: { flag: '🇩🇪', name: 'Deutsch' },
    it: { flag: '🇮🇹', name: 'Italiano' },
    es: { flag: '🇪🇸', name: 'Español' }
};

let currentLang = localStorage.getItem('app_lang') || 'ru';

const translations = {
    ru: {
        app_name: "Облачный менеджер паролей",
        app_slogan: "Ваши пароли в безопасности в облаке",
        login_tab: "Вход",
        register_tab: "Регистрация",
        recover_tab: "Восстановление",
        login_btn: "Войти",
        register_btn: "Зарегистрироваться",
        password_placeholder: "Пароль",
        reg_password_placeholder: "Пароль (мин. 6 символов)",
        confirm_password_placeholder: "Подтвердите пароль",
        master_hint_placeholder: "Подсказка для мастер-пароля (необязательно)",
        master_password_info: "Мастер-пароль — это пароль для шифрования ваших данных. Запомните его! Без него доступ к паролям будет невозможен.",
        support_email_label: "Техподдержка",
        recover_choose_method: "Выберите способ восстановления:",
        recover_firebase_btn: "Восстановить пароль Firebase",
        recover_master_hint_btn: "Напомнить мастер-пароль",
        recover_support_btn: "Связаться с поддержкой",
        recover_firebase_title: "Восстановление пароля",
        recover_send_btn: "Отправить ссылку для сброса",
        back_btn: "Назад",
        master_hint_title: "Подсказка мастер-пароля",
        send_hint_btn: "Отправить подсказку",
        hint_info: "Подсказка была создана при регистрации.",
        support_title: "Связаться с поддержкой",
        support_response_time: "Время ответа: обычно в течение 24 часов",
        support_info: "При обращении укажите ваш email и опишите проблему.",
        encryption_note: "Все данные шифруются. Сервер не знает ваши пароли.",
        synced: "Синхронизировано",
        logout: "Выйти",
        search_placeholder: "🔍 Поиск по сервису или логину...",
        add_password_btn: "Добавить пароль",
        export_csv_btn: "Экспорт в CSV",
        import_passwords_btn: "Импорт паролей",
        import_excel: "Excel / CSV файл",
        import_google: "Google Chrome (CSV)",
        import_yandex: "Яндекс.Пароли (CSV)",
        import_icloud: "iCloud / iPhone (CSV)",
        import_text: "Текстовый файл",
        my_passwords_title: "Мои пароли",
        add_password_title: "Добавить пароль",
        edit_password_title: "Редактировать",
        service_placeholder: "Сервис *",
        username_placeholder: "Логин",
        notes_placeholder: "Заметки",
        save_btn: "Сохранить",
        cancel_btn: "Отмена",
        check_login_title: "Проверка входа",
        url_placeholder: "Ссылка на сайт (https://...)",
        copy_login_btn: "Копировать логин",
        copy_password_btn: "Копировать пароль",
        copy_all_btn: "Копировать всё",
        test_login_btn: "Проверить",
        mark_failed_btn: "Не работает",
        close_btn: "Закрыть",
        msg_fill_fields: "Заполните все поля",
        msg_passwords_not_match: "Пароли не совпадают",
        msg_password_min_length: "Пароль минимум 6 символов",
        msg_reg_success: "Регистрация успешна!",
        msg_hint_saved: "Ваша подсказка сохранена!",
        msg_hint_advice: "Совет: добавьте подсказку для мастер-пароля в настройках профиля.",
        msg_error: "Ошибка: ",
        msg_service_password_required: "Сервис и пароль обязательны!",
        msg_delete_confirm: "🗑️ Удалить запись?",
        msg_login_empty: "❌ Логин пуст",
        msg_password_empty: "❌ Пароль пуст",
        msg_copy_login_success: "✅ Логин скопирован!",
        msg_copy_password_success: "✅ Пароль скопирован!",
        msg_copy_all_success: "✅ Логин и пароль скопированы!",
        msg_no_data_copy: "❌ Нет данных для копирования",
        msg_copy_failed: "❌ Не удалось скопировать",
        msg_enter_url: "Введите ссылку на сайт",
        msg_site_opened: "Сайт открыт в новой вкладке.",
        msg_data_copied: "Данные скопированы!",
        msg_instruction: "Инструкция:\n1. Перейдите на открытую вкладку\n2. Нажмите Ctrl+V (или Cmd+V на Mac), чтобы вставить данные\n3. Нажмите Войти",
        msg_popup_blocked: "⚠️ Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для этого сайта.",
        msg_mark_failed: "⚠️ Пароль отмечен как нерабочий.",
        msg_url_saved: "✅ URL сохранён! При следующей проверке он будет использован автоматически.",
        msg_enter_url_to_save: "Введите URL для сохранения",
        msg_import_google_help: "Как выгрузить пароли из Google Chrome:\n\n1. Откройте Chrome\n2. Нажмите на три точки → Настройки\n3. Автозаполнение → Пароли\n4. Нажмите три точки → Экспорт паролей\n5. Сохраните CSV файл\n6. После OK выберите этот файл",
        msg_import_yandex_help: "Как выгрузить пароли из Яндекс.Браузера:\n\n1. Откройте Яндекс.Браузер\n2. Нажмите на три полоски → Настройки\n3. Пароли и карты → Пароли\n4. Нажмите \"Экспорт паролей\"\n5. Сохраните CSV файл\n6. После OK выберите этот файл",
        msg_import_icloud_help: "Как выгрузить пароли из iCloud:\n\nНа Mac: Системные настройки → Пароли → выбрать все → экспорт\nНа iPhone: Настройки → Пароли → нажмите и удерживайте → экспорт\n\nПосле OK выберите CSV файл",
        msg_xlsx_not_loaded: "Библиотека для чтения Excel не загружена. Пожалуйста, сохраните файл как CSV и импортируйте заново.",
        msg_file_empty: "Файл пуст",
        msg_headers_not_found: "Не удалось найти столбцы \"Сервис\" и/или \"Пароль\".",
        msg_no_records: "Не найдено записей для импорта.",
        msg_import_success: (imported, duplicates) => `✅ Импортировано: ${imported} записей\n⏭️ Пропущено (дубликаты): ${duplicates}`,
        msg_import_fail: (total, dup) => `⚠️ Не удалось импортировать записи.\nНайдено: ${total}\nДубликатов: ${dup}`,
        msg_password_reset_sent: (email) => `✅ Ссылка для сброса пароля отправлена на ${email}\n\nПроверьте почту (включая папку Спам).`,
        msg_user_not_found: "❌ Пользователь с таким email не найден",
        msg_master_hint_sent: (hint) => `📝 Ваша подсказка: "${hint}"\n\nЕсли не помогло, обратитесь в поддержку: halteh@mail.ru`,
        msg_no_hint: "ℹ️ Подсказка не была установлена при регистрации.\n\nОбратитесь в поддержку: halteh@mail.ru",
        msg_hint_saved_ok: "✅ Подсказка сохранена!\n\nПри восстановлении пароля вы сможете её увидеть.",
        msg_hint_save_error: "❌ Ошибка сохранения: ",
        msg_login_success: "✅ Вход выполнен успешно!",
        msg_wrong_master_password: (attemptsLeft) => `❌ Неверный мастер-пароль!\nОсталось попыток: ${attemptsLeft}`,
        msg_max_attempts: "❌ Превышено количество попыток. Выход из аккаунта.",
        msg_enter_master_password: (attempts) => `Введите мастер-пароль для расшифровки данных:\n(Осталось попыток: ${attempts})`,
        msg_no_passwords: "🔒 Нет сохранённых паролей",
        msg_no_login: "без логина",
        msg_modified: "изменено: ",
        msg_copy_login_title: "Логин",
        msg_copy_password_title: "Пароль"
    },
    en: {
        app_name: "Cloud Password Manager",
        app_slogan: "Your passwords are safe in the cloud",
        login_tab: "Login",
        register_tab: "Register",
        recover_tab: "Recovery",
        login_btn: "Sign In",
        register_btn: "Sign Up",
        password_placeholder: "Password",
        reg_password_placeholder: "Password (min 6 chars)",
        confirm_password_placeholder: "Confirm password",
        master_hint_placeholder: "Master password hint (optional)",
        master_password_info: "Master password is used to encrypt your data. Remember it! Without it, access to passwords is impossible.",
        support_email_label: "Support",
        recover_choose_method: "Choose recovery method:",
        recover_firebase_btn: "Reset Firebase password",
        recover_master_hint_btn: "Remind master password hint",
        recover_support_btn: "Contact support",
        recover_firebase_title: "Password recovery",
        recover_send_btn: "Send reset link",
        back_btn: "Back",
        master_hint_title: "Master password hint",
        send_hint_btn: "Send hint",
        hint_info: "The hint was created during registration.",
        support_title: "Contact support",
        support_response_time: "Response time: usually within 24 hours",
        support_info: "Please provide your email and describe the issue.",
        encryption_note: "All data is encrypted. The server does not know your passwords.",
        synced: "Synced",
        logout: "Logout",
        search_placeholder: "🔍 Search by service or login...",
        add_password_btn: "Add password",
        export_csv_btn: "Export to CSV",
        import_passwords_btn: "Import passwords",
        import_excel: "Excel / CSV file",
        import_google: "Google Chrome (CSV)",
        import_yandex: "Yandex.Passwords (CSV)",
        import_icloud: "iCloud / iPhone (CSV)",
        import_text: "Text file",
        my_passwords_title: "My passwords",
        add_password_title: "Add password",
        edit_password_title: "Edit",
        service_placeholder: "Service *",
        username_placeholder: "Username",
        notes_placeholder: "Notes",
        save_btn: "Save",
        cancel_btn: "Cancel",
        check_login_title: "Check login",
        url_placeholder: "Website URL (https://...)",
        copy_login_btn: "Copy login",
        copy_password_btn: "Copy password",
        copy_all_btn: "Copy all",
        test_login_btn: "Test",
        mark_failed_btn: "Mark as failed",
        close_btn: "Close",
        msg_fill_fields: "Please fill in all fields",
        msg_passwords_not_match: "Passwords do not match",
        msg_password_min_length: "Password must be at least 6 characters",
        msg_reg_success: "Registration successful!",
        msg_hint_saved: "Your hint has been saved!",
        msg_hint_advice: "Tip: add a master password hint in profile settings.",
        msg_error: "Error: ",
        msg_service_password_required: "Service and password are required!",
        msg_delete_confirm: "🗑️ Delete entry?",
        msg_login_empty: "❌ Login is empty",
        msg_password_empty: "❌ Password is empty",
        msg_copy_login_success: "✅ Login copied!",
        msg_copy_password_success: "✅ Password copied!",
        msg_copy_all_success: "✅ Login and password copied!",
        msg_no_data_copy: "❌ No data to copy",
        msg_copy_failed: "❌ Failed to copy",
        msg_enter_url: "Please enter website URL",
        msg_site_opened: "Website opened in a new tab.",
        msg_data_copied: "Data copied!",
        msg_instruction: "Instructions:\n1. Go to the opened tab\n2. Press Ctrl+V (or Cmd+V on Mac) to paste the data\n3. Click Sign In",
        msg_popup_blocked: "⚠️ Browser blocked popup. Allow popups for this site.",
        msg_mark_failed: "⚠️ Password marked as failed.",
        msg_url_saved: "✅ URL saved! It will be used automatically next time.",
        msg_enter_url_to_save: "Enter URL to save",
        msg_import_google_help: "How to export passwords from Google Chrome:\n\n1. Open Chrome\n2. Click three dots → Settings\n3. Autofill → Passwords\n4. Click three dots → Export passwords\n5. Save CSV file\n6. After OK select this file",
        msg_import_yandex_help: "How to export passwords from Yandex.Browser:\n\n1. Open Yandex.Browser\n2. Click three lines → Settings\n3. Passwords and cards → Passwords\n4. Click 'Export passwords'\n5. Save CSV file\n6. After OK select this file",
        msg_import_icloud_help: "How to export passwords from iCloud:\n\nOn Mac: System Settings → Passwords → select all → export\nOn iPhone: Settings → Passwords → tap and hold → export\n\nAfter OK select CSV file",
        msg_xlsx_not_loaded: "Excel library not loaded. Please save the file as CSV and import again.",
        msg_file_empty: "File is empty",
        msg_headers_not_found: "Could not find 'Service' and/or 'Password' columns.",
        msg_no_records: "No records found for import.",
        msg_import_success: (imported, duplicates) => `✅ Imported: ${imported} entries\n⏭️ Skipped (duplicates): ${duplicates}`,
        msg_import_fail: (total, dup) => `⚠️ Failed to import entries.\nFound: ${total}\nDuplicates: ${dup}`,
        msg_password_reset_sent: (email) => `✅ Password reset link sent to ${email}\n\nCheck your email (including spam folder).`,
        msg_user_not_found: "❌ User with this email not found",
        msg_master_hint_sent: (hint) => `📝 Your hint: "${hint}"\n\nIf it didn't help, contact support: halteh@mail.ru`,
        msg_no_hint: "ℹ️ No hint was set during registration.\n\nPlease contact support: halteh@mail.ru",
        msg_hint_saved_ok: "✅ Hint saved!\nYou can see it when recovering password.",
        msg_hint_save_error: "❌ Error saving: ",
        msg_login_success: "✅ Login successful!",
        msg_wrong_master_password: (attemptsLeft) => `❌ Wrong master password!\nAttempts left: ${attemptsLeft}`,
        msg_max_attempts: "❌ Maximum attempts exceeded. Logging out.",
        msg_enter_master_password: (attempts) => `Enter master password to decrypt data:\n(Attempts left: ${attempts})`,
        msg_no_passwords: "🔒 No saved passwords",
        msg_no_login: "no login",
        msg_modified: "modified: ",
        msg_copy_login_title: "Login",
        msg_copy_password_title: "Password"
    }
};

// Заполняем для остальных языков копией английского
for (let lang of ['zh', 'fr', 'de', 'it', 'es']) {
    if (!translations[lang]) translations[lang] = { ...translations.en };
}

function t(key, ...args) {
    let text = translations[currentLang]?.[key] || translations.ru[key] || key;
    if (typeof text === 'function') return text(...args);
    return text;
}

function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    document.getElementById('authTitle').textContent = t('app_name');
    const syncSpan = document.getElementById('syncStatus');
    if (syncSpan) syncSpan.textContent = t('synced');
}

function setLanguage(lang) {
    if (!languages[lang]) return;
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateUILanguage();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initLanguageSelector() {
    const container = document.getElementById('langSelector');
    container.innerHTML = '';
    for (const [code, info] of Object.entries(languages)) {
        const btn = document.createElement('button');
        btn.className = 'lang-btn' + (code === currentLang ? ' active' : '');
        btn.setAttribute('data-lang', code);
        btn.innerHTML = info.flag;
        btn.title = info.name;
        btn.onclick = () => setLanguage(code);
        container.appendChild(btn);
    }
}

// ===================== TOAST =====================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `
        ${icon}
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => toast.remove();
    
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, duration);
}

// ===================== SKELETON =====================
function showSkeleton() {
    const container = document.getElementById('passwordsList');
    if (!container) return;
    container.innerHTML = `
        <div class="skeleton skeleton-item">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 60%; margin-top: 8px;"></div>
            <div class="skeleton skeleton-actions"></div>
        </div>
        <div class="skeleton skeleton-item">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 40%; margin-top: 8px;"></div>
            <div class="skeleton skeleton-actions"></div>
        </div>
    `;
}

function hideSkeleton() {
    // не требуется, будет заменено рендерингом
}

// ============= FIREBASE И ОСНОВНЫЕ ФУНКЦИИ =============
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

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast(t('msg_fill_fields'), 'error'); return; }
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        masterKey = deriveKey(password, currentUser.uid);
        await loadUserData();
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userEmail').textContent = currentUser.email;
        showToast(t('msg_login_success'), 'success');
    } catch (error) { showToast(t('msg_error') + error.message, 'error'); }
}

async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const masterHint = document.getElementById('regMasterHint').value;
    
    if (!email || !password) { showToast(t('msg_fill_fields'), 'error'); return; }
    if (password !== confirm) { showToast(t('msg_passwords_not_match'), 'error'); return; }
    if (password.length < 6) { showToast(t('msg_password_min_length'), 'error'); return; }
    
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
        showToast(t('msg_reg_success') + (masterHint ? ' ' + t('msg_hint_saved') : ''), 'success');
    } catch (error) { 
        showToast(t('msg_error') + error.message, 'error');
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
    showSkeleton();
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
    statusElem.innerHTML = '<i class="fas fa-check-circle"></i> ' + t('synced');
    setTimeout(() => { statusElem.innerHTML = '<i class="fas fa-check-circle"></i> ' + t('synced'); }, 2000);
}

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
    if (!email) { showToast(t('msg_fill_fields'), 'error'); return; }
    
    await auth.setLanguageCode('ru');
    
    try {
        await auth.sendPasswordResetEmail(email);
        showToast(t('msg_password_reset_sent', email), 'success');
        backToRecoverMenu();
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            showToast(t('msg_user_not_found'), 'error');
        } else {
            showToast(t('msg_error') + error.message, 'error');
        }
    }
}

async function sendMasterHint() {
    const email = document.getElementById('hintEmail').value;
    if (!email) { showToast(t('msg_fill_fields'), 'error'); return; }
    
    try {
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (usersSnapshot.empty) {
            showToast(t('msg_user_not_found'), 'error');
            return;
        }
        
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        
        if (userData.masterHint && userData.masterHint.trim() !== '') {
            showToast(t('msg_master_hint_sent', userData.masterHint), 'info');
        } else {
            showToast(t('msg_no_hint'), 'warning');
        }
        backToRecoverMenu();
    } catch (error) {
        console.error(error);
        showToast('❌ Ошибка при получении подсказки. Обратитесь в поддержку: halteh@mail.ru', 'error');
    }
}

function showMasterHintDialog() {
    if (!currentUser) return;
    db.collection('users').doc(currentUser.uid).get().then(doc => {
        const currentHint = doc.exists ? (doc.data().masterHint || '') : '';
        const newHint = prompt('Введите подсказку для мастер-пароля (чтобы не забыть его):\n\nПример: "Мой любимый фильм" или "Дата рождения"\n\nЕсли не хотите менять, нажмите Отмена', currentHint);
        if (newHint !== null) {
            db.collection('users').doc(currentUser.uid).update({
                masterHint: newHint,
                email: currentUser.email
            }).then(() => showToast(t('msg_hint_saved_ok'), 'success'))
            .catch(error => showToast(t('msg_hint_save_error') + error.message, 'error'));
        }
    });
}

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
        showToast(`❌ ${type} ${t('msg_login_empty')}`, 'error');
        return;
    }
    await navigator.clipboard.writeText(text);
    showToast(`📋 ${type} ${t('msg_copy_login_success')}`, 'success');
}

function renderPasswords() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filtered = passwords.filter(p => 
        p.service.toLowerCase().includes(searchText) || 
        (p.username && p.username.toLowerCase().includes(searchText))
    );
    const container = document.getElementById('passwordsList');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;"><i class="fas fa-lock"></i> ' + t('msg_no_passwords') + '</p>';
        return;
    }
    container.innerHTML = filtered.map(p => `
        <div class="password-item">
            <div class="password-info">
                <div class="password-service">
                    <i class="fas fa-globe"></i> ${escapeHtml(p.service)}
                    ${p.needsCheck ? '<span class="check-badge"><i class="fas fa-exclamation-triangle"></i> ' + t('mark_failed_btn') + '</span>' : ''}
                </div>
                <div class="password-username"><i class="fas fa-user"></i> ${escapeHtml(p.username || t('msg_no_login'))}</div>
                <div class="password-pass"><i class="fas fa-key"></i> ${p.showPassword ? escapeHtml(p.password) : '••••••••'}</div>
                ${p.lastUpdated ? `<div style="font-size: 11px; color: #999; margin-top: 6px;"><i class="far fa-calendar-alt"></i> ${t('msg_modified')} ${escapeHtml(p.lastUpdated)}</div>` : ''}
            </div>
            <div class="password-actions">
                <button class="small-btn btn-outline" onclick="toggleShowPassword(${p.id})"><i class="fas ${p.showPassword ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.username || '').replace(/'/g, "\\'")}', '${t('msg_copy_login_title')}')"><i class="fas fa-copy"></i> ${t('copy_login_btn')}</button>
                <button class="small-btn btn-outline" onclick="copyText('${escapeHtml(p.password).replace(/'/g, "\\'")}', '${t('msg_copy_password_title')}')"><i class="fas fa-copy"></i> ${t('copy_password_btn')}</button>
                <button class="small-btn btn-outline" onclick="openCheckModal(${p.id})"><i class="fas fa-search"></i></button>
                <button class="small-btn btn-warning" onclick="showEditModal(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="small-btn btn-danger" onclick="deletePassword(${p.id})"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `).join('');
}

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
    if (!service || !password) { showToast(t('msg_service_password_required'), 'error'); return; }
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
    showToast('✅ ' + t('msg_added'), 'success');
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
    showToast('✅ ' + t('msg_updated'), 'success');
}

async function deletePassword(id) {
    if (confirm(t('msg_delete_confirm'))) {
        passwords = passwords.filter(p => p.id !== id);
        await saveUserData();
        renderPasswords();
        showToast('🗑️ ' + t('msg_deleted'), 'info');
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
    showToast('📁 Экспорт завершён', 'success');
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
    if (source === 'google') showToast(t('msg_import_google_help'), 'info');
    else if (source === 'yandex') showToast(t('msg_import_yandex_help'), 'info');
    else if (source === 'icloud') showToast(t('msg_import_icloud_help'), 'info');
    else showToast('Импорт будет доступен в следующей версии', 'info');
}

// ============= ПРОВЕРКА ПАРОЛЕЙ =============
let currentCheckId = null;

function guessWebsiteUrl(service) {
    const serviceLower = service.toLowerCase().trim();
    if (customUrls[serviceLower]) return customUrls[serviceLower];
    const domains = {
        'google': 'https://accounts.google.com',
        'gmail': 'https://mail.google.com',
        'yandex': 'https://passport.yandex.ru',
        'mail.ru': 'https://mail.ru',
        'vk': 'https://vk.com',
        'facebook': 'https://facebook.com',
        'instagram': 'https://instagram.com',
        'github': 'https://github.com/login',
        'steam': 'https://store.steampowered.com/login',
        'epicgames': 'https://www.epicgames.com/id/login',
        'discord': 'https://discord.com/login',
        'twitch': 'https://www.twitch.tv/login',
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
    if (!url) { showToast(t('msg_enter_url_to_save'), 'error'); return; }
    saveCustomUrl(p.service, url);
    const resultDiv = document.getElementById('checkResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> ' + t('msg_url_saved');
    resultDiv.style.background = '#d4edda';
    resultDiv.style.color = '#155724';
    setTimeout(() => resultDiv.style.display = 'none', 2000);
}

async function copyLoginOnly() {
    const login = document.getElementById('checkLogin').value;
    if (!login) { showToast(t('msg_login_empty'), 'error'); return; }
    await navigator.clipboard.writeText(login);
    showToast(t('msg_copy_login_success'), 'success');
}

async function copyPasswordOnly() {
    const password = document.getElementById('checkPassword').value;
    if (!password) { showToast(t('msg_password_empty'), 'error'); return; }
    await navigator.clipboard.writeText(password);
    showToast(t('msg_copy_password_success'), 'success');
}

async function copyLoginAndPassword() {
    const login = document.getElementById('checkLogin').value;
    const password = document.getElementById('checkPassword').value;
    const text = `${t('msg_copy_login_title')}: ${login || t('msg_no_login')}\n${t('msg_copy_password_title')}: ${password || '---'}`;
    await navigator.clipboard.writeText(text);
    showToast(t('msg_copy_all_success'), 'success');
}

function testLogin() {
    const url = document.getElementById('checkUrl').value;
    const login = document.getElementById('checkLogin').value;
    const password = document.getElementById('checkPassword').value;
    const resultDiv = document.getElementById('checkResult');
    if (!url) { showToast(t('msg_enter_url'), 'error'); return; }
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('msg_site_opened') + '<br>' + t('msg_data_copied');
    navigator.clipboard.writeText(`${login}\n${password}`);
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
        resultDiv.innerHTML = t('msg_popup_blocked');
        return;
    }
    setTimeout(() => {
        resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${t('msg_site_opened')}<br><br>📋 ${t('msg_data_copied')}<br><br>💡 ${t('msg_instruction')}`;
        resultDiv.style.background = '#d4edda';
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
        resultDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + t('msg_mark_failed');
        setTimeout(() => closeModal('checkModal'), 2000);
        showToast(t('msg_mark_failed'), 'warning');
    }
}

auth.onAuthStateChanged(async (user) => {
    if (user && !currentUser) {
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        while (attempts < maxAttempts && !success) {
            const pwd = prompt(t('msg_enter_master_password', maxAttempts - attempts));
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
                    showToast(t('msg_login_success'), 'success');
                    return;
                } else {
                    attempts++;
                    if (attempts < maxAttempts) showToast(t('msg_wrong_master_password', maxAttempts - attempts), 'error');
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
        if (!success) { showToast(t('msg_max_attempts'), 'error'); await auth.signOut(); }
    }
});

initLanguageSelector();
updateUILanguage();