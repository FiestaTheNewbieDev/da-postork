.PHONY: dev dev-build dev-down prod prod-build prod-down

dev:
	docker compose -f docker-compose.dev.yml up

dev-build:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

prod:
	docker compose -f docker-compose.yml up

prod-build:
	docker compose -f docker-compose.yml up --build

prod-down:
	docker compose -f docker-compose.yml down
