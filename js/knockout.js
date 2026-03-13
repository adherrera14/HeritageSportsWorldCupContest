// Knockout Stage Interface

function updateKnockoutSection() {
    const section = document.getElementById('knockout-section');
    
    if (!window.appState.currentStageData || !window.appState.currentStageData.matches || window.appState.currentStageData.matches.length === 0) {
        section.innerHTML = '<p class="text-gray-400">No knockout matches available for this stage.</p>';
        return;
    }
    
    const knockoutContainer = document.getElementById('knockout-container');
    knockoutContainer.innerHTML = '';
    knockoutContainer.className = 'active-phase-grid knockout-grid';
    
    const matches = window.appState.currentStageData.matches;
    knockoutContainer.classList.toggle('single-match', matches.length === 1);
    
    // Display each match
    matches.forEach((match, index) => {
        const matchCard = createMatchCard(match, index);
        knockoutContainer.appendChild(matchCard);
    });
}

function getKnockoutRankForTeam(team) {
    const NAME_ALIASES = {
        'United States': 'USA',
        'South Korea': 'Korea Republic'
    };

    let rank = window.appState.userRankings?.[team.id];

    if (!rank && team.name) {
        const matchedTeam = (window.appState.teamsData || []).find(item => item.name === team.name);
        if (matchedTeam) {
            rank = window.appState.userRankings?.[matchedTeam.id];
        }
    }

    if (!rank && team.name && NAME_ALIASES[team.name]) {
        const aliasedTeam = (window.appState.teamsData || []).find(item => item.name === NAME_ALIASES[team.name]);
        if (aliasedTeam) {
            rank = window.appState.userRankings?.[aliasedTeam.id];
        }
    }

    return rank || 0;
}

function getKnockoutTeamDisplayNameWithRank(team) {
    const uppercaseName = String(team.name || '').toUpperCase();
    const shouldShowRank = window.appState.currentStage > 0;
    if (!shouldShowRank) {
        return uppercaseName;
    }

    const rank = getKnockoutRankForTeam(team);
    if (!rank) {
        return uppercaseName;
    }

    return `${uppercaseName} <span class="text-highlight team-rank-points">(${rank})</span>`;
}

// Create Match Card
function createMatchCard(match, index) {
    const container = document.createElement('div');
    container.className = 'match-card card';
    
    const teamsContainer = document.createElement('div');
    teamsContainer.className = 'match-teams';
    
    // Home Team
    const homeTeam = document.createElement('div');
    homeTeam.className = 'team-info';
    homeTeam.innerHTML = `
        <span class="team-flag-large">${match.home.flag}</span>
        <span class="flex-1">${getKnockoutTeamDisplayNameWithRank(match.home)}</span>
    `;
    
    // VS Badge
    const vsBadge = document.createElement('div');
    vsBadge.className = 'vs-badge';
    vsBadge.textContent = 'VS';
    
    // Away Team
    const awayTeam = document.createElement('div');
    awayTeam.className = 'team-info team-info-away';
    awayTeam.innerHTML = `
        <span class="flex-1 text-right">${getKnockoutTeamDisplayNameWithRank(match.away)}</span>
        <span class="team-flag-large">${match.away.flag}</span>
    `;
    
    teamsContainer.appendChild(homeTeam);
    teamsContainer.appendChild(vsBadge);
    teamsContainer.appendChild(awayTeam);
    
    // Score Section
    const scoreSection = document.createElement('div');
    scoreSection.className = 'match-score';
    
    const homeScore = document.createElement('div');
    homeScore.className = 'score-item flex-1 text-center';
    homeScore.innerHTML = `
        <div class="score-number">${match.homeScore}</div>
    `;
    
    const scoreDivider = document.createElement('div');
    scoreDivider.className = 'score-divider';
    scoreDivider.textContent = '-';
    
    const awayScore = document.createElement('div');
    awayScore.className = 'score-item flex-1 text-center';
    awayScore.innerHTML = `
        <div class="score-number">${match.awayScore}</div>
    `;
    
    scoreSection.appendChild(homeScore);
    scoreSection.appendChild(scoreDivider);
    scoreSection.appendChild(awayScore);
    
    // Result Badge
    const resultSection = document.createElement('div');
    resultSection.className = 'match-result';
    
    if (match.winner === 'home') {
        resultSection.innerHTML = `<span class="winner-badge">🏆 ${getKnockoutTeamDisplayNameWithRank(match.home)} Wins</span>`;
    } else if (match.winner === 'away') {
        resultSection.innerHTML = `<span class="winner-badge">🏆 ${getKnockoutTeamDisplayNameWithRank(match.away)} Wins</span>`;
    } else if (match.winner === 'draw') {
        resultSection.innerHTML = `<span class="draw-badge">Draw</span>`;
    }
    
    container.appendChild(teamsContainer);
    container.appendChild(scoreSection);
    container.appendChild(resultSection);
    
    return container;
}

// Export function for scoring calculation
function getMatchWinner(homeTeamId, awayTeamId) {
    if (!window.appState.currentStageData || !window.appState.currentStageData.matches) {
        return null;
    }
    
    const match = window.appState.currentStageData.matches.find(
        m => (m.home.id === homeTeamId && m.away.id === awayTeamId) ||
             (m.home.id === awayTeamId && m.away.id === homeTeamId)
    );
    
    if (!match) return null;
    
    // Return the winning team ID
    if (match.winner === 'home') return match.home.id;
    if (match.winner === 'away') return match.away.id;
    return null; // Draw
}
