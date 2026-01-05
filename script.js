// ============================================
// ⚠️ ADMIN CONFIGURATION AREA (EDIT HERE)
// ============================================

const CONFIG = {
    // 1. আপনার Google Apps Script এর URL এখানে বসান
    scriptURL: "https://script.google.com/macros/s/AKfycbywGAZvAc0buqMIThlVxtRMFXPMD_nReExgINuunDntwnvsHvE7MVslT5EFMvfU2WAY/exec",

    // 2. আপনার সাইটের লোগো লিংক (না থাকলে খালি রাখুন)
    logoURL: "", 

    // 3. কোর্স এবং ছবির লিস্ট (এখানে নতুন লিংক বসালে সাইটে অটো দেখাবে)
    courses: [
        { title: "CPA Marketing", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" },
        { title: "Ethical Hacking", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80" },
        { title: "Data Entry Pro", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" },
        { title: "Python Bot", image: "https://images.unsplash.com/photo-1515879433056-bfab115c18e9?w=400&q=80" },
        { title: "Email Marketing", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&q=80" },
        // এখানে আরও যোগ করতে পারেন...
    ]
};

// ============================================
// ⚠️ DO NOT EDIT BELOW THIS LINE
// ============================================

let isLoggedIn = false;
let currentTool = null;

window.onload = function() {
    setupSite();
    checkLoginStatus();
};

function setupSite() {
    // Set Logo
    if(CONFIG.logoURL) {
        const logoImg = document.getElementById('siteLogo');
        const textLogo = document.getElementById('textLogo');
        logoImg.src = CONFIG.logoURL;
        logoImg.classList.remove('hidden');
        textLogo.classList.add('hidden');
    }

    // Set Courses Marquee
    const marquee = document.getElementById('courseMarquee');
    // Double array to create infinite loop effect
    const loopCourses = [...CONFIG.courses, ...CONFIG.courses]; 
    
    marquee.innerHTML = loopCourses.map(course => `
        <div class="marquee-item group relative">
            <img src="${course.image}" alt="${course.title}">
            <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300">
                <span class="text-sm font-bold text-white">${course.title}</span>
            </div>
        </div>
    `).join('');
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (user && user.isLoggedIn) {
        isLoggedIn = true;
        const navBtn = document.getElementById('navLoginBtn');
        navBtn.innerText = "Dashboard";
        navBtn.onclick = () => showSection('dashboard');
        navBtn.className = "px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition text-sm font-medium";
    }
}

function showSection(section) {
    const home = document.getElementById('home-section');
    const dash = document.getElementById('dashboard-section');
    if (section === 'dashboard') {
        if (!isLoggedIn) { openAuthModal(); return; }
        home.classList.add('hidden');
        dash.classList.remove('hidden');
        if(!currentTool) loadTool('ua');
    } else {
        home.classList.remove('hidden');
        dash.classList.add('hidden');
    }
}

function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

// === AUTH & PAYMENT ===
function openAuthModal(planInfo = 'Free') {
    if(isLoggedIn) { showSection('dashboard'); return; }
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('selectedPlan').value = planInfo;
    
    if (planInfo !== 'Free') {
        switchTab('register');
        const msg = document.getElementById('authMessage');
        msg.innerText = `Buying: ${planInfo}`;
        msg.classList.remove('hidden');
        msg.className = "px-8 pb-4 text-center text-xs font-bold text-purple-400";
    } else {
        switchTab('login');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authMessage').classList.add('hidden');
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.className = "flex-1 py-4 text-sm font-bold text-white border-b-2 border-purple-500 bg-white/5";
        tabRegister.className = "flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white";
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegister.className = "flex-1 py-4 text-sm font-bold text-white border-b-2 border-purple-500 bg-white/5";
        tabLogin.className = "flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white";
    }
}

function handleAuth(event, action) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const msgDiv = document.getElementById('authMessage');
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;

    btn.innerText = "Processing...";
    btn.disabled = true;
    msgDiv.classList.add('hidden');

    const data = new URLSearchParams();
    data.append('action', action);
    for (const pair of formData) data.append(pair[0], pair[1]);

    fetch(CONFIG.scriptURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => {
        msgDiv.classList.remove('hidden');
        if (result.result === 'success') {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-green-400";
            msgDiv.innerText = result.message;
            if (action === 'login') {
                const userData = { isLoggedIn: true, name: result.userData.name, email: result.userData.email };
                localStorage.setItem('proToolsUser', JSON.stringify(userData));
                setTimeout(() => { closeAuthModal(); location.reload(); }, 1000);
            } else {
                form.reset();
                setTimeout(() => { switchTab('login'); msgDiv.innerText = "Payment Sent! Please Wait/Login."; }, 2000);
            }
        } else {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-red-400";
            msgDiv.innerText = result.message;
        }
    })
    .catch(err => {
        msgDiv.classList.remove('hidden');
        msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-red-400";
        msgDiv.innerText = "Connection Failed! Check URL.";
    })
    .finally(() => { btn.innerText = originalText; btn.disabled = false; });
}

function logout() { localStorage.removeItem('proToolsUser'); location.reload(); }

// === DASHBOARD TOOLS ===
function loadTool(toolId) {
    currentTool = toolId;
    const titles = { 'ua': 'User Agent Gen', 'email': 'Email Gen', 'mobile': 'Number Gen', 'address': 'Address Gen' };
    document.getElementById('toolTitle').innerHTML = `Tool: <span class="text-purple-400">${titles[toolId]}</span>`;
    document.getElementById('consoleOutput').innerHTML = `// Ready for ${titles[toolId]}...`;
}

function generateData() {
    const out = document.getElementById('consoleOutput');
    if(!currentTool) return alert("Select tool!");
    out.innerHTML += `<div class="text-yellow-500 mt-2">> Processing...</div>`;
    
    setTimeout(() => {
        let res = "";
        if(currentTool==='ua') res = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36";
        if(currentTool==='email') res = `user.test${Math.floor(Math.random()*999)}@gmail.com`;
        if(currentTool==='mobile') res = `017${Math.floor(Math.random()*99999999)} (Valid)`;
        if(currentTool==='address') res = `123, Park Avenue, NY 100${Math.floor(Math.random()*99)} (USA)`;
        
        out.innerHTML += `<div class="text-green-400 font-bold">> ${res}</div>`;
        out.scrollTop = out.scrollHeight;
    }, 800);
}
