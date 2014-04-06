
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

ifeq ($(DEBUG),0)
LESS_ARGS=--no-ie-compat --include-path=fatcatmap/assets/less:fatcatmap/assets/bootstrap --compress --clean-css -O2
else
LESS_ARGS=--no-ie-compat --include-path=fatcatmap/assets/less:fatcatmap/assets/bootstrap
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

develop: .develop styles scripts templates bootstrap
	@echo "Updating source dependencies..."
	@echo "Cloning as user `whoami`..."
	@git clone git@bitbucket.org:momentumlabs/canteen-py.git $(PWD)/lib/canteen -b sgammon/workspace
	@git submodule update --init

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
	@rm -fr .Python bin/ include/ lib/ config.rb .env .develop .sass-cache .less-cache

forceclean: distclean
	@echo "Resetting codebase..."
	@git reset --hard

	@echo "Cleaning libraries..."
	@rm -fr $(PWD)/lib/canteen

	@echo "Cleaning untracked files..."
	@git clean -df

### === dirs === ###
bin: .env
lib: .env

### === resources === ###
styles: npm .develop
	@echo "Building fcm styles..."
	@lessc $(LESS_ARGS) fatcatmap/assets/less/core/common.less > fatcatmap/assets/style/common.css
	@lessc $(LESS_ARGS) fatcatmap/assets/less/site/home.less > fatcatmap/assets/style/site/home.css
	@lessc $(LESS_ARGS) fatcatmap/assets/less/themes/fcm-dark.less > fatcatmap/assets/style/themes/fcm-dark.css
	@lessc $(LESS_ARGS) fatcatmap/assets/less/themes/fcm-light.less > fatcatmap/assets/style/themes/fcm-light.css

scripts: npm .develop
	@echo "Building fcm scripts..."

templates: npm .develop
	@echo "Building fcm templates..."

### === defs === ###
.develop/: bin lib .env closure $(OPTIONALS)
	@echo "Installing Pip dependencies (this may take awhile)..."
	@-bin/pip install -r ./requirements.txt --log requirements.log
	@mkdir .develop
	@chmod -R 775 .develop
	@touch .env

.env:
	@echo "Initializing virtualenv..."
	@pip install virtualenv
	@virtualenv . --prompt="(fcm)" -q
	@-sed -e 's/printf "%s%s%s" "(fcm)" (set_color normal) (_old_fish_prompt)/printf " %s ^.^ %s %s(fcm)%s  %s " (set_color -b green black) (set_color normal) (set_color -b white black) (set_color normal) (_old_fish_prompt)/g' bin/activate.fish > bin/activate_color.fish
	@-mv bin/activate.fish bin/activate_lame.fish
	@-mv bin/activate_color.fish bin/activate.fish

	@echo "Symlinking toolchain..."
	@-ln -s $(PWD)/scripts/fcm.py $(PWD)/bin/fcm
	@echo "$(PWD)/lib/canteen" > lib/python2.7/site-packages/canteen.pth

	@echo "Overriding standard Google paths..."
	@-echo "" > lib/python2.7/site-packages/protobuf-2.5.0-py2.7-nspkg.pth

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

node_modules:
	@echo "Installing NPM dependencies..."
	@-npm install

npm: node_modules

grunt:
	@echo "Installing Grunt..."
	@-npm install grunt

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

closure: $(PWD)/lib/closure/compiler.jar

cython:
	@echo "Installing Cython..."
	@-bin/pip install cython

fatcatmap/assets/bootstrap:
	@echo "Cloning Bootstrap sources..."
	@git clone $(SANDBOX_GIT):twbs/bootstrap.git ./fatcatmap/assets/bootstrap

	@echo "Building Bootstrap..."
	@cd fatcatmap/assets/bootstrap; \
		npm install; \
		grunt;

bootstrap: fatcatmap/assets/bootstrap
	@echo "Bootstrap is ready."
