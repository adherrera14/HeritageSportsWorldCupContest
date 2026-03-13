// Ranking System - Direct Ranking Assignment (1-48)

let userRankingAssignments = {}; // { teamId: rankingValue }
let activePickerTeamId = null;

const RANK_MIN = 1;
const RANK_MAX = 48;

// Initialize Rankings Section
function updateRankingsSection() {
    const section = document.getElementById('rankings-section');
    
    // Check if rankings are locked
    if (window.appState.userLockedRankings) {
        displayLockedRankings();
        return;
    }
    
    // Load existing user rankings if any
    loadUserRankingAssignments();
    
    // Build ranking interface
    section.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Assign Team Rankings</h2>
        <div class="bg-blue-900 text-blue-100 p-4 rounded mb-4">
            <p class="text-sm">Assign each team a ranking from 48 (best) to 1 (worst). Use each number only once.</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 class="font-bold text-lg">Teams by Group</h3>
            <div class="flex flex-col items-start sm:items-end gap-2">
                <div id="rankings-status-text" class="text-sm text-yellow-500">🎯 0/48 teams ranked</div>
                <p class="text-xs text-gray-400">Tap any team row to select a rank from available values.</p>
            </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button id="randomize-rankings-btn" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg border border-indigo-500">
                Randomize Rankings (1-48)
            </button>
            <button id="clear-rankings-btn" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg border border-gray-600">
                Clear All Rankings
            </button>
        </div>
        <div id="ranking-input-container" class="ranking-groups-grid mb-6"></div>
        <button id="submit-rankings-btn" class="w-full bg-gray-600 text-gray-400 font-bold py-3 rounded-lg cursor-not-allowed" disabled>
            Submit Rankings (0/48 assigned)
        </button>
        <div id="rank-picker-modal" class="rank-picker-modal hidden" aria-hidden="true">
            <div class="rank-picker-sheet">
                <div class="rank-picker-sheet-header">
                    <div>
                        <p class="rank-picker-kicker text-xs uppercase tracking-wide text-gray-400">Quick Rank Picker</p>
                        <h3 id="rank-picker-team-name" class="rank-picker-title text-xl font-bold text-white"></h3>
                    </div>
                    <button id="close-rank-picker-btn" class="rank-picker-close-btn" type="button" aria-label="Close rank picker">×</button>
                </div>
                <p class="rank-picker-help-text text-sm text-gray-300 mb-4">Tap an available rank to assign it. Used values are disabled.</p>
                <div class="rank-picker-meta" aria-live="polite">
                    <span id="rank-picker-selected-chip" class="rank-picker-chip rank-picker-chip-selected">Selected: None</span>
                    <span id="rank-picker-available-chip" class="rank-picker-chip">Available: 48</span>
                </div>
                <div id="rank-picker-options" class="rank-picker-options"></div>
                <div class="rank-picker-actions">
                    <button id="clear-picked-rank-btn" class="rank-picker-secondary-btn" type="button">Clear Team Rank</button>
                    <button id="done-rank-picker-btn" class="rank-picker-primary-btn" type="button">Done</button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('ranking-input-container');
    
    // Group teams by their tournament group
    const teamsByGroup = {};
    window.appState.teamsData.forEach(team => {
        if (!teamsByGroup[team.group]) {
            teamsByGroup[team.group] = [];
        }
        teamsByGroup[team.group].push(team);
    });
    
    // Create group sections
    Object.keys(teamsByGroup).sort().forEach(groupLetter => {
        const groupContainer = createGroupRankingSection(groupLetter, teamsByGroup[groupLetter]);
        container.appendChild(groupContainer);
    });
    
    // Setup submit button
    const submitBtn = document.getElementById('submit-rankings-btn');
    submitBtn.addEventListener('click', submitRankings);

    const clearBtn = document.getElementById('clear-rankings-btn');
    clearBtn.addEventListener('click', clearAllRankings);

    const randomizeBtn = document.getElementById('randomize-rankings-btn');
    randomizeBtn.addEventListener('click', randomizeAllRankings);

    // Update button status
    updateSubmitButtonStatus();
    
    // Add row listeners
    setupRankingInputListeners();
    setupRankPickerModalListeners();
}

