import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 300 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

const API_URL = 'https://bisaquest-api.vercel.app';

// Change these if your actual seeded database uses different IDs
const NPC_ID = 'village_npc_2';
const QUEST_ID = 1;

export default function () {
  // 1. Create Player
  const createRes = http.post(
    `${API_URL}/api/player/create`,
    JSON.stringify({ nickname: `TestUser_${__VU}_${Date.now()}` }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /api/player/create' },
    }
  );

  check(createRes, {
    'create player status 201': (r) => r.status === 201,
    'create player returns id': (r) => {
      try {
        return JSON.parse(r.body)?.data?.player_id !== undefined;
      } catch {
        return false;
      }
    },
  });

  let playerId = null;

  try {
    playerId = JSON.parse(createRes.body)?.data?.player_id;
  } catch {
    playerId = null;
  }

  if (!playerId) {
    sleep(1);
    return;
  }

  sleep(1);

  // 2. Retrieve Player Data
  const getPlayerRes = http.get(`${API_URL}/api/player/${playerId}`, {
    tags: { name: 'GET /api/player/:playerId' },
  });

  check(getPlayerRes, {
    'get player status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 3. Select Character
  const charRes = http.put(
    `${API_URL}/api/player/${playerId}/character`,
    JSON.stringify({ character: 'roberto' }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'PUT /api/player/:playerId/character' },
    }
  );

  check(charRes, {
    'update character status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 4. Retrieve Lobby Progress
  const lobbyRes = http.get(`${API_URL}/api/lobby/${playerId}/progress`, {
    tags: { name: 'GET /api/lobby/:playerId/progress' },
  });

  check(lobbyRes, {
    'get lobby progress status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 5. Fetch NPC Quest Information
  const npcQuestRes = http.get(`${API_URL}/api/challenge/npc/${NPC_ID}/quest`, {
    tags: { name: 'GET /api/challenge/npc/:npcId/quest' },
  });

  check(npcQuestRes, {
    'get npc quest status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 6. Load Quest Metadata
  const questMetaRes = http.get(`${API_URL}/api/challenge/quest/${QUEST_ID}`, {
    tags: { name: 'GET /api/challenge/quest/:questId' },
  });

  check(questMetaRes, {
    'get quest meta status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 7. Load Quest Dialogues
  const dialoguesRes = http.get(`${API_URL}/api/challenge/quest/${QUEST_ID}/dialogues`, {
    tags: { name: 'GET /api/challenge/quest/:questId/dialogues' },
  });

  check(dialoguesRes, {
    'get quest dialogues status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 8. Retrieve Challenge Items
  const itemsRes = http.get(`${API_URL}/api/challenge/quest/${QUEST_ID}/items`, {
    tags: { name: 'GET /api/challenge/quest/:questId/items' },
  });

  check(itemsRes, {
    'get challenge items status 200': (r) => r.status === 200,
  });

  sleep(1);
}