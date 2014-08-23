
#
#   fatcatmap: makefile
#
#   :author: Sam Gammon <sam@momentum.io>
#   :author: Alex Rosner <alex@momentum.io>
#   :author: David Rekow <david@momentum.io>
#   :author: Ian Weisberger <ian@momentum.io>
#   :copyright: (c) momentum labs, 2014
#   :license: This is private software code and all
#             rights to access, observe, run, compile
#             deploy, modify, put use to, or leverage
#             for commercial gain (and any other rights
#             not enumerated here as governed by
#             applicable law) are held and reserved
#             ad infinitum by momentum labs, inc. and
#             its employees, founders, and partners.
#

### === VARS === ###

## == defaults == ##
BREW?=1
DEBUG?=1
SANDBOX?=0
BUILDBOX?=0
USER?=`whoami`
CANTEEN_BRANCH?=feature/FLY-1
BOOTSTRAP_BRANCH?=master
SANDBOX_GIT?=$(USER)@sandbox
BREWDEPS=openssl python haproxy redis pypy
TEST_FLAGS?=

## == optionals == ##
extensions=on
gevent=off
logbook=off

## == environment == ##
OS?=Mac
DEVROOT=$(PWD)
ENVIRONMENT?=debug
LIBROOT=$(DEVROOT)/lib


ifeq ($(extensions),on)
ifeq ($(gevent),on)
OPTIONALS+=gevent
endif
ifeq ($(logbook),on)
OPTIONALS+=logbook
endif
endif

ifeq ($(BUILDBOX),1)
LIBROOT=$(BUILDROOT)/lib
DEVROOT=$(BUILDROOT)
endif

