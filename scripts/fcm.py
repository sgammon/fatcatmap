#!/usr/bin/env python
# -*- coding: utf-8 -*-

__doc__ = '''

    fcm: development toolchain

'''

__version__ = (0, 0, 1)
__author__ = "Sam Gammon <sam@momentum.io>"


# stdlib
import os, sys, time, subprocess, StringIO

project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'lib'))
sys.path.insert(0, os.path.join(project_root, 'lib/canteen'))
sys.path.insert(0, os.path.join(project_root, 'fatcatmap'))
sys.path.insert(0, os.path.join(project_root, 'fatcatmap/lib'))

# fatcatmap :)
import fatcatmap
from fatcatmap import config
from fatcatmap import logic
from fatcatmap import pages
from fatcatmap import services
from fatcatmap import templates

# preload all the things
from fatcatmap.logic import *
from fatcatmap.pages import *
from fatcatmap.config import *
from fatcatmap.services import *
from fatcatmap.templates import *

# canteen util
from canteen.util import cli, debug


## Globals
logging = debug.Logger(name='fcm')
UWSGI_BASE_ARGS, UWSGI_PROD_ARGS = [
  "--pcre-jit",
  "--vacuum",
  "--py-autoreload",
  "--pidfile=/tmp/fcm.pid",
  "--wsgi=dispatch:application",
  "--shared-import=fatcatmap",
  "--shared-import=werkzeug",
  "--shared-import=canteen",
  "--shared-import=jinja2",
], [
  "--optimize",
  "--uwsgi=127.0.0.1:3000"
]


