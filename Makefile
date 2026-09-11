.PHONY: migrate seed

migrate:
	@echo "Running database migrations..."
	cd backend && venv\Scripts\alembic upgrade head

seed:
	@echo "Seeding database with sample data..."
	backend\venv\Scripts\python -m backend.app.db.seed
