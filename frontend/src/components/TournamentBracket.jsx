import React from 'react';
import './TournamentBracket.css';

const TournamentBracket = ({ matches, onMatchClick, adminMode }) => {
  if (!matches || matches.length === 0) return <div>No bracket generated yet.</div>;

  // Group matches by round
  const roundsMap = {};
  matches.forEach(m => {
    if (!roundsMap[m.round]) roundsMap[m.round] = [];
    roundsMap[m.round].push(m);
  });

  const rounds = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="bracket-container">
      {rounds.map((round) => (
        <div key={round} className="bracket-round">
          <h4 className="round-header">Round {round}</h4>
          <div className="matches-column">
            {roundsMap[round].sort((a, b) => a.matchNumber - b.matchNumber).map(match => (
              <div 
                key={match._id} 
                className={`match-card ${adminMode ? 'clickable' : ''} ${match.status === 'Completed' ? 'completed' : ''}`}
                onClick={() => adminMode && onMatchClick(match)}
              >
                <div className={`participant ${match.winnerId && match.winnerId._id === match.participant1Id?._id ? 'winner' : ''}`}>
                  <span className="name">{match.participant1Id ? match.participant1Id.nickname : 'TBD'}</span>
                </div>
                <div className="vs">vs</div>
                <div className={`participant ${match.winnerId && match.winnerId._id === match.participant2Id?._id ? 'winner' : ''}`}>
                  <span className="name">{match.participant2Id ? match.participant2Id.nickname : 'TBD'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
