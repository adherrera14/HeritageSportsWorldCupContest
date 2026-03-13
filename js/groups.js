// Groups Stage Interface

function updateGroupsSection() {
    const isReviewMode = window.appState.currentStage > 3;

    // During knockout stages use the final group stage (stage 3) data
    const groupData = isReviewMode
        ? window.appState.stageDataCache[3]
        : window.appState.currentStageData;

    // Update section title
    const titleEl = document.getElementById('groups-section-title');
    if (titleEl) {
        titleEl.textContent = isReviewMode ? 'Final Group Stage Results' : 'Group Stage Standings';
    }

    // Show back button only in review mode
    const backBtn = document.getElementById('groups-back-btn');
    if (backBtn) {
        backBtn.classList.toggle('hidden', !isReviewMode);
    }

    const groupsContainer = document.getElementById('groups-container');
    if (!groupData || !groupData.groupStandings) {
        groupsContainer.innerHTML = '<p class="text-gray-400">No group data available.</p>';
        return;
    }

    groupsContainer.innerHTML = '';
    groupsContainer.className = 'active-phase-grid groups-grid';

    const groups = groupData.groupStandings;

    // Display each group
    Object.entries(groups).forEach(([groupName, standings]) => {
        const groupCard = createGroupCard(groupName, standings);
        groupsContainer.appendChild(groupCard);
    });
}

function getGroupTeamDisplayNameWithRank(teamId, teamName) {
    const uppercaseName = String(teamName || '').toUpperCase();
    const shouldShowRank = window.appState.currentStage > 0;
    if (!shouldShowRank) {
        return uppercaseName;
    }

    const rank = getAssignedRankForTeam(teamId, teamName);
    if (!rank) {
        return uppercaseName;
    }

    return `${uppercaseName} <span class="text-highlight team-rank-points">(${rank})</span>`;
}

function resolveTeamMeta(team) {
    const teamId = team.teamId || team.id || null;
    const fallbackTeam = teamId
        ? (window.appState.teamsData || []).find(item => item.id === teamId)
        : null;

    const teamName = team.name || fallbackTeam?.name || 'Unknown Team';
    const teamFlag = team.flag || fallbackTeam?.flag || '🏳️';

    return { teamId, teamName, teamFlag };
}

function getAssignedRankForTeam(teamId, teamName) {
    const NAME_ALIASES = {
        'United States': 'USA',
        'South Korea': 'Korea Republic',
        'Romania': 'Romania'
    };

    let rank = teamId ? window.appState.userRankings?.[teamId] : undefined;

    if (!rank && teamName) {
        const matchedTeam = (window.appState.teamsData || []).find(item => item.name === teamName);
        if (matchedTeam) {
            rank = window.appState.userRankings?.[matchedTeam.id];
        }
    }

    if (!rank && teamName && NAME_ALIASES[teamName]) {
        const aliasedTeam = (window.appState.teamsData || []).find(item => item.name === NAME_ALIASES[teamName]);
        if (aliasedTeam) {
            rank = window.appState.userRankings?.[aliasedTeam.id];
        }
    }

    return rank || 0;
}

// Create Group Card
function createGroupCard(groupName, standings) {
    const container = document.createElement('div');
    container.className = 'group-card card';

    const header = document.createElement('div');
    header.className = 'group-card-header';

    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = `Group ${groupName}`;

    const totalPointsBox = document.createElement('div');
    totalPointsBox.className = 'group-total-points';
    totalPointsBox.innerHTML = `
        <span class="group-total-label">Points:</span>
        <span class="group-total-value">0</span>
    `;

    header.appendChild(title);
    header.appendChild(totalPointsBox);
    
    const table = document.createElement('table');
    table.className = 'standings-table';
    
    // Table Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Team</th>
            <th class="stat-col-wins" style="width: 40px; text-align: center;">W</th>
            <th class="stat-col-muted" style="width: 40px; text-align: center;">D</th>
            <th class="stat-col-muted" style="width: 40px; text-align: center;">L</th>
            <th class="points-col" style="width: 70px; text-align: right;">Contest</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table Body
    const tbody = document.createElement('tbody');
    let groupContestTotal = 0;
    standings.forEach((team) => {
        const { teamId, teamName, teamFlag } = resolveTeamMeta(team);
        const assignedRank = getAssignedRankForTeam(teamId, teamName);
        const contestPoints = (team.wins || 0) * assignedRank;
        groupContestTotal += contestPoints;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="team-name">
                    <span class="team-flag-large">${teamFlag}</span>
                    <span class="team-name-text">${getGroupTeamDisplayNameWithRank(teamId, teamName)}</span>
                </div>
            </td>
            <td class="stat-col-wins" style="text-align: center;">${team.wins}</td>
            <td class="stat-col-muted" style="text-align: center;">${team.draws}</td>
            <td class="stat-col-muted" style="text-align: center;">${team.losses}</td>
            <td style="text-align: right; color: rgb(212, 185, 97); font-weight: bold;">${contestPoints}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    const totalValue = totalPointsBox.querySelector('.group-total-value');
    if (totalValue) {
        totalValue.textContent = String(groupContestTotal);
    }
    
    container.appendChild(header);
    container.appendChild(table);
    
    return container;
}

// Export standings for scoring calculation
function getTeamStandingInGroup(teamId, groupLetter) {
    if (!window.appState.currentStageData || !window.appState.currentStageData.groupStandings) {
        return null;
    }
    
    const groupStandings = window.appState.currentStageData.groupStandings[groupLetter];
    if (!groupStandings) return null;
    
    return groupStandings.find(team => team.teamId === teamId);
}
