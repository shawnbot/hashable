minify ?= ./node_modules/uglify-js/bin/uglifyjs

all: curio.min.js

%.min.js: %.js
	$(minify) $< > $@

clean:
	rm -f *.min.js
