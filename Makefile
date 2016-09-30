TESTS = $(shell find test -type f -name "*.test.js")
TEST_TIMEOUT = 10000
MOCHA_REPORTER = spec
# NPM_REGISTRY = "--registry=http://registry.npm.taobao.org"
NPM_REGISTRY = ""


all: test

install:
	@npm install $(NPM_REGISTRY)

pretest:
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@if ! test -d public/upload; then \
		mkdir public/upload; \
	fi

test: install pretest
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		--timeout $(TEST_TIMEOUT) \
		$(TESTS)

testfile:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		--timeout $(TEST_TIMEOUT) \
		$(FILE)

test-cov cov: install pretest
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-- \
		-r should \
		-r test/env \
		--reporter $(MOCHA_REPORTER) \
		--timeout $(TEST_TIMEOUT) \
		$(TESTS)


build:
	@./node_modules/loader-builder/bin/builder views .

run:
	@node app.js

start: install build
	@NODE_ENV=production ./node_modules/.bin/pm2 start app.js -i 0 --name "cnode" --max-memory-restart 400M

restart: install build
	@NODE_ENV=production ./node_modules/.bin/pm2 restart "cnode"

.PHONY: install test testfile cov test-cov build run start restart