// Create Group Ranking Section
function createGroupRankingSection(groupLetter, teams) {
    const groupContainer = document.createElement('div');
    groupContainer.className = 'bg-gray-800 rounded-lg p-4 border border-gray-700 ranking-group-card';
    
    const groupHeader = document.createElement('h3');
    groupHeader.className = 'text-lg font-bold text-yellow-500 mb-3';
    groupHeader.textContent = `Group ${groupLetter}`;
    groupContainer.appendChild(groupHeader);
    
    const groupTable = document.createElement('div');
    groupTable.className = 'space-y-2';
    
    // Create ranking row for each team
    teams.forEach(team => {
        const row = createRankingInputRow(team);
        groupTable.appendChild(row);
    });
    
    groupContainer.appendChild(groupTable);
    return groupContainer;
}

// Create Ranking Input Row
function createRankingInputRow(team) {
    const row = document.createElement('div');
    row.className = 'ranking-row flex items-center gap-3 bg-gray-700 p-3 rounded border border-gray-600';
    row.setAttribute('data-team-id', team.id);
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    
    // Team flag and name
    const teamInfo = document.createElement('div');
    teamInfo.className = 'flex-1 min-w-0 flex items-center gap-2';
    teamInfo.innerHTML = `
        <span class="text-2xl">${team.flag}</span>
        <span class="font-semibold team-name-text">${String(team.name || '').toUpperCase()}</span>
    `;
    
    const rankDisplay = document.createElement('div');
    rankDisplay.className = 'ranking-row-value';
    rankDisplay.innerHTML = `
        <span class="ranking-row-rank" data-team-rank="${team.id}">--</span>
        <span class="ranking-row-hint ranking-row-hint-pick">
            <span class="ranking-row-hint-icon" aria-hidden="true">
                <svg class="ranking-row-hint-svg ranking-row-hint-svg-pick" viewBox="0 0 12 12" focusable="false" aria-hidden="true">
                    <path d="M4 2 L8 6 L4 10" />
                </svg>
                <svg class="ranking-row-hint-svg ranking-row-hint-svg-edit" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                    <path d="M3 11.5 L3.8 8.8 L10.6 2 L13.2 4.6 L6.4 11.4 Z" />
                    <path d="M9.8 2.8 L12.4 5.4" />
                </svg>
            </span>
            <span class="ranking-row-hint-label">Pick</span>
        </span>
    `;
    
    row.appendChild(teamInfo);
    row.appendChild(rankDisplay);

    const assignedValue = userRankingAssignments[team.id] || null;
    const rowLabelValue = assignedValue ? `Current rank ${assignedValue}` : 'No rank assigned';
    row.setAttribute('aria-label', `${team.name}. ${rowLabelValue}. Activate to pick a rank.`);
    setRankingRowValueState(row, assignedValue, false);
    
    return row;
}

// Setup Ranking Input Listeners
function setupRankingInputListeners() {
    const rows = document.querySelectorAll('.ranking-row');
    rows.forEach(row => {
        row.addEventListener('click', handleRankingRowClick);
        row.addEventListener('keydown', handleRankingRowKeyDown);
    });
}

function handleRankingRowKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') {
        return;
    }

    e.preventDefault();
    const teamId = e.currentTarget.getAttribute('data-team-id');
    openRankPicker(teamId);
}

function setupRankPickerModalListeners() {
    const modal = document.getElementById('rank-picker-modal');
    const closeBtn = document.getElementById('close-rank-picker-btn');
    const doneBtn = document.getElementById('done-rank-picker-btn');
    const clearBtn = document.getElementById('clear-picked-rank-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeRankPicker);
    }

    if (doneBtn) {
        doneBtn.addEventListener('click', closeRankPicker);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearActivePickerTeamRank);
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeRankPicker();
            }
        });
    }
}

function handleRankingRowClick(e) {
    const teamId = e.currentTarget.getAttribute('data-team-id');
    openRankPicker(teamId);
}

function openRankPicker(teamId) {
    activePickerTeamId = teamId;

    const team = (window.appState.teamsData || []).find(item => item.id === teamId);
    const modal = document.getElementById('rank-picker-modal');
    const teamName = document.getElementById('rank-picker-team-name');

    if (!modal || !teamName || !team) {
        return;
    }

    teamName.textContent = `${team.flag} ${String(team.name || '').toUpperCase()}`;
    renderRankPickerOptions(teamId);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('rank-picker-open');
}

function closeRankPicker() {
    activePickerTeamId = null;

    const modal = document.getElementById('rank-picker-modal');
    if (!modal) {
        return;
    }

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('rank-picker-open');
}

