.PHONY: lint prettier build start

lint:
	./node_modules/semistandard/bin/cmd.js --fix ./ajax-preload.js ./ajax-bypass.js ./head-dedupe.js

prettier:
	yarn run prettier -- --write "{ajax-preload.js,ajax-bypass.js,head-dedupe.js}"

start:
	yarn start

build: lint prettier
	./node_modules/babel-cli/bin/babel.js --no-comments ajax-preload.js --compact='true' --out-file dist/ajax-preload.js
	./node_modules/babel-cli/bin/babel.js --no-comments ajax-bypass.js --compact='true' --out-file dist/ajax-bypass.js
	./node_modules/babel-cli/bin/babel.js --no-comments head-dedupe.js --compact='true' --out-file dist/head-dedupe.js
