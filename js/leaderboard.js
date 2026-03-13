// Leaderboard Interface

function updateLeaderboardSection() {
    const section = document.getElementById('leaderboard-section');
    
    if (!window.appState.allLeaderboardData || window.appState.allLeaderboardData.length === 0) {
        section.innerHTML = '<p class="text-gray-400">No leaderboard data available.</p>';
        return;
    }
    
    const leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.innerHTML = '';
    
    const leaderboard = createLeaderboardTable();
    leaderboardContainer.appendChild(leaderboard);
}

// Create Leaderboard Table
function createLeaderboardTable() {
    const container = document.createElement('div');
    container.className = 'card';
    
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Table Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="leaderboard-col-rank">Rank</th>
            <th class="leaderboard-col-player">Player</th>
            <th class="leaderboard-col-points">Points</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table Body
    const tbody = document.createElement('tbody');
    window.appState.allLeaderboardData.forEach(player => {
        const row = document.createElement('tr');
        
        // Check if this is the current user
        if (player.isCurrentUser) {
            row.className = 'current-user-row';
        }
        
        row.innerHTML = `
            <td class="leaderboard-col-rank">
                <span class="rank-number">#${player.rank}</span>
            </td>
            <td class="leaderboard-col-player">
                <span class="player-name">${player.username}</span>
            </td>
            <td class="leaderboard-col-points">
                <span class="player-points">${player.totalPoints}</span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    container.appendChild(table);
    
    return container;
}

// Get player rank by username
function getPlayerRank(username) {
    const player = window.appState.allLeaderboardData.find(p => p.username === username);
    return player ? player.rank : null;
}

// Get player total points
function getPlayerPoints(username) {
    const player = window.appState.allLeaderboardData.find(p => p.username === username);
    return player ? player.totalPoints : 0;
}