function renderRankPickerOptions(teamId) {
    const optionsContainer = document.getElementById('rank-picker-options');
    const selectedChip = document.getElementById('rank-picker-selected-chip');
    const availableChip = document.getElementById('rank-picker-available-chip');
    if (!optionsContainer) {
        return;
    }

    const currentValue = userRankingAssignments[teamId] || null;
    const usedByOtherTeams = new Set(
        Object.entries(userRankingAssignments)
            .filter(([assignedTeamId]) => assignedTeamId !== teamId)
            .map(([, value]) => value)
    );

    if (selectedChip) {
        selectedChip.textContent = currentValue ? `Selected: ${currentValue}` : 'Selected: None';
        selectedChip.classList.toggle('rank-picker-chip-empty', !currentValue);
    }

    if (availableChip) {
        availableChip.textContent = `Available: ${RANK_MAX - usedByOtherTeams.size}`;
    }

    optionsContainer.innerHTML = '';

    for (let rank = RANK_MAX; rank >= RANK_MIN; rank--) {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'rank-picker-option';
        option.textContent = String(rank);
        option.setAttribute('data-rank-value', String(rank));

        const isCurrentValue = currentValue === rank;
        const isUsed = usedByOtherTeams.has(rank);

        if (isCurrentValue) {
            option.classList.add('rank-picker-option-current');
        }

        if (isUsed) {
            option.disabled = true;
            option.classList.add('rank-picker-option-disabled');
        } else {
            option.addEventListener('click', () => assignRankFromPicker(teamId, rank));
        }

        optionsContainer.appendChild(option);
    }
}

function assignRankFromPicker(teamId, rank) {
    userRankingAssignments[teamId] = rank;
    syncInputValue(teamId, rank);
    updateSubmitButtonStatus();
    renderRankPickerOptions(teamId);
}

function clearActivePickerTeamRank() {
    if (!activePickerTeamId) {
        return;
    }

    delete userRankingAssignments[activePickerTeamId];
    syncInputValue(activePickerTeamId, '');
    updateSubmitButtonStatus();
    renderRankPickerOptions(activePickerTeamId);
}

function syncInputValue(teamId, value) {
    const row = document.querySelector(`.ranking-row[data-team-id="${teamId}"]`);
    if (!row) {
        return;
    }

    setRankingRowValueState(row, value === '' ? null : value, false);
}

function clearAllRankings() {
    userRankingAssignments = {};
    updateRankingsSection();
}

function randomizeAllRankings() {
    const hasExistingAssignments = Object.keys(userRankingAssignments).length > 0;
    if (hasExistingAssignments) {
        const confirmed = window.confirm('This will replace your current rankings with a random 1-48 assignment. Continue?');
        if (!confirmed) {
            return;
        }
    }

    const teamIds = (window.appState.teamsData || []).map(team => team.id);
    const randomValues = [];

    for (let value = RANK_MIN; value <= RANK_MAX; value++) {
        randomValues.push(value);
    }

    for (let i = randomValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = randomValues[i];
        randomValues[i] = randomValues[j];
        randomValues[j] = temp;
    }

    const randomizedAssignments = {};
    teamIds.forEach((teamId, index) => {
        randomizedAssignments[teamId] = randomValues[index];
    });

    userRankingAssignments = randomizedAssignments;

    updateSubmitButtonStatus();
}

// Load User Ranking Assignments from Storage
function loadUserRankingAssignments() {
    const stored = localStorage.getItem(window.appState.STORAGE_KEYS?.USER_RANKINGS || 'wc2026_user_rankings');
    if (stored) {
        userRankingAssignments = JSON.parse(stored);
    }
}

// Update Submit Button Status
function updateSubmitButtonStatus() {
    const submitBtn = document.getElementById('submit-rankings-btn');
    const assignedCount = Object.keys(userRankingAssignments).length;
    const totalTeams = RANK_MAX;
    const duplicateCount = getDuplicateCount();
    
    const statusText = document.getElementById('rankings-status-text');
    if (statusText) {
        if (duplicateCount > 0) {
            statusText.textContent = `⚠️ ${assignedCount}/${totalTeams} teams ranked • ${duplicateCount} duplicate value${duplicateCount > 1 ? 's' : ''}`;
        } else {
            statusText.textContent = `🎯 ${assignedCount}/${totalTeams} teams ranked`;
        }
    }

    updateDuplicateIndicators();
    
    if (assignedCount === totalTeams && isValidRankingSet()) {
        submitBtn.disabled = false;
        submitBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 cursor-pointer';
        submitBtn.textContent = '✓ Submit Rankings (48/48 assigned)';
    } else {
        submitBtn.disabled = true;
        submitBtn.className = 'w-full bg-gray-600 text-gray-400 font-bold py-3 rounded-lg mt-4 cursor-not-allowed';
        submitBtn.textContent = `Submit Rankings (${assignedCount}/48 assigned)`;
    }
}

