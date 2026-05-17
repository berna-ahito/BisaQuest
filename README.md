````markdown
# BisaQuest — Interactive Story-Based Learning Game

BisaQuest is a web-based, story-driven learning game designed to help Grade 3 students improve their reading comprehension skills. It integrates interactive quests, NPC-guided lessons, and bilingual support in English and Cebuano. The platform features a standalone learning environment for students.

---

## 1. Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React + Vite | Latest |
| React Router DOM | 7.9.6 |
| vite-plugin-image-optimizer | 2.0.3 |

### Backend
| Technology | Version |
|---|---|
| Node.js | v24.12.0 |
| Express | v4.18.2 |
| Supabase JS | v2.39.0 |

### Database & Storage
| Technology | Description |
|---|---|
| Supabase | PostgreSQL BaaS |
| Netlify | Developer testing & staging |
| Vercel | Final usability testing for players |

### Infrastructure
| Technology | Description |
|---|---|
| Node.js | Runtime |
| npm | Package manager |

---

## 2. Project Structure

```
BisaQuest/
├── Frontend/
│   └── bisa-quest/        # React + Vite SPA
├── Backend/               # Express.js REST API
├── tests/                 # Test files
└── netlify.toml           # Netlify build configuration
```

---

## 3. Environment Configuration

### Backend `.env` — located at `/Backend/.env`

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Frontend `.env` — located at `/Frontend/bisa-quest/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 4. Deployment Instructions

### 4.1 Local Development (Backend)

1. Clone the repository:
   ```bash
   git clone https://github.com/Nagazta/BisaQuest.git
   cd BisaQuest
   ```

2. Go to the backend folder:
   ```bash
   cd Backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

5. Start the backend server:
   ```bash
   npm run dev    # for development
   npm run start  # for production
   ```

6. The BisaQuest API will be available at: `http://localhost:5000`

---

### 4.2 Local Development (Frontend)

1. From the project root, go to the frontend folder:
   ```bash
   cd Frontend/bisa-quest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Run the frontend in dev mode:
   ```bash
   npm run dev
   ```

5. Open the app in your browser at: `http://localhost:5173`

---

### 4.3 Developer Testing Deployment (Netlify)

BisaQuest uses Netlify for internal developer testing and staging.

- **Frontend:** React + Vite SPA deployed on Netlify, built according to `netlify.toml`
- **Backend:** Express.js API exposed via Netlify serverless functions
- **Database:** Supabase managed PostgreSQL instance

To deploy a new version:
1. Push changes to the `main` branch connected to Netlify.
2. Netlify builds and redeploys the frontend according to `netlify.toml`.
3. Confirm the frontend is live at your configured Netlify domain.

---

### 4.4 Final Usability Testing Deployment (Vercel)

BisaQuest uses Vercel for final usability testing, where actual Grade 3 players access and interact with the game.

- **Frontend:** React + Vite SPA deployed on Vercel
- **Backend:** Express.js API deployed as Vercel serverless functions
- **Database:** Supabase managed PostgreSQL instance

To deploy a new version:
1. Push changes to the `main` branch connected to Vercel.
2. Vercel builds and redeploys the frontend automatically.
3. Confirm the frontend is live at your configured Vercel domain.

---

## 5. Sample Usernames and Passwords

BisaQuest does not use traditional login credentials. The system has no username or password authentication for players — students simply enter a nickname to begin playing. There are no user accounts, no registered emails, and no passwords of any kind on the player side.

This is intentional by design: BisaQuest is a game-first experience aimed at young learners, and requiring login credentials would create unnecessary friction. Player progress is tracked by nickname within the session.

As such, there are no dummy credentials to provide for this submission requirement.

---

## 6. How to Use BisaQuest

1. Open the app and enter a nickname to begin.
2. **As a Student/Player:**
   - Choose a quest from the available game scenes.
   - Interact with NPCs to receive vocabulary lessons and challenges.
   - Complete mini-games such as word matching, picture association, and sentence completion.
   - Track your progress through the game's stages.

---

## Project Developers

| Name | Role |
|---|---|
| Kyle Sepulveda | Team Lead |
| Bernadeth Claire Ahito | Project Manager |
| Alyssa Blanche Alivio | Front-end Developer |
| Estelle Felicity Carao | Back-end Developer |
| Juvie Coca | Front-end / QA |
````
