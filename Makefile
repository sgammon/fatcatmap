
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


SHELL := /bin/bash


### === VARS === ###

## == defaults == ##
BREW?=1
DEBUG?=1
SANDBOX?=0
BUILDBOX?=0
USER?=`whoami`
CANTEEN?=0
CANTEEN_BRANCH?=master
SANDBOX_GIT?=$(USER)@sandbox
BREWDEPS=openssl python haproxy redis pypy snappy hiredis elixir scala lua luajit node npm
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


## Colors + Texts
STOP=\x1b[;0m
RED=\x1b[31;01m
GREEN=\x1b[32;01m
CYAN=\x1b[36;01m
YELLOW=\x1b[33;01m
MAGENTA=\x1b[35;01m

OK=$(GREEN)[OK]$(STOP)
ERROR=$(RED)[ERROR]$(STOP)
WARN=$(YELLOW)[WARN]$(STOP)


## Functions
define say
	@printf "$(CYAN)"
	@echo $1
	@printf "$(STOP)"
endef

define okay
	@printf "$(GREEN)"
	@echo $1 $2
	@printf "$(STOP)"
endef

define warn
	@printf "$(YELLOW)"
	@echo $1 $2
	@printf "$(STOP)"
endef

define error
	@printf "$(RED)"
	@echo $1 $2
	@printf "$(STOP)"
endef



### === ROUTINES === ###

all: build
run: build devserver

build: develop
	$(call okay,"~~ fcm ready ~~")

package: develop
	$(call say,"Making buildroot...")
	@mkdir -p dist/

	$(call say,"Building source package...")
	@bin/python setup.py sdist

	$(call say,"Building egg...")
	@bin/python setup.py bdist_egg

	@echo "~~~ $(GREEN)fcm distribution built.$(STOP) ~~~"

develop: .develop js styles templates coverage

canteen: lib/canteen

js: npm
	$(call say,"Minifying Javascript...")
	@-JAVA_HOME=$$JAVA_HOME node_modules/gulp/bin/gulp.js closure

styles:
	$(call say,"Compiling Sass...")
	@-JAVA_HOME=$$JAVA_HOME node_modules/gulp/bin/gulp.js sass

ifeq ($(BREW),1)
brew:
	$(call say,"Brewing for Mac...")
	@-which brew > /dev/null && brew install $(BREWDEPS) 2> /dev/null
else
brew:
	$(call warn,"Skipping brew.")
endif

ifneq ($(CANTEEN),0)
lib/canteen:
	$(call say,"Linking in Canteen...")
	-@ln -s $(CANTEEN) lib/canteen
else
ifeq ($(SANDBOX),1)
lib/canteen:
	$(call say,"Cloning Canteen from sandbox...")
	@git clone $(SANDBOX_GIT):sources/dependencies/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
ifeq ($(DEBUG),1)
else
lib/canteen:
	$(call say,"Updating source dependencies...")
	@git clone /base/sources/dependencies/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
endif
else
lib/canteen:
	$(call say,"Updating source dependencies from GitHub...")
	@git clone https://github.com/momentum/canteen.git $(LIBROOT)/canteen -b $(CANTEEN_BRANCH)
endif
endif

test:
	@-bin/python -c "import nose" > /dev/null 2> /dev/null || @-bin/pip install --upgrade nose coverage

	$(call say,"Running Python app testsuite...")
	@-bin/nosetests canteen_tests fatcatmap_tests $(TEST_FLAGS)

	$(call say,"Running javascript testsuite...")
	@-JAVA_HOME=$$JAVA_HOME ENV=$(ENVIRONMENT) gulp test
	$(call okay,"~~~ tests ran successfully. ~~~")

coverage:
	@-bin/python -c "import nose" || @-bin/pip install --upgrade nose coverage
	$(call say,"Generating test coverage information...")
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
	$(call error,"Deployment is not currently supported from dev. Check back later.")

clean:
	$(call say,"Cleaning ephemeral files...")
	@echo "Cleaning object files..."
	@find . -name "*.pyc" -exec rm -f {} \;
	@find . -name "*.pyo" -exec rm -f {} \;

	@echo "Cleaning SASS cache..."
	@rm -fr .sass-cache

distclean: clean
	$(call say,"Cleaning codebase...")

	@echo "Removing development root..."
	@rm -fr .develop

	@echo "Cleaning gemroot..."
	@rm -fr .Gems

	@echo "Cleaning virtualenv..."
	@rm -fr .Python bin/ include/ lib/ config.rb ./.env .develop .sass-cache .less-cache

	@echo "Cleaning bootstrap..."
	@rm -fr fatcatmap/assets/bootstrap;

	@echo "Cleaning NPM dependencies..."
	@rm -fr node_modules

forceclean: distclean
	$(call say,"Resetting codebase...")
	@git reset --hard

	@echo "Cleaning libraries..."
	@rm -fr $(LIBROOT)/canteen

	@echo "Cleaning untracked files..."
	@git clean -df

	$(call okay,"Codebase cleaned.")

### === dirs === ###
bin: $(DEVROOT)/.env
lib: $(DEVROOT)/.env

### === resources === ###
templates: $(DEVROOT)/.develop
	$(call say,"Building fcm templates...")
	@-mkdir -p fatcatmap/templates/compiled
	@bin/python $(DEVROOT)/scripts/fcm.py build --templates

### === defs === ###
$(DEVROOT)/bin/fcm:
	$(call say,"Symlinking toolchain...")
	@-ln -s $(DEVROOT)/scripts/fcm.py $(DEVROOT)/bin/fcm

$(DEVROOT)/lib/python2.7/site-packages/canteen.pth:
	@echo "$(DEVROOT)/lib/canteen" > lib/python2.7/site-packages/canteen.pth

.develop: brew bin lib $(DEVROOT)/.env cython $(DEVROOT)/bin/fcm canteen $(DEVROOT)/lib/python2.7/site-packages/canteen.pth gulp $(OPTIONALS)
	@touch ./.env

$(DEVROOT)/.env: canteen npm
	@echo "Using devroot $(DEVROOT)..."
	$(call say,"Initializing virtualenv...")
	@-pip install virtualenv
	@virtualenv $(DEVROOT) --prompt="(fcm)" -q
	@-sed -e 's/printf "%s%s%s" "(fcm)" (set_color normal) (_old_fish_prompt)/printf " %s ^.^ %s %s(fcm)%s  %s " (set_color -b green black) (set_color normal) (set_color -b white black) (set_color normal) (_old_fish_prompt)/g' bin/activate.fish > bin/activate_color.fish
	@-mv bin/activate.fish bin/activate_lame.fish
	@-mv bin/activate_color.fish bin/activate.fish

	@echo "Overriding standard Google paths..."
	@-echo "" > lib/python2.7/site-packages/protobuf-2.5.0-py2.7-nspkg.pth

	$(call say,"Installing Canteen dependencies...")
	@bin/pip install msgpack-python
	@bin/pip install "git+https://github.com/sgammon/protobuf.git#egg=protobuf-2.5.2-canteen"
	@bin/pip install "git+https://github.com/sgammon/hamlish-jinja.git#egg=hamlish_jinja-0.3.4-canteen"
	@bin/pip install --upgrade -r lib/canteen/requirements.txt
	@bin/pip install --upgrade -r lib/canteen/dev_requirements.txt

	$(call say,"Installing Pip dependencies...")
	@-bin/pip install --upgrade -r ./requirements.txt
	@-mkdir -p .develop
	@-mkdir -p .develop/maps/fatcatmap/assets/{js,sass,style}/site
	@-chmod -R 775 .develop

	$(call say,"Building Canteen...")
	-@cd lib/canteen; $(MAKE) BUILDROOT=$(LIBROOT)/canteen/ BINPATH=$(DEVROOT)/bin/ DEPS=0 VIRTUALENV=0 TESTS=0 package


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

$(DEVROOT)/node_modules:
	$(call say,"Installing NPM dependencies...")
	@-npm install

npm: $(DEVROOT)/node_modules

cython:
	$(call say,"Installing Cython...")
	@-bin/pip install cython

ifeq ($(DEBUG),1)
gulp: npm
	@-JAVA_HOME=$$JAVA_HOME gulp
endif
ifeq ($(DEBUG),0)
gulp: npm
	@-JAVA_HOME=$$JAVA_HOME node_modules/gulp/bin/gulp.js release
endif