// Check if ranking set is valid (all 1-48 used exactly once)
function isValidRankingSet() {
    const values = Object.values(userRankingAssignments).sort((a, b) => a - b);
    
    // Check if we have exactly 48 values
    if (values.length !== RANK_MAX) return false;
    
    // Check if values are 1-48 with no duplicates
    for (let i = 0; i < RANK_MAX; i++) {
        if (values[i] !== i + 1) return false;
    }
    
    return true;
}

function getDuplicateCount() {
    const counts = {};
    Object.values(userRankingAssignments).forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
    });

    let duplicates = 0;
    Object.values(counts).forEach(count => {
        if (count > 1) {
            duplicates += count - 1;
        }
    });

    return duplicates;
}

function updateDuplicateIndicators() {
    const valueCounts = {};
    Object.values(userRankingAssignments).forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    const rows = document.querySelectorAll('.ranking-row');
    rows.forEach(row => {
        const teamId = row.getAttribute('data-team-id');
        const value = userRankingAssignments[teamId];
        const isDuplicate = value && valueCounts[value] > 1;

        setRankingRowValueState(row, value || null, isDuplicate);
    });
}

function setRankingRowValueState(row, value, isDuplicate) {
    if (!row) {
        return;
    }

    const rankBadge = row.querySelector('.ranking-row-rank');
    const hint = row.querySelector('.ranking-row-hint');
    const hintLabel = row.querySelector('.ranking-row-hint-label');
    const hasValue = Number.isInteger(value);
    const teamName = row.querySelector('.team-name-text')?.textContent || 'Team';

    if (rankBadge) {
        rankBadge.textContent = hasValue ? String(value) : '--';
        rankBadge.classList.toggle('ranking-row-rank-assigned', hasValue && !isDuplicate);
        rankBadge.classList.toggle('ranking-row-rank-empty', !hasValue);
        rankBadge.classList.toggle('ranking-row-rank-duplicate', !!isDuplicate);
    }

    if (hint && hintLabel) {
        hintLabel.textContent = hasValue ? 'Edit' : 'Pick';
        hint.classList.toggle('ranking-row-hint-edit', hasValue);
        hint.classList.toggle('ranking-row-hint-pick', !hasValue);
    }

    row.setAttribute(
        'aria-label',
        `${teamName}. ${hasValue ? `Current rank ${value}` : 'No rank assigned'}. Activate to ${hasValue ? 'edit' : 'pick'} rank.`
    );

    row.classList.toggle('ranking-row-duplicate', !!isDuplicate);
}

// Submit Rankings
function submitRankings() {
    if (!isValidRankingSet()) {
        showError('Please assign all 48 unique rankings (1-48) to teams');
        return;
    }
    
    // Save rankings
    window.appState.setUserRankings(userRankingAssignments);
    window.appState.lockRankings();
    
    // Update UI
    updateRankingsSection();
}

// Display Locked Rankings
function displayLockedRankings() {
    const section = document.getElementById('rankings-section');
    
    section.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Your Rankings Locked ✓</h2>
        <div class="bg-green-900 text-green-100 p-4 rounded mb-4">
            <p class="font-bold mb-2">✓ Your rankings are locked in</p>
            <p class="text-sm">Points will be calculated as teams win matches. Good luck!</p>
        </div>
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 class="font-bold mb-4">Your Full Rankings (48 Teams)</h3>
            <div id="locked-rankings-display"></div>
        </div>
    `;
    
    displayLockedRankingsTable();
}

// Display Locked Rankings Cards
function displayLockedRankingsTable() {
    const display = document.getElementById('locked-rankings-display');
    
    // Sort by ranking value descending
    const sorted = Object.entries(window.appState.userRankings)
        .sort((a, b) => b[1] - a[1]);
    
    const html = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            ${sorted.map(([teamId, points], idx) => {
                const team = window.appState.teamsData.find(t => t.id === teamId);
                const teamName = team ? team.name.toUpperCase() : teamId;
                const teamFlag = team ? team.flag : '🏳️';

                return `
                    <div class="bg-gray-700/70 border border-gray-600 rounded-lg p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-start gap-3 min-w-0">
                                <span class="text-3xl leading-none">${teamFlag}</span>
                                <div class="min-w-0">
                                    <p class="font-bold text-sm sm:text-base tracking-wide break-words">${teamName}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-gray-400">POINTS</p>
                                <p class="text-xl font-extrabold text-yellow-500 leading-none">${points}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    display.innerHTML = html;
}

// Show Error Message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg font-bold z-50';
    errorDiv.textContent = '❌ ' + message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
