// Main App Logic

let teamsData = [];
let currentStage = 0;
let currentStageData = null;
let stageDataCache = {};
let userRankings = {};
let userLockedRankings = false;
let allLeaderboardData = [];

const STORAGE_KEYS = {
    USER_RANKINGS: 'wc2026_user_rankings',
    RANKINGS_LOCKED: 'wc2026_rankings_locked',
    CURRENT_STAGE: 'wc2026_current_stage'
};

const STAGE_FILENAMES = [
    'pre-tournament',
    'group-matchday1',
    'group-matchday2',
    'group-matchday3',
    'round32',
    'round16',
    'quarterfinal',
    'semifinal',
    'final'
];

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data
        await loadTeamsData();
        await loadLeaderboardData();
        loadUserDataFromStorage();
        
        // Set initial stage from storage or default to 0
        currentStage = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_STAGE)) || 0;
        await loadStageData(currentStage);
        await preloadStageDataUpTo(currentStage);
        
        // Initialize UI
        updateAllSections();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// Load Teams Data
async function loadTeamsData() {
    try {
        const response = await fetch('data/teams.json');
        const data = await response.json();
        teamsData = data.teams;
    } catch (error) {
        console.error('Failed to load teams data:', error);
    }
}

// Load Leaderboard Data
async function loadLeaderboardData() {
    try {
        const response = await fetch('data/leaderboard.json');
        const data = await response.json();
        allLeaderboardData = data.players;
    } catch (error) {
        console.error('Failed to load leaderboard data:', error);
    }
}

function getStageFilename(stageId) {
    return `data/stage-${stageId}-${STAGE_FILENAMES[stageId]}.json`;
}

// Load Stage Data
async function loadStageData(stageId) {
    try {
        const filename = getStageFilename(stageId);
        const response = await fetch(filename);
        const data = await response.json();
        currentStageData = data;
        stageDataCache[stageId] = data;
        
        // Update stored current stage
        localStorage.setItem(STORAGE_KEYS.CURRENT_STAGE, stageId);
    } catch (error) {
        console.error(`Failed to load stage ${stageId} data:`, error);
    }
}

async function preloadStageDataUpTo(stageId) {
    const loadPromises = [];

    for (let id = 1; id <= stageId; id++) {
        if (!stageDataCache[id]) {
            const filename = getStageFilename(id);
            const promise = fetch(filename)
                .then(response => response.json())
                .then(data => {
                    stageDataCache[id] = data;
                })
                .catch(error => {
                    console.error(`Failed to preload stage ${id} data:`, error);
                });

            loadPromises.push(promise);
        }
    }

    if (loadPromises.length > 0) {
        await Promise.all(loadPromises);
    }
}

// Load User Data from LocalStorage
function loadUserDataFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_RANKINGS);
    if (stored) {
        userRankings = JSON.parse(stored);
    }
    
    const locked = localStorage.getItem(STORAGE_KEYS.RANKINGS_LOCKED);
    userLockedRankings = locked === 'true';
}

// Save User Rankings to LocalStorage
function saveUserRankingsToStorage() {
    localStorage.setItem(STORAGE_KEYS.USER_RANKINGS, JSON.stringify(userRankings));
}

// Show Section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }
}

// Calculate User Score
function calculateUserScore() {
    if (!userLockedRankings || currentStage === 0) {
        return 0;
    }
    
    let score = 0;

    for (let stageId = 1; stageId <= currentStage; stageId++) {
        const stageData = stageDataCache[stageId];
        if (!stageData || !stageData.matches) {
            continue;
        }

        stageData.matches.forEach(match => {
            if (match.winner === 'home') {
                const teamId = match.home.id;
                const ranking = userRankings[teamId];
                if (ranking) {
                    score += ranking;
                }
            }

            if (match.winner === 'away') {
                const teamId = match.away.id;
                const ranking = userRankings[teamId];
                if (ranking) {
                    score += ranking;
                }
            }
            // Draw = 0 points
        });
    }
    
    return score;
}

