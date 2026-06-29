const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Match = require('./models/Match');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

dotenv.config();

const seedDataPath = path.join(__dirname, 'seed_data.txt');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const rawData = fs.readFileSync(seedDataPath, 'utf8');
    const lines = rawData.split('\n').filter(l => l.trim() !== '');

    const teamsSet = new Set();
    const parsedUsers = [];

    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 3) {
        const teamName = parts[0].trim();
        const fullName = parts[1].trim();
        const originalEmail = parts[2].trim();
        teamsSet.add(teamName);
        parsedUsers.push({ teamName, fullName, originalEmail });
      }
    });

    console.log(`Found ${teamsSet.size} teams and ${parsedUsers.length} users.`);

    // 1. Create Team Accounts
    const teamAccountIds = [];
    const defaultPassword = await bcrypt.hash('team12345', 10);

    for (const teamName of teamsSet) {
      let teamAccount = await User.findOne({ nickname: teamName, isTeamAccount: true });
      if (!teamAccount) {
        teamAccount = await User.create({
          nickname: teamName,
          email: `team_${crypto.randomBytes(4).toString('hex')}@teams.nhrl.io`,
          passwordHash: defaultPassword,
          isTeamAccount: true,
          team: teamName,
          isVerified: true, // Auto-verify
        });
        console.log(`Created team account: ${teamName}`);
      }
      teamAccountIds.push(teamAccount._id);
    }

    // 2. Create Individual Users
    for (const u of parsedUsers) {
      let user = await User.findOne({ nickname: u.fullName });
      if (!user) {
        // Since emails might be duplicated in the raw list, we generate unique ones
        const uniqueEmail = `${u.fullName.replace(/\s+/g, '').toLowerCase()}_${crypto.randomBytes(4).toString('hex')}@users.nhrl.io`;
        await User.create({
          nickname: u.fullName,
          email: uniqueEmail,
          passwordHash: defaultPassword,
          isTeamAccount: false,
          team: u.teamName,
          isVerified: true,
        });
        console.log(`Created individual account: ${u.fullName}`);
      }
    }

    // 3. Create Main Tournament
    let tournament = await Tournament.findOne({ title: 'Main Team Tournament' });
    if (!tournament) {
      tournament = await Tournament.create({
        title: 'Main Team Tournament',
        startDate: new Date(),
        status: 'Upcoming',
        participants: teamAccountIds,
      });
      console.log('Created Main Team Tournament');
    } else {
      tournament.participants = teamAccountIds;
      await tournament.save();
      console.log('Updated existing Main Team Tournament participants');
    }

    // 4. Generate Bracket logic (Similar to backend handleGenerateBracket)
    await Match.deleteMany({ _id: { $in: tournament.matches || [] } });
    
    // We shuffle the teamAccountIds for a random bracket layout
    const shuffledParticipants = [...teamAccountIds].sort(() => 0.5 - Math.random());
    const matchIds = [];
    
    // Simple single-elimination generation logic
    const totalTeams = shuffledParticipants.length;
    // Next power of 2
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
    const byes = nextPowerOf2 - totalTeams;
    const firstRoundMatches = nextPowerOf2 / 2;

    const roundMatches = [];
    
    // Create First Round Matches
    for (let i = 0; i < firstRoundMatches; i++) {
        const participant1 = shuffledParticipants.pop() || null;
        const participant2 = (byes > i) ? null : (shuffledParticipants.pop() || null);
        
        const match = new Match({
            tournamentId: tournament._id,
            round: 1,
            matchNumber: i + 1,
            participant1Id: participant1,
            participant2Id: participant2,
            status: participant2 === null ? 'Completed' : 'Scheduled',
            winnerId: participant2 === null ? participant1 : null // If bye, p1 advances automatically
        });
        await match.save();
        roundMatches.push(match);
        matchIds.push(match._id);
    }

    // Create subsequent rounds
    let currentRoundMatches = roundMatches;
    let roundNum = 2;
    let matchNumCounter = firstRoundMatches + 1;

    while (currentRoundMatches.length > 1) {
        const nextRoundMatches = [];
        for (let i = 0; i < currentRoundMatches.length; i += 2) {
            const nextMatch = new Match({
                tournamentId: tournament._id,
                round: roundNum,
                matchNumber: matchNumCounter++
            });
            await nextMatch.save();
            nextRoundMatches.push(nextMatch);
            matchIds.push(nextMatch._id);

            // Link previous matches to next match
            currentRoundMatches[i].nextMatchId = nextMatch._id;
            await currentRoundMatches[i].save();
            
            if (i + 1 < currentRoundMatches.length) {
                currentRoundMatches[i+1].nextMatchId = nextMatch._id;
                await currentRoundMatches[i+1].save();
            }

            // Propagate byes
            if (currentRoundMatches[i].winnerId) {
                nextMatch.participant1Id = currentRoundMatches[i].winnerId;
                await nextMatch.save();
            }
            if (i + 1 < currentRoundMatches.length && currentRoundMatches[i+1].winnerId) {
                nextMatch.participant2Id = currentRoundMatches[i+1].winnerId;
                await nextMatch.save();
            }
        }
        currentRoundMatches = nextRoundMatches;
        roundNum++;
    }

    tournament.matches = matchIds;
    await tournament.save();
    console.log('Generated Tournament Bracket successfully!');

    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
