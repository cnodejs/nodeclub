SRC := libs controllers plugins
TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

test-dot:
	@$(MAKE) test REPORTER=dot

cov:
	@for dir in $(SRC); do \
		mv $$dir $$dir.bak; \
		jscoverage --encoding=utf-8 $$dir.bak $$dir; \
	done

cov-clean:
	@for dir in $(SRC); do \
		rm -rf $$dir; \
		mv $$dir.bak $$dir; \
	done

test-cov: cov
	@-$(MAKE) test REPORTER=html-cov > coverage.html
	@$(MAKE) cov-clean

test-for:
	@for dir in $(SRC); do \
		echo $$dir; \
	done

.PHONY: test test-cov test-dot jscoverage-start jscoverage-end
