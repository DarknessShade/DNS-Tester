import { initialServers } from "./data.js";

let servers = [];
let isChecking = false;

const elements = {
    dnsList: document.getElementById('dns-list'),
    mainButton: document.getElementById('main-button'),
    buttonText: document.getElementById('button-text'),
    buttonLoader: document.getElementById('button-loader'),
    chartPercent: document.getElementById('chart-percent'),
    donutFg: document.getElementById('donut-fg'),
    themeToggle: document.getElementById('theme-toggle'),
    themeSun: document.getElementById('theme-icon-sun'),
    themeMoon: document.getElementById('theme-icon-moon'),
    ipAddress: document.getElementById('ip-address'),
    geolocation: document.getElementById('geolocation'),
    countryFlag: document.getElementById('country-flag'),
    searchBox: document.getElementById('search-box'),
    addDnsButton: document.getElementById('add-dns-button'),
    historyButton: document.getElementById('history-button'),
    shareButton: document.getElementById('share-button'),
    sharePage: document.getElementById('share-page'),
    shareList: document.getElementById('share-list'),
    shareContentArea: document.getElementById('share-content-area'),
    downloadButton: document.getElementById('download-button'),
    shareScreenshotButton: document.getElementById('share-screenshot-button'),
    closeSharePage: document.getElementById('close-share-page'),
};

// --- CUSTOM DNS MANAGEMENT ---
function getCustomServers() {
    return JSON.parse(localStorage.getItem('customDnsServers') || '[]');
}

function saveCustomServers(customServers) {
    localStorage.setItem('customDnsServers', JSON.stringify(customServers));
}

function loadServers() {
    const customServers = getCustomServers();
    const initialServersCopy = JSON.parse(JSON.stringify(initialServers));
    servers = [...initialServersCopy, ...customServers];
}

function addCustomServer(name, url) {
    if (!name || !url) {
        showModal('<p>نام و آدرس DNS نمی‌تواند خالی باشد.</p>');
        return;
    }
    try {
        new URL(url);
    } catch (_) {
        showModal('<p>آدرس DNS وارد شده معتبر نیست.</p>');
        return;
    }

    const customServers = getCustomServers();
    const newServer = {
        id: `custom-${Date.now()}`,
        name: name,
        url: url,
        features: ['سفارشی'],
        privacy: 'نامشخص',
        group: 'سفارشی',
        isCustom: true,
        status: 'neutral',
        ping: null,
        isBest: false,
        ipv4: 'N/A',
        ipv6: 'N/A',
    };
    customServers.push(newServer);
    saveCustomServers(customServers);
    loadServers();
    renderList();
}

function deleteCustomServer(serverId) {
    let customServers = getCustomServers();
    customServers = customServers.filter(s => s.id !== serverId);
    saveCustomServers(customServers);
    loadServers();
    renderList();
}


// --- UI & THEME ---
const applyTheme = theme => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    elements.themeSun.classList.toggle('hidden', theme !== 'dark');
    elements.themeMoon.classList.toggle('hidden', theme === 'dark');
};

