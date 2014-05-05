minify ?= ./node_modules/uglify-js/bin/uglifyjs
lint ?= jshint

all: hashable.min.js

test:
	./node_modules/mocha/bin/mocha

%.min.js: %.js
	$(minify) $< > $@

lint:
	$(lint) --verbose hashable.js

clean:
	rm -f *.min.js
