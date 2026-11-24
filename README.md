# Agriwise

Agriwise is a web application for agricultural intelligence and produce marketplace services.

## Development

Install the frontend dependencies from the repository root with `npm install`, then start the frontend with `npm run dev`.

The login and registration pages use the backend API. In a second terminal:

```sh
cd backend
npm install
npm run dev
```

Before starting the API, copy `backend/.env.example` to `backend/.env`, then set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with a private random secret. The API waits for MongoDB to connect before accepting requests.

The Vite development server proxies `/api` requests to `http://localhost:3000`. For a separately hosted API, set `VITE_API_URL` to its `/api` base URL before building the frontend and set `CLIENT_ORIGIN` in the backend environment to the frontend's exact origin.

The current OTP service logs verification codes in the backend terminal; it does not send SMS yet.

After signing in or verifying a new account, users are taken to `/dashboard`. The dashboard loads the current profile from the protected `/api/auth/me` endpoint using the saved bearer token, then personalizes its welcome and quick links using the backend profile.