// --- RENDER & UPDATE ---
function renderList() {
    const searchTerm = elements.searchBox.value.toLowerCase();
    const filteredServers = servers.filter(
        s =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.group.toLowerCase().includes(searchTerm) ||
            (s.url && s.url.toLowerCase().includes(searchTerm))
    );

    elements.dnsList.innerHTML = '';
    if (filteredServers.length === 0) {
        elements.dnsList.innerHTML = `<p class="text-center text-gray-400 col-span-full mt-8">هیچ سروری یافت نشد.</p>`;
        return;
    }

    filteredServers.forEach((server, index) => {
        const div = document.createElement('div');
        div.className = `dns-item-box flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 hover:bg-[var(--hover-bg)]`;
        div.style.opacity = '0';
        div.style.animation = `fadeInUp 0.5s ease-out ${index * 0.03}s forwards`;
        
        let statusHtml;
        switch (server.status) {
            case 'success':
                statusHtml = `<div class="flex items-center justify-end text-xs"><span class="text-green-400 text-lg ml-1.5">●</span><span class="font-semibold">${server.ping}ms</span></div>`;
                break;
            case 'error':
                statusHtml = `<div class="flex items-center justify-end text-xs"><span class="text-red-400 text-lg ml-1.5">●</span><span class="text-gray-400">خطا</span></div>`;
                break;
            case 'loading':
                statusHtml = `<div class="loader !w-4 !h-4 mx-auto"></div>`;
                break;
            default:
                statusHtml = ``;
        }

        const bestIcon = server.isBest
            ? `<svg class="w-4 h-4 text-yellow-400 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`
            : '';
        
        const infoButton = `
            <button data-server-id="${server.id}" class="info-button p-1 text-[var(--icon-color)] hover:text-blue-500 transition-colors" title="اطلاعات سرور">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
        `;

        const deleteButton = server.isCustom
            ? `<button data-server-id="${server.id}" class="delete-button p-1 text-[var(--icon-color)] hover:text-red-500 transition-colors" title="حذف سرور">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </button>`
            : '';

        div.innerHTML = `
            <div class="flex items-center flex-grow min-w-0">
                ${bestIcon}
                <span class="font-medium text-xs text-[var(--text-color)] truncate">${server.name}</span>
            </div>
            <div class="flex items-center flex-shrink-0 gap-1">
                <div id="status-${server.id}" class="transition-all duration-300 w-16 text-right">${statusHtml}</div>
                ${infoButton}
                ${deleteButton}
            </div>
        `;
        elements.dnsList.appendChild(div);
    });

    elements.dnsList.querySelectorAll('.info-button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const serverId = e.currentTarget.dataset.serverId;
            const server = servers.find(s => s.id === serverId);
            if (server) showServerInfoModal(server);
        });
    });

    elements.dnsList.querySelectorAll('.delete-button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const serverId = e.currentTarget.dataset.serverId;
            const server = servers.find(s => s.id === serverId);
            if (!server) return;
            
            const modalContent = `
                <h3 class="text-lg font-bold mb-4">تایید حذف</h3>
                <p class="mb-5">آیا از حذف سرور <span class="font-bold">${server.name}</span> مطمئن هستید؟</p>
                <div class="flex justify-end gap-3">
                    <button class="modal-cancel-button bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">انصراف</button>
                    <button class="modal-confirm-delete bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">حذف</button>
                </div>
            `;
            const modal = createCustomModal(modalContent);
            modal.querySelector('.modal-cancel-button').onclick = () => removeModal(modal);
            modal.querySelector('.modal-confirm-delete').onclick = () => {
                deleteCustomServer(serverId);
                removeModal(modal);
            };
        });
    });
}

function updateMainButton() {
    elements.mainButton.disabled = isChecking;
    elements.buttonLoader.classList.toggle('hidden', !isChecking);
    elements.buttonText.innerText = isChecking ? 'در حال بررسی...' : 'بررسی سرورها';
}

function updateChart(percent) {
    elements.donutFg.style.strokeDashoffset = 100 - percent;
    elements.chartPercent.textContent = `${Math.round(percent)}%`;
}

// --- API & CORE LOGIC ---
async function fetchUserIP() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch IP info');
        const data = await response.json();
        elements.ipAddress.textContent = data.ip || 'N/A';
        elements.geolocation.textContent = data.city ? `${data.city}, ${data.country_name}` : 'N/A';

        if (data.country_code) {
            elements.countryFlag.src = `https://flagcdn.com/w20/${data.country_code.toLowerCase()}.png`;
            elements.countryFlag.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error fetching user IP:", error);
        elements.ipAddress.textContent = 'ناموفق';
        elements.geolocation.textContent = 'ناموفق';
        elements.countryFlag.classList.add('hidden');
    }
}

async function measurePing(url) {
    const startTime = performance.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const endTime = performance.now();
        return Math.round(endTime - startTime);
    } catch (error) {
        return null;
    }
}

async function checkDnsServers() {
    isChecking = true;
    servers.forEach(s => {
        s.status = 'loading';
        s.ping = null;
        s.isBest = false;
    });
    renderList();
    updateMainButton();
    updateChart(0);
    elements.chartPercent.textContent = `...`;

    await Promise.all(
        servers.map(async server => {
            const ping = await measurePing(server.url);
            server.status = ping !== null ? 'success' : 'error';
            server.ping = ping;
        }),
    );

    const successfulServers = servers.filter(s => s.status === 'success');
    if (successfulServers.length > 0) {
        const bestServer = successfulServers.sort((a, b) => a.ping - b.ping)[0];
        bestServer.isBest = true;
    }

    servers.sort((a, b) => {
        if (a.status === 'success' && b.status !== 'success') return -1;
        if (a.status !== 'success' && b.status === 'success') return 1;
        if (a.status === 'success' && b.status === 'success') return a.ping - b.ping;
        return 0;
    });

    isChecking = false;
    updateChart(servers.length > 0 ? (successfulServers.length / servers.length) * 100 : 0);
    saveTestHistory();
    elements.shareButton.disabled = false;
    renderList();
    updateMainButton();
}