// Update All UI Sections
function updateAllSections() {
    updateAppLayout();
    updateHomeSection();
    updateRankingsSection();
    updateGroupsSection();
    updateKnockoutSection();
}

function updateAppLayout() {
    const isPreTournament = currentStage === 0;

    if (isPreTournament) {
        showSection('rankings-section');
    } else {
        showSection('home-section');
    }
}

// Update Home Section
function updateHomeSection() {
    const isPreTournament = currentStage === 0;
    const dashboardTitle = document.getElementById('dashboard-title');
    const homeScoreCard = document.getElementById('home-score-card');
    const activePhaseTitle = document.getElementById('active-phase-title');
    const activePhaseContainer = document.getElementById('active-phase-container');

    // Update current stage
    const stageNames = [
        'Pre-Tournament',
        'Group Stage - Matchday 1',
        'Group Stage - Matchday 2',
        'Group Stage - Matchday 3',
        'Round of 32',
        'Round of 16',
        'Quarterfinal',
        'Semifinal',
        'Final'
    ];
    
    const currentStageName = stageNames[currentStage] || 'Unknown';
    document.getElementById('currentStage').textContent = currentStageName;

    if (dashboardTitle) {
        dashboardTitle.textContent = isPreTournament ? '2026 FIFA World Cup' : 'Contest Dashboard';
    }
    
    // Update user score
    const score = calculateUserScore();
    document.getElementById('userScore').textContent = score;
    const userScoreWidget = document.getElementById('userScoreWidget');
    if (userScoreWidget) {
        userScoreWidget.textContent = score;
    }

    if (homeScoreCard) {
        homeScoreCard.classList.toggle('hidden', isPreTournament);
    }

    if (isPreTournament) {
        if (activePhaseContainer) {
            activePhaseContainer.innerHTML = '';
        }
        return;
    }

    if (activePhaseTitle) {
        activePhaseTitle.textContent = currentStage <= 3 ? 'Group Stage' : 'Knockout Stage';
    }

    renderActivePhase(activePhaseContainer);
}

function renderActivePhase(container) {
    if (!container) return;

    container.innerHTML = '';
    container.className = 'active-phase-grid';

    if (currentStage <= 3) {
        container.classList.add('groups-grid');
        container.classList.remove('knockout-grid');
        if (!currentStageData || !currentStageData.groupStandings) {
            container.innerHTML = '<p class="text-gray-400">No group data available for this stage.</p>';
            return;
        }

        Object.entries(currentStageData.groupStandings).forEach(([groupName, standings]) => {
            container.appendChild(createGroupCard(groupName, standings));
        });
        return;
    }

    container.classList.add('knockout-grid');
    container.classList.remove('groups-grid');

    if (!currentStageData || !currentStageData.matches || currentStageData.matches.length === 0) {
        container.innerHTML = '<p class="text-gray-400">No knockout matches available for this stage.</p>';
        return;
    }

    container.classList.toggle('single-match', currentStageData.matches.length === 1);

    currentStageData.matches.forEach((match, index) => {
        container.appendChild(createMatchCard(match, index));
    });
}

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Reserved for future page-level interactions.
});

// Export functions for other modules
window.appState = {
    get teamsData() {
        return teamsData;
    },
    get currentStage() {
        return currentStage;
    },
    get currentStageData() {
        return currentStageData;
    },
    get userRankings() {
        return userRankings;
    },
    get userLockedRankings() {
        return userLockedRankings;
    },
    get allLeaderboardData() {
        return allLeaderboardData;
    },
    STORAGE_KEYS,
    setCurrentStage: async (stageId) => {
        currentStage = stageId;
        await loadStageData(stageId);
        await preloadStageDataUpTo(stageId);
        updateAllSections();
    },
    setUserRankings: (rankings) => {
        userRankings = rankings;
        saveUserRankingsToStorage();
    },
    lockRankings: () => {
        userLockedRankings = true;
        localStorage.setItem(STORAGE_KEYS.RANKINGS_LOCKED, 'true');
    },
    calculateUserScore
};
