// script.js

// --- THEME TOGGLING ---
const themeToggle = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');

// Function to set the theme
const setTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'light');
    }
};

// Check for saved theme in localStorage or user's preference
const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
});


// --- GMAIL GENERATOR LOGIC ---
let allEmails = [];
let currentFilter = 'all';

function toggleOptions() {
    const panel = document.getElementById('optionsPanel');
    panel.classList.toggle('expanded');
}

function generateEmails() {
    const emailInput = document.getElementById('email');
    const generateBtn = document.getElementById('generateBtn');
    const email = emailInput.value.trim();

    if (!email || !email.toLowerCase().includes('@gmail.com')) {
        showCosmicAlert('Please enter a valid Gmail address.', 'error');
        return;
    }

    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<div class="loading"></div> Generating...';
    generateBtn.disabled = true;

    // Simulate generation time
    setTimeout(() => {
        try {
            const variations = generateAdvancedVariations(email);
            allEmails = variations;
            displayResults(variations);
            updateButtonStates('all');
            showCosmicAlert(`${variations.length} email variants generated!`, 'success');
        } catch (error) {
            showCosmicAlert('An error occurred during generation.', 'error');
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }, 500);
}


function generateAdvancedVariations(email) {
    const [username, domain] = email.split('@');
    const maxVar = parseInt(document.getElementById('maxVariations').value) || 10;
    const customKeywords = document.getElementById('customKeywords').value.split(',').map(k => k.trim()).filter(k => k);

    const enableDots = document.getElementById('enableDots').checked;
    const enablePlus = document.getElementById('enablePlus').checked;
    const enableMixed = document.getElementById('enableMixed').checked;
    const enableRandom = document.getElementById('enableRandom').checked;

    let variations = [];

    if (enableDots && username.length > 1) {
        variations.push(...generateDotVariations(username, domain, maxVar));
    }
    if (enablePlus) {
        variations.push(...generatePlusAliases(username, domain, maxVar, customKeywords));
    }
    if (enableMixed && username.length > 3) {
        variations.push(...generateMixedCombinations(username, domain, maxVar));
    }
    if (enableRandom) {
        variations.push(...generateRandomPatterns(username, domain, maxVar));
    }

    // Ensure unique emails
    const uniqueEmails = [...new Set(variations.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
    return uniqueEmails.filter(v => v.email !== email);
}

function generateDotVariations(username, domain, maxVar) {
    const variations = new Set();
    const len = Math.min(username.length, 10); // Limit to avoid performance issues
    const limit = Math.min(maxVar, 50);

    for (let i = 1; i < (1 << (len - 1)); i++) {
        if (variations.size >= limit) break;
        let newUsername = username[0];
        for (let j = 0; j < len - 1; j++) {
            newUsername += ((i >> j) & 1) ? '.' : '';
            newUsername += username[j + 1];
        }
        if (len < username.length) {
            newUsername += username.slice(len);
        }
        variations.add({
            email: `${newUsername}@${domain}`,
            category: 'dot'
        });
    }
    return Array.from(variations);
}

function generatePlusAliases(username, domain, maxVar, customKeywords) {
    const variations = [];
    const defaultKeywords = ["news", "social", "work", "promo", "test", "forums", "updates", "alerts", "backup", "files"];
    const keywords = customKeywords.length > 0 ? customKeywords : defaultKeywords;

    for (let i = 0; i < Math.min(keywords.length, maxVar); i++) {
        variations.push({
            email: `${username}+${keywords[i]}@${domain}`,
            category: 'plus'
        });
    }
    return variations;
}

function generateMixedCombinations(username, domain, maxVar) {
    const variations = [];
    const keywords = ['app', 'service', 'user'];
    const dotVariations = generateDotVariations(username, domain, 5); // get a few dot variations

    for (const dotVar of dotVariations) {
        if (variations.length >= maxVar) break;
        for (const keyword of keywords) {
            if (variations.length >= maxVar) break;
            variations.push({
                email: `${dotVar.email.split('@')[0]}+${keyword}@${domain}`,
                category: 'mixed'
            });
        }
    }
    return variations;
}

function generateRandomPatterns(username, domain, maxVar) {
    const variations = [];
    for (let i = 0; i < maxVar; i++) {
        const randomString = Math.random().toString(36).substring(2, 7);
        variations.push({
            email: `${username}+${randomString}@${domain}`,
            category: 'random'
        });
    }
    return variations;
}


function displayResults(emails) {
    const emailList = document.getElementById('emailList');
    const emailCount = document.getElementById('emailCount');
    const results = document.getElementById('results');

    if (emails.length === 0) {
        results.classList.add('hidden');
        return;
    }

    results.classList.remove('hidden');
    emailList.innerHTML = '';
    emailCount.textContent = `${emails.length} Variants`;

    emails.forEach((emailObj, index) => {
        const div = document.createElement('div');
        div.className = 'email-item';
        div.innerHTML = `
            <span class="truncate">${emailObj.email}</span>
            <button onclick="copyEmail('${emailObj.email}', this)" class="btn btn-success copy-btn">
                Copy
            </button>
        `;
        emailList.appendChild(div);
    });
}

function filterEmails(filter) {
    currentFilter = filter;
    updateButtonStates(filter);
    const filteredEmails = filter === 'all' ? allEmails : allEmails.filter(email => email.category === filter);
    displayResults(filteredEmails);
}

function updateButtonStates(activeFilter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        const filterType = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        button.classList.toggle('active', filterType === activeFilter);
    });
}

function copyEmail(email, button) {
    navigator.clipboard.writeText(email).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = 'Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 1500);
    });
}

function copyAllEmails() {
    const emailsToCopy = allEmails
        .filter(email => currentFilter === 'all' || email.category === currentFilter)
        .map(email => email.email)
        .join('\n');

    if (emailsToCopy) {
        navigator.clipboard.writeText(emailsToCopy).then(() => {
            showCosmicAlert('All visible emails copied!', 'success');
        });
    }
}

function clearResults() {
    allEmails = [];
    document.getElementById('results').classList.add('hidden');
    document.getElementById('email').value = '';
    updateButtonStates('all');
}

function showCosmicAlert(message, type = 'error') {
    const alertContainer = document.querySelector('.container') || document.body;
    const alert = document.createElement('div');
    alert.className = `fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg text-white text-sm font-medium z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    alert.textContent = message;

    // Position it relative to the container if possible
    if(alertContainer !== document.body) {
        alert.style.position = 'absolute';
    }

    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => alert.remove(), 300);
    }, 2500);
}
