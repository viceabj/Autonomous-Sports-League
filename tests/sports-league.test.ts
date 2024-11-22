import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity contract state
let teams = new Map();
let players = new Map();
let matches = new Map();
let lastTeamId = 0;
let lastPlayerId = 0;
let lastMatchId = 0;

// Mock Clarity functions
function createTeam(caller: string, name: string): { type: string; value: number } {
  const newTeamId = ++lastTeamId;
  teams.set(newTeamId, { name, owner: caller, balance: 0, players: [] });
  return { type: 'ok', value: newTeamId };
}

function addPlayer(caller: string, name: string, value: number): { type: string; value: number } {
  if (caller !== 'contract-owner') {
    return { type: 'err', value: 100 }; // err-owner-only
  }
  const newPlayerId = ++lastPlayerId;
  players.set(newPlayerId, { name, teamId: null, value });
  return { type: 'ok', value: newPlayerId };
}

function tradePlayer(caller: string, playerId: number, fromTeamId: number, toTeamId: number, price: number): { type: string; value: boolean } {
  const player = players.get(playerId);
  const fromTeam = teams.get(fromTeamId);
  const toTeam = teams.get(toTeamId);
  
  if (!player || !fromTeam || !toTeam) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (player.teamId !== fromTeamId || fromTeam.owner !== caller) {
    return { type: 'err', value: 102 }; // err-unauthorized
  }
  if (toTeam.balance < price) {
    return { type: 'err', value: 105 }; // err-insufficient-funds
  }
  
  player.teamId = toTeamId;
  fromTeam.balance += price;
  fromTeam.players = fromTeam.players.filter(id => id !== playerId);
  toTeam.balance -= price;
  toTeam.players.push(playerId);
  
  return { type: 'ok', value: true };
}

function scheduleMatch(caller: string, homeTeamId: number, awayTeamId: number, date: number): { type: string; value: number } {
  if (caller !== 'contract-owner') {
    return { type: 'err', value: 100 }; // err-owner-only
  }
  if (homeTeamId === awayTeamId) {
    return { type: 'err', value: 104 }; // err-invalid-value
  }
  const newMatchId = ++lastMatchId;
  matches.set(newMatchId, { homeTeam: homeTeamId, awayTeam: awayTeamId, date, homeScore: null, awayScore: null, status: 'scheduled' });
  return { type: 'ok', value: newMatchId };
}

function reportMatchResult(caller: string, matchId: number, homeScore: number, awayScore: number): { type: string; value: boolean } {
  if (caller !== 'contract-owner') {
    return { type: 'err', value: 100 }; // err-owner-only
  }
  const match = matches.get(matchId);
  if (!match) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (match.status !== 'scheduled') {
    return { type: 'err', value: 104 }; // err-invalid-value
  }
  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.status = 'completed';
  
  // Distribute prize
  const prize = 1000000; // 1 STX
  const homeTeam = teams.get(match.homeTeam);
  const awayTeam = teams.get(match.awayTeam);
  if (homeScore > awayScore) {
    homeTeam.balance += prize;
  } else if (awayScore > homeScore) {
    awayTeam.balance += prize;
  } else {
    homeTeam.balance += prize / 2;
    awayTeam.balance += prize / 2;
  }
  
  return { type: 'ok', value: true };
}

function withdrawBalance(caller: string, teamId: number, amount: number): { type: string; value: boolean } {
  const team = teams.get(teamId);
  if (!team) {
    return { type: 'err', value: 101 }; // err-not-found
  }
  if (team.owner !== caller) {
    return { type: 'err', value: 102 }; // err-unauthorized
  }
  if (team.balance < amount) {
    return { type: 'err', value: 105 }; // err-insufficient-funds
  }
  team.balance -= amount;
  return { type: 'ok', value: true };
}

describe('Decentralized Autonomous Sports League', () => {
  beforeEach(() => {
    teams.clear();
    players.clear();
    matches.clear();
    lastTeamId = 0;
    lastPlayerId = 0;
    lastMatchId = 0;
  });
  
  it('should allow creating teams', () => {
    const result = createTeam('owner1', 'Team A');
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    const team = teams.get(1);
    expect(team).toBeDefined();
    expect(team.name).toBe('Team A');
    expect(team.owner).toBe('owner1');
  });
  
  it('should allow adding players', () => {
    const result = addPlayer('contract-owner', 'Player 1', 1000000);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    const player = players.get(1);
    expect(player).toBeDefined();
    expect(player.name).toBe('Player 1');
    expect(player.value).toBe(1000000);
  });
  
  it('should allow scheduling matches', () => {
    createTeam('owner1', 'Team A');
    createTeam('owner2', 'Team B');
    const result = scheduleMatch('contract-owner', 1, 2, 1625097600);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    const match = matches.get(1);
    expect(match).toBeDefined();
    expect(match.homeTeam).toBe(1);
    expect(match.awayTeam).toBe(2);
    expect(match.status).toBe('scheduled');
  });
  
  it('should allow reporting match results and distribute prizes', () => {
    createTeam('owner1', 'Team A');
    createTeam('owner2', 'Team B');
    scheduleMatch('contract-owner', 1, 2, 1625097600);
    const result = reportMatchResult('contract-owner', 1, 3, 1);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    const match = matches.get(1);
    expect(match.status).toBe('completed');
    expect(match.homeScore).toBe(3);
    expect(match.awayScore).toBe(1);
    const teamA = teams.get(1);
    expect(teamA.balance).toBe(1000000); // 1 STX prize
  });
  
  it('should allow withdrawing balance', () => {
    createTeam('owner1', 'Team A');
    createTeam('owner2', 'Team B');
    scheduleMatch('contract-owner', 1, 2, 1625097600);
    reportMatchResult('contract-owner', 1, 3, 1);
    const result = withdrawBalance('owner1', 1, 500000);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    const teamA = teams.get(1);
    expect(teamA.balance).toBe(500000);
  });
});

