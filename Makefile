minify ?= ./node_modules/uglify-js/bin/uglifyjs
lint ?= jshint

all: curio.min.js

%.min.js: %.js
	$(minify) $< > $@

lint:
	$(lint) --verbose curio.js

clean:
	rm -f *.min.js
