APP_NAME=fe-safa
SERVER=safa
REMOTE_DIR=/home/safa-bodycare/safa-project/production/frontend/fe-safa

install:
	npm install

build:
	npm run build

lint:
	npm run lint

dev:
	npm run dev

deploy-fe: build
	ssh $(SERVER) "sudo systemctl stop fe-safa || true"
	ssh $(SERVER) "mkdir -p $(REMOTE_DIR)"

	rsync -avz --delete \
	--no-owner --no-group --no-perms \
	--no-times --omit-dir-times \
	--exclude ".next/cache" \
	--exclude "node_modules" \
	.next \
	public \
	package.json \
	package-lock.json \
	next.config.ts \
	.env \
	$(SERVER):$(REMOTE_DIR)

	ssh $(SERVER) "cd $(REMOTE_DIR) && npm install --omit=dev"
	ssh $(SERVER) "sudo systemctl restart $(APP_NAME)"

clean:
	rm -rf .next

.PHONY: install build deploy dev clean lint
