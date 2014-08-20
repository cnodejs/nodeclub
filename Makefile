TESTS = $(shell find test -type f -name "*.test.js")
TESTTIMEOUT = 5000
REPORTER = spec
JSCOVERAGE = ./node_modules/jscover/bin/jscover
REGISTRY = "--registry=http://registry.npm.taobao.org"

install:
	@npm install $(REGISTRY)

pretest:
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@if ! test -f assets.json; then \
		make build; \
	fi

test: install pretest
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TESTTIMEOUT) \
		$(TESTS)

test-cov cov: install pretest
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--reporter $(REPORTER) \
		--timeout $(TESTTIMEOUT) \
		$(TESTS)

build:
	@./node_modules/loader/bin/build views .

start: install build
	@nohup ./node_modules/.bin/pm2 start app.js -i max --name "cnode" >> cnode.log 2>&1 &

restart: install build
	@nohup ./node_modules/.bin/pm2 restart "cnode" >> cnode.log 2>&1 &

.PHONY: install test cov test-cov build start restart
