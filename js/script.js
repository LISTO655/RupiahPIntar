// ==================== HAMBURGER MENU TOGGLE ====================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    dropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            dropdownMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hamburger-menu')) {
            hamburgerBtn.classList.remove('active');
            dropdownMenu.classList.remove('active');
        }
    });
}

// ==================== SMOOTH SCROLLING FOR NAVIGATION ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ==================== ACTIVE NAVIGATION HIGHLIGHT ==================== 
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ==================== CONTACT FORM SUBMISSION ==================== 
document.querySelector('.contact-form form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Mohon isi semua field!');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Email tidak valid!');
        return;
    }
    
    // Success message
    alert('Terima kasih! Pesan Anda telah kami terima. Kami akan menghubungi Anda segera.');
    this.reset();
});

// ==================== SMOOTH PAGE LOAD ANIMATION ==================== 
document.addEventListener('DOMContentLoaded', () => {
    // Add animation class to elements
    const cards = document.querySelectorAll('.material-card, .gallery-item, .stat-box');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s forwards`;
        }, index * 50);
    });
});

// ==================== ADD SCROLL ANIMATIONS ==================== 
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.material-card, .gallery-item, .about-content').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ==================== CURRENCY CONVERTER - REAL TIME ==================== 
// Supported currencies for converter
const supportedCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cny'];

// Currency metadata
const currencyMetadata = {
    'usd': { name: 'Dollar Amerika', symbol: 'USD', flag: '🇺🇸' },
    'eur': { name: 'Euro', symbol: 'EUR', flag: '🇪🇺' },
    'gbp': { name: 'Pound Inggris', symbol: 'GBP', flag: '🇬🇧' },
    'jpy': { name: 'Yen Jepang', symbol: 'JPY', flag: '🇯🇵' },
    'cny': { name: 'Yuan China', symbol: 'CNY', flag: '🇨🇳' }
};

// Store real-time rates
let realTimeRates = {};

// Initialize converter elements
const currencySelect = document.getElementById('currencySelect');
const amountInput = document.getElementById('amountInput');
const convertBtn = document.getElementById('convertBtn');
const rateDisplay = document.getElementById('rateDisplay');
const resultAmount = document.getElementById('resultAmount');
const resultRupiah = document.getElementById('resultRupiah');

// Function to format number with thousand separators
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(Math.round(num));
}

// Function to fetch real-time exchange rates
async function fetchRealTimeRates() {
    try {
        // Using free currency API - exchangerate-api.com free tier
        const currencies = supportedCurrencies.map(c => c.toUpperCase()).join(',');
        
        // Using open exchange rates or similar - we'll try multiple sources
        // First attempt with exchangerate.host (free, no key needed)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/IDR`);
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        // Extract rates for our currencies (IDR is base, we need inverse rates)
        supportedCurrencies.forEach(curr => {
            const currencyCode = curr.toUpperCase();
            if (data.rates[currencyCode]) {
                // If 1 IDR = X currency, then 1 currency = 1/X IDR
                realTimeRates[curr] = Math.round(1 / data.rates[currencyCode]);
            }
        });
        
        // Update the display with real-time rates
        updateRateDisplay();
        performConversion();
        
        return true;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Fallback to default rates if API fails
        loadFallbackRates();
        return false;
    }
}

// Fallback rates (updated as of May 2026)
function loadFallbackRates() {
    realTimeRates = {
        'usd': 16500,
        'eur': 18000,
        'gbp': 20500,
        'jpy': 105,
        'cny': 2300
    };
}

// Update rate display section
function updateRateDisplay() {
    const ratesList = document.querySelectorAll('.rate-item');
    ratesList.forEach(item => {
        const currencyName = item.querySelector('.currency-name');
        const currencyRate = item.querySelector('.currency-rate');
        
        if (currencyName && currencyRate) {
            const currencyCode = getCurrencyCodeFromName(currencyName.textContent);
            if (currencyCode && realTimeRates[currencyCode]) {
                const symbol = currencyMetadata[currencyCode].symbol;
                currencyRate.textContent = `1 ${symbol} = Rp ${formatNumber(realTimeRates[currencyCode])}`;
            }
        }
    });
}

// Helper function to extract currency code
function getCurrencyCodeFromName(text) {
    if (text.includes('Dollar')) return 'usd';
    if (text.includes('Euro')) return 'eur';
    if (text.includes('Pound')) return 'gbp';
    if (text.includes('Yen')) return 'jpy';
    if (text.includes('Yuan')) return 'cny';
    return null;
}

// Function to perform conversion
function performConversion() {
    const selectedCurrency = currencySelect.value;
    const amount = parseFloat(amountInput.value) || 0;
    
    if (!selectedCurrency || amount < 0) {
        return;
    }

    const rate = realTimeRates[selectedCurrency];
    const metadata = currencyMetadata[selectedCurrency];
    
    if (!rate) {
        rateDisplay.textContent = 'Loading...';
        return;
    }

    const result = amount * rate;

    // Update display
    rateDisplay.textContent = `1 ${metadata.symbol} = Rp ${formatNumber(rate)}`;
    resultAmount.textContent = `${amount} ${metadata.symbol}`;
    resultRupiah.textContent = `Rp ${formatNumber(result)}`;
}

// Event listeners
if (convertBtn) {
    convertBtn.addEventListener('click', performConversion);
}

if (amountInput) {
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performConversion();
        }
    });

    // Auto convert on input change
    amountInput.addEventListener('input', performConversion);
}

if (currencySelect) {
    currencySelect.addEventListener('change', performConversion);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load fallback rates first
    loadFallbackRates();
    
    // Then try to fetch real-time rates
    if (amountInput && currencySelect) {
        rateDisplay.textContent = 'Loading real-time rates...';
        fetchRealTimeRates();
        
        // Refresh rates every 5 minutes (300000ms)
        setInterval(fetchRealTimeRates, 300000);
    }
});

// ==================== MOBILE MENU TOGGLE (OPTIONAL) ==================== 
// Uncomment and use if you want a hamburger menu for mobile
/*
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}
*/

// ==================== FETCH EXCHANGE RATE ==================== 
async function fetchExchangeRate() {
    try {
        // Using exchangerate-api.com (free tier available)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/IDR');
        const data = await response.json();
        const usdRate = data.rates.USD;
        const rateDisplay = `1 IDR = ${usdRate.toFixed(6)} USD`;
        
        const element = document.getElementById('idr-usd');
        if (element) {
            element.textContent = rateDisplay;
        }
    } catch (error) {
        console.log('Tidak dapat mengambil data nilai tukar. Silakan cek koneksi internet.');
        const element = document.getElementById('idr-usd');
        if (element) {
            element.textContent = 'Gagal memuat data. Coba refresh halaman.';
        }
    }
}

// Fetch rate when page loads
document.addEventListener('DOMContentLoaded', fetchExchangeRate);

// Update every 5 minutes
setInterval(fetchExchangeRate, 5 * 60 * 1000);

console.log('Website Cinta Bangga Paham Rupiah siap digunakan!');
