
#
#    fatcatmap: makefile
#


### === VARS === ###

## == defaults == ##
HOST?=127.0.0.1
PORT?=9000
DEBUG?=1
USER?=`whoami`
SANDBOX_GIT?=$(USER)@sandbox
CANTEEN_BRANCH?=master

ifeq ($(DEBUG),0)
LESS_ARGS=--no-ie-compat --include-path=fatcatmap/assets/less:fatcatmap/assets/bootstrap --compress --clean-css -O2
else
LESS_ARGS=--no-ie-compat --include-path=fatcatmap/assets/less:fatcatmap/assets/bootstrap --source-map-basepath=.develop/maps
endif

## == optionals == ##
extensions=on
gevent=off
logbook=off
compass=on
redis=on

## == environment == ##
ENVIRONMENT?=debug
OS?=Mac

ifeq ($(extensions),on)
ifeq ($(gevent),on)
OPTIONALS+=gevent
endif
ifeq ($(logbook),on)
OPTIONALS+=logbook
endif
endif


### === ROUTINES === ###

all: build
run: build devserver

build: develop
	@echo "~~ fcm build completed ~~"

package: develop
	@echo "Making buildroot..."
	@mkdir -p dist/

	@echo "Building source package..."
	@bin/python setup.py sdist

	@echo "Building egg..."
	@bin/python setup.py bdist_egg

	@echo "=== fcm distribution built. ==="

ifeq ($(DEBUG),0)
develop: .develop styles scripts templates bootstrap
	@echo "Updating source dependencies..."
	@echo "Cloning as user $(USER)..."
	@git clone $(SANDBOX_GIT):sources/dependencies/canteen.git $(PWD)/lib/canteen -b $(CANTEEN_BRANCH)
else
develop: .develop styles scripts templates bootstrap
	@echo "Updating source dependencies..."
	@echo "Cloning as user $(USER)..."
	@git clone /base/sources/dependencies/canteen.git $(PWD)/lib/canteen -b $(CANTEEN_BRANCH)
endif

test:
	@pip install nose
	@echo "Running testsuite..."
	@nosetests fatcatmap_tests canteen_tests --no-byte-compile --verbose

coverage:
	@pip install nose
	@echo "Running testsuite (with coverage)..."
	@nosetests fatcatmap_tests canteen_tests --with-coverage \
							 --cover-package=fatcatmap \
							 --cover-package=canteen \
							 --cover-html-dir=.develop/coverage_html \
							 --cover-xml-file=.develop/coverage.xml \
							 --no-byte-compile;

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
	@rm -fr $(PWD)/lib/canteen

	@echo "Cleaning untracked files..."
	@git clean -df

### === dirs === ###
bin: $(PWD)/.env
lib: $(PWD)/.env

### === resources === ###
templates: $(PWD)/.develop
	@echo "Building fcm templates..."

### === defs === ###
$(PWD)/bin/fcm:
	@echo "Symlinking toolchain..."
	@-ln -s $(PWD)/scripts/fcm.py $(PWD)/bin/fcm

$(PWD)/lib/python2.7/site-packages/canteen.pth:
	@echo "$(PWD)/lib/canteen" > lib/python2.7/site-packages/canteen.pth

.develop: bin lib $(PWD)/.env $(PWD)/bin/fcm $(PWD)/lib/python2.7/site-packages/canteen.pth closure $(OPTIONALS)
	@touch ./.env

$(PWD)/.env: npm
	@echo "Initializing virtualenv..."
	@pip install virtualenv
	@virtualenv . --prompt="(fcm)" -q
	@-sed -e 's/printf "%s%s%s" "(fcm)" (set_color normal) (_old_fish_prompt)/printf " %s ^.^ %s %s(fcm)%s  %s " (set_color -b green black) (set_color normal) (set_color -b white black) (set_color normal) (_old_fish_prompt)/g' bin/activate.fish > bin/activate_color.fish
	@-mv bin/activate.fish bin/activate_lame.fish
	@-mv bin/activate_color.fish bin/activate.fish

	@echo "Overriding standard Google paths..."
	@-echo "" > lib/python2.7/site-packages/protobuf-2.5.0-py2.7-nspkg.pth

	@echo "Installing Pip dependencies (this may take awhile)..."
	@-bin/pip install -r ./requirements.txt
	@-mkdir -p .develop
	@-mkdir -p .develop/maps/fatcatmap/assets/{js,less,style,coffee}/site
	@-chmod -R 775 .develop

devserver:
	@echo "Running development server..."
	@web run --companion --port $(PORT) --interface $(HOST)


### === dependencies === ###
ifeq ($(OS),Mac)

gevent: cython
	@echo "Installing Gevent..."
	@-brew install libev
	@-bin/pip install "git+git://github.com/surfly/gevent.git#egg=gevent"

endif

ifeq ($(OS),Linux)

ifeq ($(PLAT),RHEL)
gevent: cython
	@echo "Installing Gevent..."
	@-yum install libev-dev
	@-bin/pip install cython "git+git://github.com/surfly/gevent.git#egg=gevent"
endif

ifeq ($(PLAT),Debian)
gevent: cython
	@echo "Installing Gevent..."
	@-apt-get install libev
	@-bin/pip install cython "git+git://github.com/surfly/gevent.git#egg=gevent"
endif

endif

logbook:
	@echo "Installing Logbook..."
	@-bin/pip install "git+git://github.com/keenlabs/logbook.git#egg=logbook"

ifeq ($(DEBUG),1)
$(PWD)/node_modules: bootstrap
	@echo "Installing NPM dependencies..."
	@-npm install
else
$(PWD)/node_modules: bootstrap
endif

npm: $(PWD)/node_modules

jekyll:
	@echo "Installing Jekyll..."
	@-gem install jekyll --install-dir ./.Gems --no-document

$(PWD)/lib/closure/compiler.jar:
	@echo "Downloading Closure Compiler..."
	@-wget http://dl.google.com/closure-compiler/compiler-latest.zip
	@-mkdir -p $(PWD)/lib/closure

	@echo "Extracting Closure Compiler..."
	@-unzip compiler-latest.zip -d $(PWD)/lib/closure
	@-mv compiler-latest.zip $(PWD)/lib/closure
	@-rm -f compiler-latest.zip

	@-mkdir -p $(PWD)/lib/closure/build;
	@-mv $(PWD)/lib/closure/compiler.jar $(PWD)/lib/closure/build/compiler.jar;

closure: $(PWD)/lib/closure/compiler.jar

cython:
	@echo "Installing Cython..."
	@-bin/pip install cython

ifeq ($(DEBUG),1)
fatcatmap/assets/bootstrap/package.json:
	@echo "Cloning Bootstrap sources..."
	@git clone $(SANDBOX_GIT):sources/dependencies/bootstrap.git ./fatcatmap/assets/bootstrap

	@echo "Building Bootstrap..."
	@-cd fatcatmap/assets/bootstrap; \
		npm install; \
		grunt;
else
fatcatmap/assets/bootstrap/package.json:
	@echo "Cloning Bootstrap sources..."
	@git clone /base/sources/dependencies/bootstrap.git ./fatcatmap/assets/bootstrap
endif

bootstrap: fatcatmap/assets/bootstrap/package.json
	@echo "Bootstrap is ready."

ifeq ($(DEBUG),1)
grunt:
	@-mkdir -p .develop/maps/fatcatmap/assets/js/site
	@-mkdir -p .develop/maps/fatcatmap/assets/coffee/site
	@grunt
endif
ifeq ($(DEBUG),0)
grunt:
	@grunt release
endif
