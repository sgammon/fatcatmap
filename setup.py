# -*- coding: utf-8 -*-

'''

  fcm setup

'''

# setuptools
import os, sys, logging, setuptools as tools


## Logging
log = logging.getLogger('fatcatmap.setup')
log_handler = logging.StreamHandler(sys.stdout)
log.addHandler(log_handler), log.setLevel(logging.DEBUG if __debug__ else logging.WARNING)

try:
  from colorlog import ColoredFormatter
except ImportError:
  log.debug('No support found for `colorlog`. No colors for u.')
else:
  log_handler.setFormatter(ColoredFormatter(
    "%(log_color)s[%(levelname)s]%(reset)s %(message)s",
    datefmt=None, reset=True, log_colors={
      'DEBUG':    'cyan',
      'INFO':     'green',
      'WARNING':  'yellow',
      'ERROR':    'red',
      'CRITICAL': 'red'
    }))


requirements = []
with open(os.path.join(os.path.dirname(__file__), 'requirements.txt')) as requirements_file:
  requirements += [line for line in requirements_file]


## Environment checks
tools.setup(
      name="fatcatmap",
      version="0.1-alpha",
      description="coming soon to a riot near you",
      author="momentum labs",
      author_email="info@momentum.io",
      url="https://fatcatmap.org",
      zip_safe=True,
      packages=[
        "fatcatmap",
        "fatcatmap.ops",
        "fatcatmap.logic",
        "fatcatmap.logic.db",
        "fatcatmap.logic.grapher",
        "fatcatmap.models",
        "fatcatmap.services",
        "fatcatmap.analyzer"
      ] + [
        "fatcatmap_tests",
        "fatcatmap_tests.app_tests"
      ] if __debug__ else [],
      install_requires=requirements,
      dependency_links=(
        "git+git://github.com/sgammon/canteen.git#egg=canteen",
        "git+git://github.com/sgammon/protobuf.git#egg=protobuf",
        "git+git://github.com/sgammon/hamlish-jinja.git#egg=hamlish_jinja"
      ),
      tests_require=("nose",)
)
