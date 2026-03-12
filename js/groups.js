// Groups Stage Interface

function updateGroupsSection() {
    const section = document.getElementById('groups-section');
    
    if (!window.appState.currentStageData || !window.appState.currentStageData.groupStandings) {
        section.innerHTML = '<p class="text-gray-400">No group data available for this stage.</p>';
        return;
    }
    
    const groupsContainer = document.getElementById('groups-container');
    groupsContainer.innerHTML = '';
    groupsContainer.className = 'active-phase-grid groups-grid';
    
    const groups = window.appState.currentStageData.groupStandings;
    
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
    
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = `Group ${groupName}`;
    
    const table = document.createElement('table');
    table.className = 'standings-table';
    
    // Table Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Team</th>
            <th style="width: 40px; text-align: center;">W</th>
            <th style="width: 40px; text-align: center;">D</th>
            <th style="width: 40px; text-align: center;">L</th>
            <th class="points-col" style="width: 70px; text-align: right;">Contest</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table Body
    const tbody = document.createElement('tbody');
    standings.forEach((team) => {
        const { teamId, teamName, teamFlag } = resolveTeamMeta(team);
        const assignedRank = getAssignedRankForTeam(teamId, teamName);
        const contestPoints = (team.wins || 0) * assignedRank;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="team-name">
                    <span class="team-flag-large">${teamFlag}</span>
                    <span class="team-name-text">${getGroupTeamDisplayNameWithRank(teamId, teamName)}</span>
                </div>
            </td>
            <td style="text-align: center;">${team.wins}</td>
            <td style="text-align: center;">${team.draws}</td>
            <td style="text-align: center;">${team.losses}</td>
            <td style="text-align: right; color: rgb(212, 185, 97); font-weight: bold;">${contestPoints}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    container.appendChild(title);
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
