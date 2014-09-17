#!/usr/bin/env python
# -*- coding: utf-8 -*-

__doc__ = '''

    fcm: development toolchain

'''

__version__ = (0, 0, 1)
__author__ = "Sam Gammon <sam@momentum.io>"


# stdlib
import os, sys, time, inspect, urllib2, select
import base64, collections, subprocess, StringIO

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

# migrate dependencies
from canteen import model
from fatcatmap import models, bindings
from canteen.model.adapter.redis import RedisAdapter
from fatcatmap.logic.db.adapter import RedisWarehouse

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
        'config': config or {}})


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
          stderr=sys.stderr)

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

    # @TODO(sgammon): waiting to do something here on upstream support for listing adapters
    adapters = {
      'RedisAdapter': RedisAdapter,
      'RedisWarehouse': RedisWarehouse}

    arguments = (
      ('--source', {'type': str, 'help': 'adapter to migrate from'}),
      ('--target', {'type': str, 'help': 'adapter to migrate to'}),
      ('--binding', {'type': str, 'help': 'binding name to convert with, if any'}),
      ('--kinds', {'type': str, 'help': 'kinds to transfer, comma-delimited (no spaces)'}),
      ('--dataset', {'type': str, 'help': 'specify package name/version to update to - corresponds to package/version in GS'}),
      ('--clean', {'action': 'store_true', 'help': 'clean all data from target adapter (DANGEROUS!)'}),
      ('--fixtures', {'action': 'store_true', 'help': 'run fixtures against target (before transfer, if any)'}),
      ('--update', {'action': 'store_true', 'help': 'download latest dataset package (applies to source if any, else target)'}))

    @staticmethod
    def build_cli_args(arguments, adapter):

      '''  '''

      config = adapter.config['servers'][adapter.config['servers']['default']]

      args = []
      for item, value in config.iteritems():
        args.append({
          'host': lambda v: ('h', v),
          'port': lambda v: ('p', v),
          'socket': lambda v: ('s', v),
          'password': lambda v: ('a', v),
          'database': lambda v: ('n', v)}[item](value))
      return " ".join(map(lambda arg: "-%s %s" % arg, args))

    @staticmethod
    def resolve_adapters(arguments):

      '''  '''

      logging.info('Resolving adapters for migration...')
      source = arguments.source and FCM.Migrate.adapters[arguments.source]
      target = FCM.Migrate.adapters[arguments.target or 'RedisWarehouse']

      if source:
        logging.info('Selected source adapter %s...' % source.__name__)
      logging.info('Selected target adapter %s...' % target.__name__)

      return source() if source else None, target()  # construct adapters

    @staticmethod
    def clean_data(arguments, target):

      '''  '''

      assert arguments.clean
      logging.info('Cleaning target storage...')
      target.execute(target.Operations.FLUSH_ALL, '__meta__')

    @staticmethod
    def apply_update(arguments, target):

      '''  '''

      # select a data package
      if not arguments.dataset:
        logging.info('Using latest AOF data package...')
        data_file_name = 'latest.aof.gz'
      else:
        logging.info('Using AOF data package "%s"...' % arguments.dataset)
        data_file_name = '.'.join((arguments.dataset, 'aof', 'gz'))

      logging.info('Starting dataset update...')

      command = ' | '.join((
        'curl --progress-bar https://storage.googleapis.com/fcm-dataset/%s' % data_file_name,
        'gzip -cd',
        'redis-cli %s --pipe' % FCM.Migrate.build_cli_args(arguments, target)))

      os.system(command)

      logging.info('Dataset update complete.')

    @staticmethod
    def apply_fixtures(arguments, target):

      '''  '''

      _dependencies = collections.defaultdict(lambda: set())
      logging.info('Applying fixtures to target...')

      _fixtures_c, _fixtures_by_kind = 0, collections.defaultdict(lambda: 0)
      with target.channel('__meta__').pipeline() as pipeline:

        for fixtureset in models.fixtures:
          logging.info('Applying fixtures for model "%s"...' % fixtureset.__name__)
          desc = fixtureset.__description__

          for obj in fixtureset.fixture():
            if not isinstance(obj, (tuple, list)):
              obj = [obj]

            for _obj in obj:
              logging.info('-- Storing fixture of type "%s" at key "%s"...' % (_obj.key.kind, _obj.key.urlsafe()))
              target._put(_obj, pipeline=pipeline)

            _fixtures_c += 1
            _fixtures_by_kind[_obj.key.kind] += 1

        logging.info('Fixture report (%s entities total):' % _fixtures_c)
        for _kind in _fixtures_by_kind:
          logging.info('-- %s: %s entities' % (_kind, _fixtures_by_kind[_kind]))

        pipeline.execute()
        logging.info('Fixtures applied with great success.')

    @staticmethod
    def read_sources(arguments, source):

      '''  '''

      logging.info('Reading from migration source...')
      source_keys, found_keys = [], []

      # retrieve keys
      if not arguments.kinds:
        source_keys = source.execute(source.Operations.KEYS, '__meta__')
      else:
        # if kinds are requested, merge target kind indexes
        for kind in arguments.kinds.split(','):
          source_keys += source.execute(source.Operations.SET_MEMBERS, '__meta__', '::'.join((
            '__kind__', kind)))

      logging.info('Found %s keys. Beginning migration...' % len(source_keys))

      for key in source_keys:
        # skip meta/index keys
        if key.startswith('__'):
          logging.info('-- Skipping key "%s"...' % key)
          continue

        # if the boot fits...
        try:
          unicode(key)
          base64.b64decode(key)
          model.Key(urlsafe=key)
        except: continue

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

        _objects, _by_kind = {}, collections.defaultdict(lambda: 0)
        for key, result in zip(_filtered_keys, pipeline.execute()):
          if result is not None:
            logging.info('-- Fetched object at key "%s" of type "%s"...' % (
              key, model.Key(urlsafe=key).kind))
            _objects[key] = result
            _by_kind[model.Key(urlsafe=key).kind] += 1
          else:
            logging.info('-- !! FETCH FAILED for key "%s"...' % key)

        logging.info('Total of %s successfully packed objects.' % len(_objects))
      return _objects.iteritems()  # return generator of tupled (key, value) pairs

    @staticmethod
    def expand_entity(arguments, source, key, entity):

      '''  '''

      kind = model.Key(urlsafe=key).kind

      logging.info('-- Transforming object at key "%s" of type "%s"...' % (
        key, kind))

      try:  # try applying decompression
        decompressed = source.EngineConfig.compression.decompress(entity)
      except:
        decompressed = entity

      obj = source.EngineConfig.serializer.loads(entity)

      if arguments.binding:
        binding = bindings.ModelBinding.resolve(arguments.binding, kind)
        logging.info('----> Using binding "%s"...' % binding.__name__)

        if not binding:
          if arguments.kinds:
            raise RuntimeError('No model binding found for type "%s",'
                               ' but kind was explicitly specified for migration.' % kind)
          logging.warning('!!! No model binding found for kind "%s". !!!' % kind)
          return

        _llgen = binding(logging=logging)(obj)

        _count = 0
        for bundle in _llgen:
          _count += 1
          response = yield bundle

          if response:
            logging.info('------ Object emitted of type "%s" with key "%s"...' % (
              response.kind(), response.key.urlsafe()))
          elif isinstance(bundle, model.Model):
            logging.info('------ Object emitted of type "%s"...' % bundle.kind())

          if response: _llgen.send(response)

        logging.info('---- Binding procedure produced %s entities.' % _count)
      else:
        yield obj

    @staticmethod
    def collapse_bindings(arguments, source, target, binding, key, entity):

      '''  '''

      if binding:  # bindings transform model structure
        _transformed, _by_target_kind = 0, collections.defaultdict(lambda: 0)
        entity_generator = FCM.Migrate.expand_entity(arguments, source, key, entity)

        for bundle in entity_generator:
          if isinstance(bundle, tuple) and len(bundle) == 2 and isinstance(bundle[0], model.Key):
            result = yield bundle
            entity_generator.send(result)
          elif isinstance(bundle, (tuple, list)):
            for item in bundle:
              yield item

      else:  # no binding, raw translate (with no structure change)
        raise NotImplementedError('woops, you\'re a dick')

      ## yield key, inflated

    @staticmethod
    def write_object(target, key, entity, pipeline=None):

      '''  '''

      if isinstance(entity, dict):
        return target.put(key.flatten(True), entity, key.kind, pipeline=pipeline)
      return target._put(entity, pipeline=pipeline)

    @staticmethod
    def apply_migration(arguments, source, target):

      '''  '''

      logging.info('Performing data migration...')

      ## enter pipelined mode
      with target.channel('__meta__').pipeline() as pipeline:
        _written, _by_kind = 0, collections.defaultdict(lambda: 0)

        ## 1) read sources
        sources = FCM.Migrate.read_sources(arguments, source)

        if arguments.binding:
          logging.info('Loading bindings...')
          assert bindings.ModelBinding.resolve(arguments.binding)
          logging.info('Using bindings from package "%s"...' % arguments.binding)

        for key, entity in FCM.Migrate.read_sources(arguments, source):
          kind = model.Key(urlsafe=key).kind

          ## 2) apply bindings
          binding = None
          if arguments.binding:
            binding = bindings.ModelBinding.resolve(arguments.binding, kind)

          binding_generator = FCM.Migrate.collapse_bindings(*(
            arguments, source, target, binding, key, entity))

          for key, inflated in binding_generator:
            if inflated:
              _written += 1
              _by_kind[key.kind] += 1
              FCM.Migrate.write_object(target, key, inflated, pipeline=pipeline)

              try:
                binding_generator.send(inflated)
              except StopIteration:
                break

        logging.info('Beginning write in 3 seconds...')
        time.sleep(3)

        ## 3) write results
        import pdb; pdb.set_trace()
        pipeline.execute()  # go

      logging.info('Written entity report (%s objects total):' % str(_written))
      for kind in _by_kind:
        logging.debug('-- "%s": %s entities' % (kind, str(_by_kind[kind])))

    logging.info('Migration complete.')

    def execute(arguments):

      ''' Execute the ``fcm migrate`` tool, given a set of arguments
          packaged as a :py:class:`argparse.Namespace`.

          :param arguments: Product of the ``parser.parse_args()``
          call, dispatched by ``canteen`` or manually.

          :returns: Python value ``True`` or ``False`` depending on
          the result of the call. ``Falsy`` return values will be
          passed to :py:meth:`sys.exit` and converted into Unix-style
          return codes. '''

      source, target = FCM.Migrate.resolve_adapters(arguments)

      ## perform clean against target (if so instructed) before anything else
      if arguments.clean: FCM.Migrate.clean_data(arguments, target)

      ## perform update of local data first, if needed
      if arguments.update: FCM.Migrate.apply_update(arguments, target)

      ## run fixtures next, if so instructed
      if arguments.fixtures: FCM.Migrate.apply_fixtures(arguments, target)

      ## finally, migrate data
      if source and target: FCM.Migrate.apply_migration(arguments, source, target)


if __name__ == '__main__': FCM(autorun=True)  # initialize and run :)