STOP=\x1b[0m
RED=\x1b[31;01m
GREEN=\x1b[32;01m
CYAN=\x1b[36;01m
YELLOW=\x1b[33;01m
MAGENTA=\x1b[35;01m

OK_STRING=$(GREEN)[OK]$(STOP)
ERROR_STRING=$(RED)[ERRORS]$(STOP)
WARN_STRING=$(YELLOW)[WARNINGS]$(STOP)


### === ROUTINES === ###

all: build
run: build devserver

build: develop
	@echo "~~ $(GREEN)fcm build completed$(STOP) ~~"

package: develop
	@echo "Making buildroot..."
	@mkdir -p dist/

	@echo "Building source package..."
	@bin/python setup.py sdist

	@echo "Building egg..."
	@bin/python setup.py bdist_egg

	@echo "~~~ $(GREEN)fcm distribution built.$(STOP) ~~~"

develop: .develop js styles templates coverage
	@echo "Updating source dependencies..."
	@echo "Cloning as user $(USER)..."

canteen: lib/canteen

js:
	@echo "Minifying Javascript..."
	@-node_modules/gulp/bin/gulp.js closure

styles:
	@echo "Compiling Less..."
	@-node_modules/gulp/bin/gulp.js less

ifeq ($(BREW),1)
brew:
	@echo "Brewing for Mac..."
	@-which brew > /dev/null && brew install $(BREWDEPS) 2> /dev/null
else
brew:
	@echo "Skipping brew."
endif

ifeq ($(SANDBOX),1)
lib/canteen:
	@echo "Cloning Canteen from sandbox..."
	@git clone $(SANDBOX_GIT):sources/dependencies/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
ifeq ($(DEBUG),1)
else
lib/canteen:
	@echo "Updating source dependencies..."
	@git clone /base/sources/dependencies/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
endif
else
lib/canteen:
	@echo "Updating source dependencies..."
	@echo "Cloning from GitHub..."
	@git clone https://github.com/momentum/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
endif

test:
	@-bin/python -c "import nose" || @-bin/pip install --upgrade nose coverage
	@echo "$(CYAN)Running Python app testsuite...$(STOP)"
	@-bin/nosetests canteen_tests fatcatmap_tests $(TEST_FLAGS)
	@echo "$(MAGENTA)Running javascript testsuite...$(STOP)"
	@-ENV=$(ENVIRONMENT) gulp test
	@echo "~~~ $(GREEN) tests complete. $(STOP) ~~~"

coverage:
	@-bin/python -c "import nose" || @-bin/pip install --upgrade nose coverage
	@echo "Running testsuite (with coverage)..."
	@mkdir -p .develop/tests/python/xunit .develop/tests/js
	@mkdir -p .develop/coverage/python/xunit .develop/coverage/js
	@-bin/nosetests canteen_tests fatcatmap_tests --with-coverage \
							 --cover-package=fatcatmap \
							 --cover-package=canteen \
							 --cover-html \
							 --cover-xml \
							 --with-xunit \
							 --cover-html-dir=.develop/coverage/python/html \
							 --cover-xml-file=.develop/coverage/python/clover.xml \
							 --xunit-file=.develop/tests/python/xunit.xml $(TEST_FLAGS);

deploy:
	@echo "Deployment is not currently supported from dev. Check back later."

clean:
	@echo "Cleaning object files..."
	@find . -name "*.pyc" -exec rm -f {} \;
	@find . -name "*.pyo" -exec rm -f {} \;

	@echo "Cleaning SASS cache..."
	@rm -fr .sass-cache

distclean: clean
	@echo "Cleaning development state..."
	@rm -fr .develop

	@echo "Cleaning gemroot..."
	@rm -fr .Gems

	@echo "Cleaning virtualenv..."
	@rm -fr .Python bin/ include/ lib/ config.rb ./.env .develop .sass-cache .less-cache

	@echo "Cleaning Bootstrap..."
	@rm -fr fatcatmap/assets/bootstrap;

forceclean: distclean
	@echo "Resetting codebase..."
	@git reset --hard

	@echo "Cleaning libraries..."
	@rm -fr $(LIBROOT)/canteen

	@echo "Cleaning untracked files..."
	@git clean -df

### === dirs === ###
bin: $(DEVROOT)/.env
lib: $(DEVROOT)/.env

### === resources === ###
templates: $(DEVROOT)/.develop
	@echo "Building fcm templates..."
	@bin/python $(DEVROOT)/scripts/fcm.py build --templates

### === defs === ###
$(DEVROOT)/bin/fcm:
	@echo "Symlinking toolchain..."
	@-ln -s $(DEVROOT)/scripts/fcm.py $(DEVROOT)/bin/fcm

$(DEVROOT)/lib/python2.7/site-packages/canteen.pth:
	@echo "$(DEVROOT)/lib/canteen" > lib/python2.7/site-packages/canteen.pth

.develop: bin lib $(DEVROOT)/.env $(DEVROOT)/bin/fcm bootstrap canteen closure $(DEVROOT)/lib/python2.7/site-packages/canteen.pth brew $(OPTIONALS)
	@touch ./.env

$(DEVROOT)/.env: closure bootstrap canteen npm
	@echo "Using devroot $(DEVROOT)..."
	@echo "Initializing virtualenv..."
	@-pip install virtualenv
	@virtualenv $(DEVROOT) --prompt="(fcm)" -q
	@-sed -e 's/printf "%s%s%s" "(fcm)" (set_color normal) (_old_fish_prompt)/printf " %s ^.^ %s %s(fcm)%s  %s " (set_color -b green black) (set_color normal) (set_color -b white black) (set_color normal) (_old_fish_prompt)/g' bin/activate.fish > bin/activate_color.fish
	@-mv bin/activate.fish bin/activate_lame.fish
	@-mv bin/activate_color.fish bin/activate.fish

	@echo "Installing GCloud Git remote..."
	@-grep gcloud .git/config > /dev/null || echo "[remote \"gcloud\"]\n\turl = https://source.developers.google.com/p/fcm-catnip/r/default\n\tfetch = +refs/heads/*:refs/remotes/gcloud/*\n" >> $(DEVROOT)/.git/config

	@echo "Overriding standard Google paths..."
	@-echo "" > lib/python2.7/site-packages/protobuf-2.5.0-py2.7-nspkg.pth

	@echo "Installing Canteen dependencies..."
	@bin/pip install msgpack-python
	@bin/pip install "git+https://github.com/sgammon/protobuf.git#egg=protobuf-2.5.2-canteen"
	@bin/pip install "git+https://github.com/sgammon/hamlish-jinja.git#egg=hamlish_jinja-0.3.4-canteen"
	@bin/pip install --upgrade -r lib/canteen/requirements.txt
	@bin/pip install --upgrade -r lib/canteen/dev_requirements.txt

	@echo "Installing Pip dependencies..."
	@bin/pip install "git+https://github.com/sgammon/libcloud.git#egg=libcloud-0.15.1"
	@-bin/pip install --upgrade -r ./requirements.txt
	@-mkdir -p .develop
	@-mkdir -p .develop/maps/fatcatmap/assets/{js,less,style,coffee}/site
	@-chmod -R 775 .develop

	@echo "Building Canteen..."
	@-cd lib/canteen; $(MAKE) DEPS=0 VIRTUALENV=0 TESTS=0 package


### === dependencies === ###
ifeq ($(OS),Mac)
gevent: cython
	@echo "Installing Gevent..."
	@-brew install libev
	@-bin/pip install --upgrade "git+git://github.com/surfly/gevent.git#egg=gevent"
endif

ifeq ($(OS),Linux)

ifeq ($(PLAT),RHEL)
gevent: cython
	@echo "Installing Gevent..."
	@-yum install libev-dev
	@-bin/pip install --upgrade cython "git+git://github.com/surfly/gevent.git#egg=gevent"
endif

ifeq ($(PLAT),Debian)
gevent: cython
	@echo "Installing Gevent..."
	@-apt-get install libev
	@-bin/pip install --upgrade cython "git+git://github.com/surfly/gevent.git#egg=gevent"
endif

endif

logbook:
	@echo "Installing Logbook..."
	@-bin/pip install --upgrade "git+git://github.com/keenlabs/logbook.git#egg=logbook"

$(DEVROOT)/node_modules: bootstrap
	@echo "Installing NPM dependencies..."
	@-npm install

npm: $(DEVROOT)/node_modules

ifeq ($(BUILDBOX),0)
$(LIBROOT)/closure/compiler.jar:
	@echo "Downloading Closure Compiler..."
	@-curl --progress-bar http://dl.google.com/closure-compiler/compiler-latest.zip > ./compiler-latest.zip
	@-mkdir -p $(LIBROOT)/closure

	@echo "Extracting Closure Compiler..."
	@-unzip compiler-latest.zip -d $(LIBROOT)/closure
	@-mv compiler-latest.zip $(LIBROOT)/closure
	@-rm -f compiler-latest.zip

	@-mkdir -p $(LIBROOT)/closure/build;
	@-mv $(LIBROOT)/closure/compiler.jar $(LIBROOT)/closure/build/compiler.jar;
else
$(LIBROOT)/closure/compiler.jar:
	@echo "Downloading Closure Compiler..."
	@-curl http://dl.google.com/closure-compiler/compiler-latest.zip > ./compiler-latest.zip 2> /dev/null
	@-mkdir -p $(LIBROOT)/closure

	@echo "Extracting Closure Compiler..."
	@-unzip compiler-latest.zip -d $(LIBROOT)/closure
	@-mv compiler-latest.zip $(LIBROOT)/closure
	@-rm -f compiler-latest.zip

	@-mkdir -p $(LIBROOT)/closure/build;
	@-mv $(LIBROOT)/closure/compiler.jar $(LIBROOT)/closure/build/compiler.jar;
endif

closure: $(LIBROOT)/closure/compiler.jar

cython:
	@echo "Installing Cython..."
	@-bin/pip install cython

ifeq ($(SANDBOX),1)
ifeq ($(DEBUG),1)
fatcatmap/assets/bootstrap/package.json:
	@echo "Cloning Bootstrap sources..."
	@git clone $(SANDBOX_GIT):sources/dependencies/bootstrap.git ./fatcatmap/assets/bootstrap -b $(BOOTSTRAP_BRANCH)

	@echo "Building Bootstrap..."
	@-cd fatcatmap/assets/bootstrap; \
		npm install; \
		grunt;
else
fatcatmap/assets/bootstrap/package.json:
	@echo "Cloning Bootstrap sources..."
	@git clone /base/sources/dependencies/bootstrap.git ./fatcatmap/assets/bootstrap -b $(BOOTSTRAP_BRANCH)
endif
else
fatcatmap/assets/bootstrap/package.json:
	@echo "Cloning Bootstrap sources from GitHub..."
	@git clone https://github.com/momentum/bootstrap.git ./fatcatmap/assets/bootstrap -b $(BOOTSTRAP_BRANCH)
endif

bootstrap: fatcatmap/assets/bootstrap/package.json
	@echo "Bootstrap is ready."

ifeq ($(DEBUG),1)
gulp: npm
	@-mkdir -p .develop/maps/fatcatmap/assets/js/site
	@-mkdir -p .develop/maps/fatcatmap/assets/coffee/site
	@-gulp
endif
ifeq ($(DEBUG),0)
gulp: npm
	@node_modules/gulp/bin/gulp.js release
endif
