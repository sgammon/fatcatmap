#!/usr/bin/env python
# -*- coding: utf-8 -*-

__doc__ = '''

    fcm: development toolchain

'''

__version__ = (0, 0, 1)
__author__ = "Sam Gammon <sam@momentum.io>"


# stdlib
import os, sys, time, urllib2, base64, collections, subprocess, StringIO

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

try:
  import cStringIO as StringIO
except ImportError:
  import StringIO


## Globals
logging = debug.Logger(name='fcm')
dataset = 'fcm-dev/redis-data/backup-v1.aof'
project_root = os.path.dirname(os.path.dirname(__file__))
UWSGI_BASE_ARGS, UWSGI_PROD_ARGS = [
  "--pcre-jit",
  "--vacuum",
  "--py-autoreload",
  "--pidfile=/tmp/fcm.pid",
  "--wsgi=dispatch:application",
  "--shared-import=fatcatmap",
  "--shared-import=werkzeug",
  "--shared-import=canteen",
  "--shared-import=jinja2"], [
  "--optimize",
  "--uwsgi=127.0.0.1:3000"]


class FCM(cli.Tool):

  ''' Minimal toolchain for managing and developing a
      canteen-based web application. '''

  arguments = (
    ('--debug', '-d', {'action': 'store_true', 'help': 'run in debug mode'}),
    ('--quiet', '-q', {'action': 'store_true', 'help': 'suppress most output'}),
    ('--verbose', '-v', {'action': 'count', 'help': 'output a lot of useful info'}),
    ('--version', '-V', {'action': 'version', 'help': 'print version and exit', 'version': 'webtool %s' % '.'.join(map(unicode, __version__))}))

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
      ('--callgraph', '-cg', {'action': 'store_true', 'help': 'generate a callgraph for each request/response'}))

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

      canteen.run(fatcatmap, **{
        'port': arguments.port or 5000,
        'interface': arguments.ip or '127.0.0.1',
        'config': config or {}
      })


  class Test(cli.Tool):

    ''' Runs the local testsuite. '''

    arguments = (
      ('--profile', {'action': 'store_true', 'help': 'profile while testing'}),
      ('--coverage', {'action': 'store_true', 'help': 'collect coverage while testing'}),
      ('--cover-tests', {'action': 'store_true', 'help': 'collect coverage for tests themselves'}))

    def execute(arguments):

      ''' Execute the ``fcm test`` tool, given a set of arguments
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
      ('--templates', {'action': 'store_true', 'help': 'compile and optimize jinja2 templates'}))

    def execute(arguments):

      ''' Execute the ``fcm build`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``apptools`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      if arguments.templates:

        from fatcatmap.config import config
        from canteen.logic.template import TemplateCompiler

        logging.info('Compiling app templates...')

        # delete existing templates first, if any
        logging.info('Cleaning existing template path...')
        module_root = os.path.join(project_root, "fatcatmap", "templates")

        clean_command = "rm -fr %s" % os.path.join(module_root, "compiled", "*")
        if config.get('debug', False):
          logging.debug('Executing command: "%s".' % clean_command)
        os.system(clean_command)

        try:
          # /scripts
          root = os.path.dirname(os.path.abspath(os.path.realpath(__file__)))

          # /
          root = os.path.dirname(root)

          module, sources, target = (
            root + '/fatcatmap/templates',
            root + '/fatcatmap/templates/source',
            root + '/fatcatmap/templates/compiled')

          return TemplateCompiler(*(
            module, sources, target, config, 'fatcatmap.templates'))()

        except:
          logging.error('An exception was encountered while '
                        ' compiling templates.')
          raise
        else:
          logging.info('Templates compiled successfully.')


  class Shell(cli.Tool):

    ''' Runs a local or simulated production shell. '''

    arguments = (
      ('--production', '-p', {'action': 'store_true', 'help': 'simulate production'}),)

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
      ('--notest', {'action': 'store_true', 'help': 'don\'t run tests before deploying (DANGEROUS!)'}))

    def execute(arguments):

      ''' Execute the ``fcm deploy`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``canteen`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      import pdb; pdb.set_trace()


  class Migrate(cli.Tool):

    ''' Migrates data in/out of underlying storage. '''

    arguments = (
      ('--source', {'type': str, 'help': 'adapter to migrate from'}),
      ('--target', {'type': str, 'help': 'adapter to migrate to'}),
      ('--binding', {'type': str, 'help': 'binding name to convert with, if any'}),
      ('--kinds', {'type': str, 'help': 'kinds to transfer, comma-delimited (no spaces)'}),
      ('--update', {'action': 'store_true', 'help': 'download latest dataset package'}))

    def execute(arguments):

      ''' Execute the ``fcm migrate`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``canteen`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      from canteen import model
      from canteen.model.adapter.redis import RedisAdapter
      from fatcatmap.logic.db.adapter import RedisWarehouse

      logging.info('Performing data migration...')

      data_dir = os.path.join(project_root, '.develop', 'data')
      data_file = os.path.join(data_dir, 'latest.aof')

      if arguments.update and (not os.path.isdir(data_dir) or not os.path.isfile(data_file)):

        logging.info('---- Updating local dataset... ----')

        # make target path
        if not os.path.isdir(data_dir):
          os.makedirs(data_dir)

        logging.info('Downloading %s...' % 'https://%s' % dataset)
        f = urllib2.urlopen('https://storage.googleapis.com/%s' % dataset)
        with open(data_file) as target:
          logging.info('Writing...')
          target.write(data.read())        
        
        logging.info('---- Dataset update complete. ----')

      logging.info('Reading from migration source...')

      _adapters = {
        'RedisAdapter': RedisAdapter,
        'RedisWarehouse': RedisWarehouse}

      source = arguments.source and _adapters.get(arguments.source)
      target = arguments.target and _adapters.get(arguments.target)

      # grab all keys
      source_a, target_a = source(), target()

      if not arguments.kinds:
        source_keys = source.execute(source.Operations.KEYS, '__meta__')
      else:
        source_keys = []
        for kind in arguments.kinds.split(','):
          source_keys += source.execute(source.Operations.SET_MEMBERS, '__meta__', )

      found_keys = []

      logging.info('Found %s keys. Beginning migration...' % len(source_keys))

      for key in source_keys:

        # skip meta/index keys
        if key.startswith('__'):
          logging.info('-- Skipping key "%s"...' % key)
          continue

        try:
          unicode(key)
          base64.b64decode(key)
          model.Key(urlsafe=key)
        except:
          continue

        logging.info('-- Processing key "%s"...' % key)
        found_keys.append(key)

      logging.info('Found %s object keys. Transferring...' % len(found_keys))

      _keys, _by_kind = 0, collections.defaultdict(lambda: 0)
      with source.channel('__meta__').pipeline() as pipeline:

        _filtered_keys = []
        for key in found_keys:

          k = model.Key(urlsafe=key).kind
          if (arguments.kinds and k in arguments.kinds.split(',')) or not arguments.kinds:
            _keys += 1
            _by_kind[model.Key(urlsafe=key).kind] += 1
            source.get(model.Key(urlsafe=key).flatten(True), pipeline=pipeline)
            logging.info('-- Queueing key "%s"...' % key)
            _filtered_keys.append(key)

        logging.debug('Entity type report (%s entities total):' % _keys)
        for type in _by_kind:
          logging.debug('-- "%s": %s entities' % (type, str(_by_kind[type])))

        logging.info('Continuing in 3 seconds...')
        time.sleep(3)

        _keys, _by_kind = {}, collections.defaultdict(lambda: 0)
        for key, result in zip(_filtered_keys, pipeline.execute()):
          if result is not None:
            logging.info('-- Fetched object at key "%s" of type "%s"...' % (
              key, model.Key(urlsafe=key).kind))
            _keys[key] = result
            _by_kind[model.Key(urlsafe=key).kind] += 1
          else:
            logging.info('-- !! FETCH FAILED for key "%s"...' % key)

        logging.info('Total of %s successfully packed objects.' % len(_keys))
        logging.info('Loading bindings...')

        from fatcatmap import bindings
        logging.info('Found %s model binding categories.' % len(bindings._bindings))

        if arguments.binding:
          logging.info('Using bindings from category "%s"...' % arguments.binding)

        logging.info('Beginning write in 3 seconds...')
        time.sleep(3)

        with target.channel('__meta__').pipeline() as pipeline:

          _written, _by_kind = 0, collections.defaultdict(lambda: 0)
          for key, entity in _keys.iteritems():

            kind = model.Key(urlsafe=key).kind

            logging.info('-- Queueing object write at key "%s" of type "%s"...' % (
              key, kind))

            if arguments.binding:
              # resolve binding
              if kind not in bindings._bindings[arguments.binding]:
                raise RuntimeError('Binding category "%s" has no binding for model'
                                   ' "%s".' % (arguments.binding, kind))

              _e = bindings._bindings[arguments.binding][kind]().convert(source.EngineConfig.serializer.loads(entity))

            else:
              obj = source.EngineConfig.serializer.loads(entity)
              _e = target.get(key=None, _entity=obj)

            target.put(model.Key(urlsafe=key).flatten(True), _e, _e.__class__, pipeline=pipeline)

            _written += 1
            _by_kind[kind] += 1

          import pdb; pdb.set_trace()
          pipeline.execute()  # go

          logging.info('Written entity report (%s objects total):' % str(_written))
          for kind in _by_kind:
            logging.debug('-- "%s": %s entities' % (kind, str(_by_kind[kind])))

      logging.info('Migration complete.')


if __name__ == '__main__': FCM(autorun=True)  # initialize and run :)
