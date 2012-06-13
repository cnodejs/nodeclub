SRC := libs controllers plugins models
TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec
JSCOVERAGE = ./node_modules/visionmedia-jscoverage/jscoverage

test:
	@npm install
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

test-dot:
	@$(MAKE) test REPORTER=dot

cov:
	@for dir in $(SRC); do \
		mv $$dir $$dir.bak; \
		$(JSCOVERAGE) --encoding=utf-8 $$dir.bak $$dir; \
	done

cov-clean:
	@for dir in $(SRC); do \
		rm -rf $$dir; \
		mv $$dir.bak $$dir; \
	done

test-cov: cov
	@-$(MAKE) test REPORTER=html-cov > coverage.html
	@$(MAKE) cov-clean

.PHONY: test test-cov test-dot cov cov-clean
