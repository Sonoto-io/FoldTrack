.PHONY: dev-up
dev-up:
	docker compose up --build

.PHONY: dev-up-mocks
dev-up-mocks:
	MOCKS_ENABLED=true docker compose up --build


.PHONY: dev-down
dev-down:
	docker compose down

.PHONY: dev-reset
dev-reset:
	docker compose down -v
	docker compose up --build