// --- HISTORY & SHARE ---
function saveTestHistory() {
    let history = JSON.parse(localStorage.getItem('dnsTestHistory') || '[]');
    const topServer = servers.find(s => s.isBest);
    history.unshift({
        date: new Date().toLocaleString('fa-IR'),
        topServer: topServer ? topServer.name : 'N/A',
        ping: topServer ? topServer.ping : 'N/A',
    });
    localStorage.setItem('dnsTestHistory', JSON.stringify(history.slice(0, 5)));
}

elements.historyButton.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem('dnsTestHistory') || '[]');
    let content = '<h3 class="text-lg font-bold mb-4">تاریخچه ۵ تست اخیر</h3>';
    if (history.length === 0) {
        content += '<p>هنوز تستی انجام نشده است.</p>';
    } else {
        content += '<ul class="text-right space-y-2">';
        history.forEach(item => {
            content += `<li class="p-2 bg-black/10 rounded-lg text-sm"><strong>${item.date}:</strong> سرور برتر: <span class="font-semibold">${item.topServer} (${item.ping}ms)</span></li>`;
        });
        content += '</ul>';
    }
    showModal(content);
});

elements.shareButton.addEventListener('click', () => {
    elements.shareList.innerHTML = '';
    servers.forEach(server => {
        let statusHtml;
        switch (server.status) {
            case 'success':
                statusHtml = `<span class="text-green-400 font-semibold">${server.ping}ms</span>`;
                break;
            case 'error':
                statusHtml = `<span class="text-red-400">خطا</span>`;
                break;
            default:
                statusHtml = `<span class="text-gray-400">تست نشده</span>`;
                break;
        }
        const bestIcon = server.isBest
            ? `<svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`
            : '';
        const item = document.createElement('div');
        item.className = 'dns-item-box flex flex-col text-center justify-center items-center p-2 rounded-lg text-xs';
        item.innerHTML = `<span class="font-medium flex items-center mb-1">${bestIcon}<span class="truncate">${server.name}</span></span>${statusHtml}`;
        elements.shareList.appendChild(item);
    });
    elements.sharePage.classList.remove('hidden');
    setTimeout(() => elements.sharePage.classList.remove('opacity-0'), 10);
});

elements.closeSharePage.addEventListener('click', () => {
    elements.sharePage.classList.add('opacity-0');
    setTimeout(() => elements.sharePage.classList.add('hidden'), 300);
});

async function generateScreenshot(callback) {
    try {
        const canvas = await html2canvas(elements.shareContentArea, {
            backgroundColor: document.documentElement.classList.contains('dark')
                ? '#0D1117'
                : '#F9FAFB',
            scale: 2,
        });
        callback(canvas);
    } catch (error) {
        console.error('Error creating screenshot:', error);
        showModal('<p>خطا در ایجاد تصویر. لطفاً دوباره تلاش کنید.</p>');
    }
}

elements.downloadButton.addEventListener('click', () => {
    generateScreenshot(canvas => {
        const link = document.createElement('a');
        link.download = 'dns-tester-results.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

elements.shareScreenshotButton.addEventListener('click', () => {
    generateScreenshot(canvas => {
        canvas.toBlob(async blob => {
            const file = new File([blob], 'dns-results.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'نتایج تست DNS',
                        text: 'این هم نتایج تست DNS من با ابزار DNS Tester.',
                        files: [file],
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') console.error('Share failed:', err.message);
                }
            } else {
                showModal('<p>اشتراک‌گذاری فایل در این مرورگر پشتیبانی نمی‌شود. لطفاً از گزینه دانلود استفاده کنید.</p>');
            }
        }, 'image/png');
    });
});

// --- MODALS ---
function createCustomModal(contentHtml) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 opacity-0';
    modal.innerHTML = `<div class="bg-[var(--card-bg)] backdrop-blur-xl p-5 rounded-2xl shadow-lg w-full max-w-md transition-transform duration-300 scale-95">
        ${contentHtml}
    </div>`;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.firstElementChild.classList.add('scale-100');
    }, 10);
    return modal;
}

function removeModal(modal) {
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.firstElementChild.classList.remove('scale-100');
    setTimeout(() => modal.remove(), 300);
}

