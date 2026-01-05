// --- STATE MANAGEMENT ---
let isLoggedIn = false;
let currentTool = null;

// --- INITIALIZATION ---
window.onload = function() {
    checkLoginStatus();
};

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (user && new Date(user.expiry) > new Date()) {
        isLoggedIn = true;
        document.getElementById('navBtn').innerText = "Dashboard";
        document.getElementById('navBtn').onclick = () => showSection('dashboard');
        document.getElementById('userPlanDisplay').innerText = user.plan.split(' ')[0]; // Show Plan Name
    } else {
        localStorage.removeItem('proToolsUser'); // Clear expired data
    }
}

// --- NAVIGATION ---
function showSection(section) {
    const homeDiv = document.getElementById('home-section');
    const dashDiv = document.getElementById('dashboard-section');

    if (section === 'dashboard') {
        if (!isLoggedIn) {
            alert("Please login with a valid key first!");
            scrollToPricing();
            return;
        }
        homeDiv.classList.add('hidden');
        dashDiv.classList.remove('hidden');
    } else {
        homeDiv.classList.remove('hidden');
        dashDiv.classList.add('hidden');
    }
}

function scrollToPricing() {
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

// --- LOGIN / VALIDATION LOGIC ---
function validateCode() {
    const input = document.getElementById('accessCodeInput');
    const msg = document.getElementById('loginMsg');
    const code = input.value.trim().toUpperCase();

    msg.className = "mt-3 text-xs text-yellow-500";
    msg.innerText = "Verifying with server...";

    setTimeout(() => {
        let days = 0;
        let plan = "";

        // PREFIX CHECKING LOGIC
        if (code.startsWith('VIP')) { days = 365; plan = "VIP Legend"; }
        else if (code.startsWith('MTH')) { days = 30; plan = "Monthly Elite"; }
        else if (code.startsWith('STD')) { days = 7; plan = "Starter Trial"; }
        else {
            msg.className = "mt-3 text-xs text-red-500";
            msg.innerText = "❌ Invalid or Expired Code";
            return;
        }

        // SAVE TO LOCAL STORAGE
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        
        const userData = {
            code: code,
            plan: plan,
            expiry: expiryDate.toISOString()
        };
        localStorage.setItem('proToolsUser', JSON.stringify(userData));

        msg.className = "mt-3 text-xs text-green-400";
        msg.innerText = "✅ Access Granted! Redirecting...";
        
        isLoggedIn = true;
        setTimeout(() => showSection('dashboard'), 1500);

    }, 1000);
}

function logout() {
    localStorage.removeItem('proToolsUser');
    location.reload();
}

// --- DASHBOARD TOOL LOGIC (Visual Only for now) ---
function loadTool(toolId) {
    currentTool = toolId;
    const consoleDiv = document.getElementById('consoleOutput');
    const title = document.getElementById('toolTitle');
    
    // Reset Active Button Style
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('text-gray-400');
    });
    event.currentTarget.classList.add('bg-purple-600', 'text-white');
    event.currentTarget.classList.remove('text-gray-400');

    // Update UI
    if (toolId === 'ua') {
        title.innerHTML = '<span class="text-purple-400">Tool:</span> User Agent Generator';
        consoleDiv.innerHTML = '<p class="text-gray-500">// Ready to generate User Agents...</p>';
    } else if (toolId === 'email') {
        title.innerHTML = '<span class="text-purple-400">Tool:</span> Bulk Email Generator';
        consoleDiv.innerHTML = '<p class="text-gray-500">// Ready to generate Emails...</p>';
    }
    // Add other tools...
}

function generateData() {
    const consoleDiv = document.getElementById('consoleOutput');
    
    if (!currentTool) {
        alert("Select a tool from sidebar first!");
        return;
    }

    consoleDiv.innerHTML += `<p class="text-yellow-500">> Generating data packet...</p>`;
    
    setTimeout(() => {
        let data = "";
        if (currentTool === 'ua') {
            data = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        } else if (currentTool === 'email') {
            data = `user.name${Math.floor(Math.random()*999)}@gmail.com`;
        }
        
        consoleDiv.innerHTML += `<p class="text-green-400">> [SUCCESS]: ${data}</p>`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight; // Auto scroll to bottom
    }, 800);
}

// --- ADMIN PANEL SECRETS ---
function openAdmin() {
    const password = prompt("Enter Admin Password:");
    if (password === "admin123") { // পাসওয়ার্ড এখানে চেঞ্জ করবেন
        document.getElementById('admin-panel').classList.remove('hidden');
    } else {
        alert("Access Denied!");
    }
}

function closeAdmin() {
    document.getElementById('admin-panel').classList.add('hidden');
}

function generateAdminCode() {
    const duration = document.getElementById('adminDuration').value;
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const finalCode = `${duration}-${randomPart}`;
    
    const out = document.getElementById('adminOutput');
    out.classList.remove('hidden');
    out.innerText = finalCode;
}