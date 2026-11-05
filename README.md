# To-Do List App (MERN)

Mobile-first to-do app: create, edit, delete and search tasks, grouped by week (Mon–Sun) with open/completed counts.

**Stack:** MongoDB · Express · React (Vite) · Node · Tailwind CSS

## Run locally

```bash
# 1. API
cd server
cp .env.example .env      # add your MongoDB Atlas URI and a JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account (`name`, `email`, `password`) → `{ token, user }` |
| POST | `/api/auth/login` | Log in (`email`, `password`) → `{ token, user }` |
| GET | `/api/auth/me` | Current user (restores a saved session) |

All `/api/tasks` routes need the header `Authorization: Bearer <token>` and only touch the logged-in user's tasks.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tasks?q=keyword` | List tasks, optional search on title/description |
| POST | `/api/tasks` | Create (`title`, `dueAt` required; `description`, `endAt`, `priority` optional) |
| PUT | `/api/tasks/:id` | Edit any field |
| PATCH | `/api/tasks/:id/status` | `{ "status": "completed" \| "in-progress" }` |
| DELETE | `/api/tasks/:id` | Delete |

## Deploy

1. **Database:** create a free MongoDB Atlas cluster, allow network access (0.0.0.0/0), copy the connection string.
2. **API (Render / Railway):** root directory `server`, build `npm install`, start `npm start`.
   Env vars: `MONGO_URI`, `JWT_SECRET` (a long random string), `CLIENT_URL` (your Netlify URL, no trailing slash).
3. **Client (Netlify):** base directory `client`, build `npm run build`, publish `dist`.
   Env var: `VITE_API_URL=https://<your-api>.onrender.com/api`.

## Design decisions

- Tasks store a full UTC `dueAt` instant; weeks are computed in the user's local timezone (Monday start), so counts stay correct across timezones.
- Status toggles are optimistic, so the weekly cards update instantly and roll back if the API fails.
- Swipe left on a task (touch) reveals Delete; trash/edit icons are also available for mouse users.
- Tap a task title to view its description and priority.

## Auth design

- Passwords are hashed with bcrypt and never returned by the API. Login uses a JWT valid for 7 days.
- Every task stores its owner (`user`). All task queries filter by the logged-in user's id, and edit/delete match on both task id and owner, so one user can never read or change another user's tasks.
- On logout the client clears the token and the in-memory tasks.