class FCM(cli.Tool):

  ''' Minimal toolchain for managing and developing a
      canteen-based web application. '''

  arguments = (
    ('--debug', '-d', {'action': 'store_true', 'help': 'run in debug mode'}),
    ('--quiet', '-q', {'action': 'store_true', 'help': 'suppress most output'}),
    ('--verbose', '-v', {'action': 'count', 'help': 'output a lot of useful info'}),
    ('--version', '-V', {'action': 'version', 'help': 'print version and exit', 'version': 'webtool %s' % '.'.join(map(unicode, __version__))})
  )

  ## == Bound Commands == ##
  class Run(cli.Tool):

    ''' Runs the local devserver. '''

    arguments = (
      ('--ip', '-i', {'type': str, 'help': 'address to bind to'}),
      ('--port', '-p', {'type': int, 'help': 'port to bind to'}),
      ('--legacy', '-l', {'action': 'store_true', 'help': 'run legacy flask-based Keen-Web'}),
      ('--services_only', '-s', {'action': 'store_true', 'help': 'run services only'}),
      ('--nocache', '-nc', {'action': 'store_true', 'help': 'disable static caching (takes precedence)'}),
      ('--profile', '-pr', {'action': 'store_true', 'help': 'attach a python profiler for each request/response'}),
      ('--callgraph', '-cg', {'action': 'store_true', 'help': 'generate a callgraph for each request/response'}),
      ('--companion', '-c', {'action': 'store_true', 'help': 'run the dev companion alongside the devserver'}),
      ('--companion-port', '-cp', {'action': 'store_true', 'help': 'change the port the companion should run on'})
    )

    def execute(arguments):

      ''' Execute the ``fcm run`` tool, given a set of arguments packaged
          as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()`` call,
          dispatched by ``apptools`` or manually.

          :returns: Python value ``True`` or ``False`` depending on the
          result of the call. ``Falsy`` return values will be passed to
          :py:meth:`sys.exit` and converted into Unix-style return codes. '''

      import fatcatmap, canteen
      from fatcatmap.config import config

      if arguments.companion:
        dev_companion = companion.go()

      canteen.run(fatcatmap, **{
        'port': arguments.port or 5000,
        'interface': arguments.ip or '127.0.0.1',
        'config': config or {}
      })


  class Companion(cli.Tool):

    ''' Runs a small dev companion. '''

    arguments = (
      ('--ip', '-i', {'type': str, 'help': 'address to bind to'}),
      ('--port', '-p', {'type': int, 'help': 'port to bind to'}),
      ('--watch', '-w', {'action': 'store_true', 'help': 'watch static assets and compile on-the-fly'})
    )

    def execute(arguments=None):

      ''' Run the local Development Companion, which is a small
          WSGI server that serves up various resources that are
          useful during development, in a second-screen kind of
          scenario.

          These tools are usually something like:
          - Bootstrap, skinned to your liking
          - HAML/alternate template syntax reference
          - Canteen docs
          - Live code execution for debugging
          And so on.

          :param arguments: Argument set passed in from
          :py:mod:`argparse`. '''

      companion.go()


  class Test(cli.Tool):

    ''' Runs the local testsuite. '''

    arguments = (
      ('--profile', {'action': 'store_true', 'help': 'profile while testing'}),
      ('--coverage', {'action': 'store_true', 'help': 'collect coverage while testing'}),
      ('--cover-tests', {'action': 'store_true', 'help': 'collect coverage for tests themselves'})
    )

    def execute(arguments):

      ''' Execute the ``web test`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``apptools`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      import pdb; pdb.set_trace()


  class Build(cli.Tool):

    ''' Builds local sources. '''

    arguments = (
      ('--gzip', {'action': 'store_true', 'help': 'pre-gzip assets'}),
      ('--sass', {'action': 'store_true', 'help': 'collect/compile SASS'}),
      ('--scss', {'action': 'store_true', 'help': 'collect/compile SCSS'}),
      ('--less', {'action': 'store_true', 'help': 'collect/compile LESS'}),
      ('--coffee', {'action': 'store_true', 'help': 'collect/compile CoffeeScript'}),
      ('--closure', {'action': 'store_true', 'help': 'preprocess JS with closure compiler'}),
      ('--templates', {'action': 'store_true', 'help': 'compile and optimize jinja2 templates'})
    )

    def execute(arguments):

      ''' Execute the ``web build`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``apptools`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      if arguments.templates:

        logging.info('Compiling app templates...')

        from scripts import compile_templates

        # delete existing templates first, if any
        logging.info('Cleaning existing template path...')
        module_root = os.path.join(project_root, "fatcatmap", "templates")

        clean_command = "rm -fr %s" % os.path.join(module_root, "compiled", "*")
        if config.get('debug', False):
          logging.debug('Executing command: "%s".' % clean_command)
        os.system(clean_command)

        # run the template compiler
        try:
          result = compile_templates.run()
        except:
          logging.error('An exception was encountered while compiling templates.')
          raise
        else:
          logging.info('Templates compiled successfully.')


  class Shell(cli.Tool):

    ''' Runs a local or simulated production shell. '''

    arguments = (
      ('--production', '-p', {'action': 'store_true', 'help': 'simulate production'}),
    )

    def execute(arguments):

      ''' Execute the ``fcm shell`` tool, given a set of arguments packaged
          as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()`` call,
          dispatched by ``canteen`` or manually.

          :returns: Python value ``True`` or ``False`` depending on the
          result of the call. ``Falsy`` return values will be passed to
          :py:meth:`sys.exit` and converted into Unix-style return codes. '''

      # assemble uWSGI arguments
      uwsgi_args = [

        # uwsgi path
        os.path.join(project_root, 'bin', 'uwsgi'),

        # base interactive flags
        "--socket=/tmp/fcm.sock",
        "--pyshell"

      ] + UWSGI_BASE_ARGS + (UWSGI_PROD_ARGS if arguments.production else [])

      try:
        # spawn uWSGI
        shell = subprocess.Popen(uwsgi_args,
          stdin=sys.stdin,
          stdout=sys.stdout,
          stderr=sys.stderr
        )

        returncode = shell.wait()

      except KeyboardInterrupt:
        shell.terminate()
        time.sleep(1)  # sleep a second to let console shut up
      sys.stdin, sys.stdout, sys.stderr = (StringIO.StringIO() for x in (0, 1, 2))


  class Deploy(cli.Tool):

    ''' Deploys code to prod/staging. '''

    arguments = (
      ('env', {'choices': ('sandbox', 'staging', 'production'), 'help': 'environment to deploy to'}),
      ('dc', {'choices': ('dal', 'sj'), 'help': 'datacenter to deploy to (defaults to both)'}),
      ('--assets', {'action': 'store_true', 'help': 'only deploy static assets'}),
      ('--notest', {'action': 'store_true', 'help': 'don\'t run tests before deploying (DANGEROUS!)'})
    )

    def execute(arguments):

      ''' Execute the ``web deploy`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``apptools`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      import pdb; pdb.set_trace()


if __name__ == '__main__':
  FCM(autorun=True)  # initialize and run :)
