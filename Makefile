TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec
JSCOVERAGE = ./node_modules/jscover/bin/jscover

install:
	@npm install

test: install
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@if ! test -f assets.json; then \
		make build; \
	fi
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

cov: install
	@rm -rf .cov
	@$(JSCOVERAGE) --exclude=public --exclude=test . .cov
	@cp -rf node_modules test public .cov

test-cov: cov
	@$(MAKE) -C .cov test REPORTER=progress
	@$(MAKE) -C .cov test REPORTER=html-cov > coverage.html

build:
	@./node_modules/loader/bin/build views .

start: install build
	@nohup ./node_modules/.bin/pm2 start app.js -i max --name "cnode" >> cnode.log 2>&1 &

restart: install build
	@nohup ./node_modules/.bin/pm2 restart "cnode" >> cnode.log 2>&1 &

.PHONY: install test cov test-cov build start restart
