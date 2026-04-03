Stepz:
download/clone repo
download docker desktop
Build command: docker compose up --build
Frontend: http://localhost:3000
Backend API: http://localhost:8000
Database: localhost:5432
Run in background: docker compose up -d
Stop services: docker compose down
View logs: docker compose logs -f
Rebuild after changes: docker compose up --build
Remove all data and start fresh: docker compose down -v
clean up Docker resources to free disk space:
docker system prune -a --volumes