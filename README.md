# 2026 FIFA World Cup Contest - Interactive Prototype

A mobile-first sportsbook contest prototype for the 2026 FIFA World Cup powered by Heritage Sports. Users rank the 48 teams using a tier-based system and earn points as the tournament progresses.

## Features

✅ **Tier-Based Ranking System** - Drag-and-drop teams into S/A/B/C/D tiers for quick ranking  
✅ **Contest Scoring** - Earn points equal to team rankings when they win matches  
✅ **Tournament Simulation** - Admin panel to simulate tournament progression through 9 stages  
✅ **Group Stage Standings** - Real-time standings for all 10 groups  
✅ **Knockout Matches** - Track Round of 32 through Final matches  
✅ **Leaderboard** - Top 20 players with scoring comparison  
✅ **Mobile Optimized** - Responsive design with bottom navigation  
✅ **Dark Sportsbook Theme** - Professional colors: rgb(33,37,41) background, rgb(212,185,97) gold accent  
✅ **LocalStorage Persistence** - Rankings and scores saved locally without backend  

## Quick Start

### Open the Application
1. **Main Contest**: Open `index.html` in your browser
2. **Admin Panel**: Open `admin.html` to simulate tournament stages

### How to Play

**Step 1: Rank Your Teams**
- Go to "My Rankings" tab
- Drag teams into tier boxes (S = strongest, D = weakest)
- Click "Lock My Rankings" when ready

**Step 2: Simulate Tournament**
- Open `admin.html`
- Select tournament stage to progress simulation
- Changes are saved to browser storage

**Step 3: Earn Points**
- Points = Your ranking value for the team × Team wins
- View "Home" tab to see your score
- Check "Leaderboard" for rankings against other players

## Project Structure

```
worldcup-contest-demo/
├── index.html              # Main contest application
├── admin.html              # Admin panel for stage simulation
├── css/
│   └── styles.css         # Dark theme styling
├── js/
│   ├── app.js             # Main app logic, navigation, scoring
│   ├── ranking.js         # Tier ranking system & drag-drop
│   ├── groups.js          # Group stage interface
│   ├── knockout.js        # Knockout stage interface
│   └── leaderboard.js     # Leaderboard display
└── data/
    ├── teams.json         # All 48 teams with IDs and groups
    ├── leaderboard.json   # Simulated player rankings
    ├── stage-0-pre-tournament.json
    ├── stage-1-group-matchday1.json
    ├── stage-2-group-matchday2.json
    ├── stage-3-group-matchday3.json
    ├── stage-4-round32.json
    ├── stage-5-round16.json
    ├── stage-6-quarterfinal.json
    ├── stage-7-semifinal.json
    └── stage-8-final.json
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with dark theme
- **Vanilla JavaScript (ES6)** - No framework dependencies
- **TailwindCSS** - CDN-loaded utility classes
- **JSON** - Static data files
- **LocalStorage** - Browser persistence

## Ranking System

### Tier Mapping
- **S Tier**: Ranks 40-48 (Top contenders)
- **A Tier**: Ranks 30-39 (Very strong)
- **B Tier**: Ranks 20-29 (Competitive)
- **C Tier**: Ranks 10-19 (Average)
- **D Tier**: Ranks 1-9 (Weak)

Each tier distributes its ranking range equally among teams placed in it.

## Scoring Rules

| Match Result | Points Awarded |
|-------------|-----------------|
| Team Wins   | Ranking value   |
| Team Draws  | 0 points        |
| Team Loses  | 0 points        |

**Example**: If you ranked Brazil at 48 and they win a match, you earn +48 points.

## Tournament Stages

The admin panel allows simulating these stages:

1. **Pre-Tournament** - Initial state, no points earned
2. **Group Match 1** - First group stage round
3. **Group Match 2** - Second group stage round
4. **Group Match 3** - Third group stage round (final)
5. **Round of 32** - 32 teams advance to knockout
6. **Round of 16** - 16 teams advance
7. **Quarterfinal** - 8 teams compete
8. **Semifinal** - 4 teams compete
9. **Final** - Championship match

## Deployment to GitHub Pages

1. Create a new GitHub repository named `<username>.github.io`
2. Copy all files to your repository
3. Commit and push to main branch
4. Access at `https://<username>.github.io`

**Optional**: For a project site:
1. Create a `/docs` folder in your repo
2. Copy files there
3. Enable GitHub Pages in repo settings to serve from `/docs`

## Design Colors

- **Background**: `rgb(33, 37, 41)` - Dark slate
- **Card Background**: `rgb(18, 20, 29)` - Very dark blue
- **Highlight/Gold**: `rgb(212, 185, 97)` - Warm gold (buttons, accents)
- **Primary Text**: `white`
- **Secondary Text**: `rgb(169, 175, 195)` - Muted gray-blue

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (tested on iOS Safari, Chrome Mobile)

## Known Limitations

- No backend - demo uses simulated leaderboard data
- Scores calculated on the client side
- No real-time updates or multiplayer
- Admin stage changes require page refresh to see updated scores

## Future Enhancements

- Backend integration for real contest data
- User authentication and accounts
- Real-time match updates
- Custom contest tiers
- Team statistics and insights
- Export rankings/scores

## License

Heritage Sports World Cup Contest - Prototype 2026

---

**Questions?** Review the code files for detailed comments on data structure and logic flow.
