// ============================================
// ⚠️ ADMIN CONFIGURATION AREA
// ============================================

const CONFIG = {
    // 1. আপনার Google Apps Script এর URL এখানে বসান (যেহেতু কাজ করছে)
    scriptURL: "https://script.google.com/macros/s/AKfycbxu23YNqJbDImYa8SFexSz-1SWKRrgkjx2xEM1Dazo-jb8t1PHosE15qkK3b3zDl7g7yA/exec", 
    // উদাহরন: "https://script.google.com/macros/s/AKfycby..../exec"

    // 2. --- LOGO SETTINGS ---
    // লোগো ছবিতে কি নামে পরিবর্তন বা আপলোড করবেন তা এখান থেকে কন্ট্রোল করুন।
    useImageLogo: false, // true দিলে ছবির লোগো দেখাবে, false দিলে লেখা
    logoImageURL: "https://i.imgur.com/your-logo.png", // আপনার লোগো ছবির ডিরেক্ট লিংক এখানে দিন

    // 3. --- COURSES IMAGES SCROLL ---
    // নতুন কোর্স যোগ করতে বা ছবি পাল্টাতে এই লিস্ট এডিট করুন।
    courses: [
        { title: "CPA Marketing", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
        { title: "Ethical Hacking", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80" },
        { title: "Advance Data Entry", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80" },
        { title: "Python Automation", image: "https://images.unsplash.com/photo-1515879433056-bfab115c18e9?w=500&q=80" },
        { title: "Email Secret Master", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=500&q=80" },
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

// --- SITE SETUP (LOGO & COURSES) ---
function setupSite() {
    // 1. Logo Setup (Dynamic Image/Text)
    const imgLogo = document.getElementById('imgLogo');
    const textLogo = document.getElementById('textLogo');
    
    if (CONFIG.useImageLogo && CONFIG.logoImageURL) {
        imgLogo.src = CONFIG.logoImageURL;
        imgLogo.classList.remove('hidden');
        textLogo.classList.add('hidden');
    } else {
        imgLogo.classList.add('hidden');
        textLogo.classList.remove('hidden');
    }

    // 2. Courses Marquee Setup
    const marquee = document.getElementById('courseMarquee');
    if(marquee) {
        // Double array to create smooth infinite loop effect
        const loopCourses = [...CONFIG.courses, ...CONFIG.courses]; 
        marquee.innerHTML = loopCourses.map(course => `
            <div class="marquee-item group relative">
                <img src="${course.image}" alt="${course.title}">
                <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 p-3 text-center">
                    <span class="font-bold text-white text-xs sm:text-sm whitespace-normal">${course.title}</span>
                </div>
            </div>
        `).join('');
    }
}

// --- LOGIN & VIEW SWITCHING LOGIC ---
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (user && user.isLoggedIn) {
        isLoggedIn = true;
        
        // 1. UI Visibility: Hide Home/Pricing, Show Dashboard
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        
        // 2. Navbar Update
        document.getElementById('menuPublic').classList.add('hidden');
        document.getElementById('menuPrivate').classList.remove('hidden');
        
        const navBtn = document.getElementById('navAuthBtn');
        navBtn.innerHTML = `<i class="ph ph-sign-outmr-1.5"></i> Logout`;
        navBtn.classList.replace('bg-white/10', 'bg-red-600');
        navBtn.classList.add('shadow-lg', 'shadow-red-900/30');
        navBtn.onclick = logout;

        // 3. Update Dashboard Info
        document.getElementById('dashUserName').innerText = user.name || "User";
        document.getElementById('dashUserPlan').innerText = user.plan || "Free";
        document.getElementById('userPlanBadge').innerText = (user.plan || "Free").toUpperCase();
        document.getElementById('userPlanBadge').classList.remove('hidden');
    }
}

function showSection(sectionId) {
    if(sectionId === 'dashboard' && isLoggedIn) {
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

// --- VIP CODE REDEEM LOGIC (Access Dashboard Option) ---
function redeemVipCode() {
    const codeInput = document.getElementById('vipCodeInput');
    const code = codeInput.value.trim();
    
    if(!code) return alert("⚠️ Please enter a valid access code!");
    
    // সিম্পল ভেরিফিকেশন লজিক (ক্যাম্পেইন অনুযায়ী)
    const vipLevel1 = ["VIP-START", "ACCESS-7DAYS"];
    const vipLevel2 = ["PRO-LEGEND", "ADMIN-GIFT-2025", "PHT-YEARLY"];

    if (vipLevel1.includes(code)) {
        updateUserPlan("Starter Pro (Activated via Code)");
        codeInput.value = "";
    } 
    else if (vipLevel2.includes(code) || code.startsWith("VIP-")) {
        updateUserPlan("VIP Legend (1 Year Access)");
        codeInput.value = "";
    } 
    else {
        alert("❌ Invalid or Expired Code! Contact support.");
    }
}

function updateUserPlan(newPlanName) {
    alert(`✅ Success! Your account has been upgraded to: ${newPlanName}.`);
    
    // 1. Update Local Storage
    const user = JSON.parse(localStorage.getItem('proToolsUser')) || {};
    user.plan = newPlanName;
    localStorage.setItem('proToolsUser', JSON.stringify(user));
    
    // 2. Update UI Instantly
    document.getElementById('dashUserPlan').innerText = newPlanName;
    document.getElementById('userPlanBadge').innerText = newPlanName.toUpperCase();
}

// --- TOOLS UTILITY LOGIC ---
function loadTool(toolId) {
    currentTool = toolId;
    const consoleDiv = document.getElementById('toolConsole');
    const title = document.getElementById('activeToolName');
    const output = document.getElementById('consoleOutput');
    
    consoleDiv.classList.remove('hidden');
    output.innerHTML = ``; // Clear output
    window.scrollTo({ top: consoleDiv.offsetTop - 100, behavior: 'smooth' });

    const titles = {
        'ua': 'User Agent Generator',
        'email': 'Bulk Email Generator',
        'validator': 'Email Validator Pro',
        'number': 'Mobile Number Generator',
        'address': 'Address Generator (US/UK)'
    };
    
    title.innerHTML = `<i class="ph ph-terminal"></i> ${titles[toolId]}`;
    output.innerHTML = `> System initialized...<br>> ${titles[toolId]} v1.0 loaded.<br>> Ready for generation...`;
}

function generateData() {
    const output = document.getElementById('consoleOutput');
    if(!currentTool) return;
    
    output.innerHTML += `<br><span class="text-yellow-400">> Request received. Processing packet...</span>`;
    output.scrollTop = output.scrollHeight; // Auto scroll
    
    setTimeout(() => {
        let res = "";
        if(currentTool==='ua') res = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
        if(currentTool==='email') res = `marketer.pro${Math.floor(Math.random()*999)}@gmail.com`;
        if(currentTool==='validator') res = `user.test@gmail.com: <span class="text-white font-bold">OK (Deliverable)</span>`;
        if(currentTool==='number') res = `+880 18${Math.floor(Math.random()*99999999)}`;
        if(currentTool==='address') res = `789, Silicon Valley, San Francisco, CA 94107`;
        
        output.innerHTML += `<br><span class="text-white font-bold">> [SUCCESS]: ${res}</span>`;
        output.scrollTop = out.scrollHeight;
    }, 700);
}

// --- AUTH & FORM HANDLING ---
function openAuthModal(planInfo = 'Free') {
    if(isLoggedIn) return;
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('selectedPlan').value = planInfo;
    
    // If clicking Buy Now, go to register tab directly
    if (planInfo !== 'Free') switchTab('register');
    else switchTab('login');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authMessage').classList.add('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const msgDiv = document.getElementById('authMessage');
    msgDiv.classList.add('hidden'); // Clear previous messages

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

    // UI Feedback
    btn.innerHTML = `<i class="ph ph-circle-notch animate-spin"></i> Please wait...`;
    btn.disabled = true;
    msgDiv.classList.add('hidden');

    const data = new URLSearchParams();
    data.append('action', action);
    for (const pair of formData) data.append(pair[0], pair[ pair[0].includes('password') || pair[0].includes('sender') ? 0 : 0] ); 
    // Fix for potential FormData issues with same names (like email)
    
    // Use actual values
    const formObj = {};
    for (const pair of formData) {
        data.set(pair[0], pair[1]);
    }

    fetch(CONFIG.scriptURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => {
        msgDiv.classList.remove('hidden');
        
        if (result.result === 'success') {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-green-400";
            msgDiv.innerText = result.message;
            
            if (action === 'login') {
                // Save to Local Storage
                const userData = { 
                    isLoggedIn: true, 
                    name: result.userData?.name, 
                    email: result.userData?.email, 
                    plan: result.userData?.plan 
                };
                localStorage.setItem('proToolsUser', JSON.stringify(userData));
                
                // Redirect/Reload to Dashboard
                setTimeout(() => { closeAuthModal(); location.reload(); }, 1000);
            } else {
                // After successful register, switch to login
                form.reset();
                setTimeout(() => { switchTab('login'); msgDiv.innerText = "✅ Payment data sent! Now please Login."; msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-green-400"; msgDiv.classList.remove('hidden'); }, 2500);
            }
        } else {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-red-400 animate-pulse";
            msgDiv.innerText = "❌ " + result.message;
        }
    })
    .catch(err => {
        msgDiv.classList.remove('hidden');
        msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-red-400";
        msgDiv.innerText = "❌ Connection Error! Check internet/Script URL.";
        console.error(err);
    })
    .finally(() => { btn.innerText = originalText; btn.disabled = false; });
}

function logout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('proToolsUser');
        location.reload();
    }
}
