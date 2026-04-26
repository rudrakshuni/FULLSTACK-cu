# Fullstack Experiment 9

This experiment contains a complete full-stack application with:

- Spring Boot backend using PostgreSQL
- React frontend built with Vite and served by Nginx
- Docker Compose orchestration of frontend, backend, and database

## Run the full stack

1. Open a terminal in `fullstack_exp9`
2. Run:

```bash
docker compose up --build
```

3. Open the browser at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/notes`

## Notes

- The React app fetches notes from the backend using `http://localhost:8080/api/notes`
- PostgreSQL data is persisted in a Docker volume named `db-data`