function showModal(contentHtml) {
    const modal = document.createElement('div');
    modal.className =
        'fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 opacity-0';
    modal.innerHTML = `<div class="bg-[var(--card-bg)] backdrop-blur-xl p-5 rounded-2xl shadow-lg w-full max-w-md transition-transform duration-300 scale-95">
        ${contentHtml}
        <button class="modal-close-button mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg w-full text-sm">بستن</button>
    </div>`;
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.firstElementChild.classList.add('scale-100');
    }, 10);

    modal.querySelector('.modal-close-button').onclick = () => {
        modal.classList.remove('opacity-100');
        modal.firstElementChild.classList.remove('scale-100');
        setTimeout(() => modal.remove(), 300);
    };

    // منطق کپی هوشمند برای تمام دکمه‌های کپی
    modal.querySelectorAll('[data-copy-target]').forEach(copyBtn => {
        copyBtn.onclick = () => {
            const targetId = copyBtn.dataset.copyTarget;
            const targetElement = modal.querySelector(`#${targetId}`);
            if (targetElement) {
                const textToCopy = targetElement.innerText.trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = 'کپی شد!';
                    setTimeout(() => { copyBtn.innerText = originalText; }, 1500);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        };
    });
}

function showServerInfoModal(server) {
    const createInfoBlock = (title, text, id, isMultiLine = false) => {
        if (!text || text === 'N/A') return '';
        const formattedText = isMultiLine ? text.replace(/, /g, '<br>') : text;
        return `
            <div class="mt-3 pt-3 border-t border-[var(--item-border-color)]">
                <p class="font-bold text-sm mb-1">${title}:</p>
                <div class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-left p-3 rounded-md font-mono text-xs select-all" id="${id}">${formattedText}</div>
                <button data-copy-target="${id}" class="copy-button mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-xs">کپی</button>
            </div>
        `;
    };

    const urlBlock = createInfoBlock('DNS over HTTPS', server.url, `url-${server.id}`);
    const ipv4Block = createInfoBlock('IPv4', server.ipv4, `ipv4-${server.id}`, true);
    const ipv6Block = createInfoBlock('IPv6', server.ipv6, `ipv6-${server.id}`, true);
    
    const content = `
        <h3 class="text-base font-bold mb-3">${server.name}</h3>
        <div class="text-xs space-y-2 text-right mb-3">
            <p><strong>گروه:</strong> ${server.group}</p>
            <p><strong>ویژگی‌ها:</strong> ${server.features.join('، ')}</p>
            <p><strong>سیاست حریم خصوصی:</strong> ${server.privacy}</p>
        </div>
        ${urlBlock}
        ${ipv4Block}
        ${ipv6Block}
    `;
    showModal(content);
}


function showAddDnsModal() {
    const modalContent = `
        <h3 class="text-lg font-bold mb-4">افزودن DNS سفارشی</h3>
        <form id="add-dns-form" class="space-y-4">
            <div>
                <label for="custom-dns-name" class="block text-sm font-medium mb-1">نام نمایشی</label>
                <input type="text" id="custom-dns-name" required class="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="مثلا: My DNS">
            </div>
            <div>
                <label for="custom-dns-url" class="block text-sm font-medium mb-1">آدرس DNS over HTTPS</label>
                <input type="url" id="custom-dns-url" required class="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-left" placeholder="https://dns.example.com/dns-query">
            </div>
            <div class="pt-2 flex justify-end gap-3">
                 <button type="button" class="modal-cancel-button bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">انصراف</button>
                 <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">ذخیره</button>
            </div>
        </form>
    `;
    const modal = createCustomModal(modalContent);
    modal.querySelector('.modal-cancel-button').onclick = () => removeModal(modal);
    modal.querySelector('#add-dns-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('custom-dns-name').value.trim();
        const url = document.getElementById('custom-dns-url').value.trim();
        addCustomServer(name, url);
        removeModal(modal);
    };
}

// --- EVENT LISTENERS ---
elements.mainButton.addEventListener('click', checkDnsServers);
elements.searchBox.addEventListener('input', renderList);
elements.themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('dns_checker_theme', newTheme);
    applyTheme(newTheme);
});
elements.addDnsButton.addEventListener('click', showAddDnsModal);

// --- INITIALIZATION ---
function init() {
    applyTheme(localStorage.getItem('dns_checker_theme') || 'dark');
    loadServers();
    renderList();
    updateMainButton();
    fetchUserIP();
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(styleSheet);
}

init();
