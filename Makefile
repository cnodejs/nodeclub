TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec

install:
	@npm install

test: install
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TESTTIMEOUT) \
		$(TESTS)

test-cov:
	@$(MAKE) test REPORTER=dot
	@$(MAKE) test REPORTER=html-cov > coverage.html
	@$(MAKE) test REPORTER=travis-cov

clean:
	@rm -rf node_modules

test-all: test test-cov

.PHONY: test test-cov test-all
