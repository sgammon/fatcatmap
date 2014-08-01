#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

'''

  fcm: template compiler

'''

# stdlib
import os
import sys
import errno
import jinja2
import py_compile

# jinja2 imports
from jinja2 import nodes
from jinja2.nodes import EvalContext
from jinja2._compat import iteritems
from jinja2.ext import with_, autoescape, do, loopcontrols
from jinja2.compiler import unoptimize_before_dead_code, Frame, find_undeclared


## Globals
_extra_paths = [
  'fatcatmap/',
  'fatcatmap/lib',
  'lib/canteen'
]

_make_module_path = lambda path, root: '/'.join(filter(bool, path.replace(root, '').replace('.py', '').split('/'))).replace('/', '.')
_make_import_statement = lambda module: 'from %s import *' % module


for path in filter(lambda x: x not in sys.path, _extra_paths):
    sys.path.insert(0, path)

import re
import json
from os import path, listdir, mkdir

_extensions = [with_, autoescape, do, loopcontrols]

try:
    import hamlish_jinja
except ImportError:
    _extensions.append(hamlish_jinja.HamlishExtension)


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise


def compile_file(env, src_path, dst_path, encoding='utf-8', base_dir='', as_module=False):

    """
        Compiles a Jinja2 template to python code.

        `env`: a Jinja2 Environment instance.
        `src_path`: path to the source file.
        `dst_path`: path to the destination file.
        `encoding`: template encoding.
        `base_dir`: the base path to be removed from the compiled template
            filename.
        `as_module`: if True, saves the compiled code with a .py extension.

    """

    # Read the template file.
    src_file = file(src_path, 'r')
    source = src_file.read().decode(encoding)
    src_file.close()

    # Compile the template to raw Python code..
    name = src_path.replace(base_dir, '')

    try:
        raw = env.compile(source, name=name, filename=name, raw=True, defer_init=True)
    except jinja2.TemplateSyntaxError:
        print "!!! Syntax error in file '%s'. Continuing. !!!" % src_path
        return src_path

    if as_module:
        # Save as .py
        name, ext = path.splitext(dst_path)
        dst_path = name + '.py'
        if path.isdir(name):
            raise Exception("Template name conflict: %s is a module directory, "
               "so %s%s can't exist as a template." % (name, name, ext))

    # Save to the destination.
    mkdir_p('/' + os.path.join(*tuple(dst_path.split('/')[0:-1])))
    dst_file = open(dst_path, 'w')
    dst_file.write(raw)
    dst_file.close()
    return dst_path


def compile_dir(env, src_path, dst_path, pattern=r'^.*\.(html|js|haml|svg|css|sass|less|scss|coffee)$',
    encoding='utf-8', base_dir=None, as_module=False, _root_path=None, fill_init=True):

    """
        Compiles a directory of Jinja2 templates to python code.

        `env`: a Jinja2 Environment instance.
        `src_path`: path to the source directory.
        `dst_path`: path to the destination directory.
        `encoding`: template encoding.
        `pattern`: a regular expression to match template file names.
        `base_dir`: the base path to be removed from the compiled template
            filename.
        `as_module`: if True, creates __init__.py for each directory and saves
            the compiled code with a .py extension.
        `_root_path`: root file path for generating import statements

    """

    prefix = None

    if not dst_path.replace(base_dir, '') == '':

        # we're farther down than our base prefix, replace dashes while preserving base directory
        dst_path = os.path.abspath(os.path.join(base_dir, '/'.join(dst_path.replace(base_dir, '').replace('-', '_').split('/')[1:])))

    _import_paths = []

    if as_module and path.isdir(dst_path):
        # Create a __init__.py if not already there.
        init = path.join(dst_path, '__init__.py')
        if not path.exists(init):
            open(init, 'w').close()

    for filename in listdir(src_path):
        src_name, dst_name = path.join(src_path, filename), path.join(dst_path, filename.replace('-', '_'))

        print 'Compiling %s...' % filename

        if path.isdir(src_name):
            mkdir_p(dst_name)
            _import_paths += compile_dir(env, src_name, dst_name, encoding=encoding,
                base_dir=base_dir, as_module=as_module, _root_path=_root_path)
        elif path.isfile(src_name) and re.match(pattern, filename):
            # it's not a template, move it inline
            _import_paths.append(_make_module_path(compile_file(env, src_name, dst_name, encoding=encoding,
                base_dir=base_dir, as_module=as_module), _root_path))

            file_path, file_name = tuple(dst_name.rsplit('/', 1))
            source_path = os.path.join(file_path, '.'.join((file_name.rsplit('.', 1)[0], 'py')))

            if not __debug__:
                precompiled_path = os.path.join(file_path, '.'.join((file_name.rsplit('.', 1)[0], 'pyc' if sys.flags.optimize else 'pyo')))
                try:
                    py_compile.compile(source_path, precompiled_path)
                except Exception:
                    print "Failed to precompile: '%s'... Skipping..." % source_path

        elif path.isfile(src_name) and not re.match(pattern, filename):
            # it's not a template, move it inline
            with open(dst_name, 'wb') as staticwrite:
                with open(src_name, 'rb') as staticread:
                    staticwrite.write(staticread.read())

    _seen_submodules = set()
    if as_module and path.isdir(dst_path) and fill_init:
        # Go back and fill in __init__.py with subimports and preloading code
        init = path.join(dst_path, '__init__.py')
        with open(init, 'w') as init:
            map(lambda line: init.write(line + "\n"), (
                '# -*- coding: utf-8 -*-',
                '',
                "'''",
                '',
                '   compiled templates: %s' % _make_module_path(dst_path, _root_path),
                '',
                "'''",
                '',
                '# subtemplates',
                '\n'.join(map(_make_import_statement, _import_paths)),
                ''
            ))

    return _import_paths


def _visit_template_shim(self, node, frame=None):
    assert frame is None, 'no root frame allowed'
    eval_ctx = EvalContext(self.environment, self.name)

    from jinja2.runtime import __all__ as exported
    self.writeline('from __future__ import division')
    self.writeline('from jinja2.runtime import ' + ', '.join(exported))
    if not unoptimize_before_dead_code:
        self.writeline('dummy = lambda *x: None')

    # if we want a deferred initialization we cannot move the
    # environment into a local name
    envenv = not self.defer_init and ', environment=environment' or ''

    # do we have an extends tag at all?  If not, we can save some
    # overhead by just not processing any inheritance code.
    have_extends = node.find(nodes.Extends) is not None

    # find all blocks
    for block in node.find_all(nodes.Block):
        if block.name in self.blocks:
            self.fail('block %r defined twice' % block.name, block.lineno)
        self.blocks[block.name] = block

    # find all imports and import them
    for import_ in node.find_all(nodes.ImportedName):
        if import_.importname not in self.import_aliases:
            imp = import_.importname
            self.import_aliases[imp] = alias = self.temporary_identifier()
            if '.' in imp:
                module, obj = imp.rsplit('.', 1)
                self.writeline('from %s import %s as %s' %
                               (module, obj, alias))
            else:
                self.writeline('import %s as %s' % (imp, alias))

    # add the load name
    self.writeline('name = %r' % self.name)

    # generate the deferred init wrapper
    self.writeline('def run(environment):', extra=1)
    self.indent()

    # generate the root render function.
    self.writeline('def root(context%s):' % envenv, extra=1)

    # process the root
    frame = Frame(eval_ctx)
    frame.inspect(node.body)
    frame.toplevel = frame.rootlevel = True
    frame.require_output_check = have_extends and not self.has_known_extends
    self.indent()
    if have_extends:
        self.writeline('parent_template = None')
    if 'self' in find_undeclared(node.body, ('self',)):
        frame.identifiers.add_special('self')
        self.writeline('l_self = TemplateReference(context)')
    self.pull_locals(frame)
    self.pull_dependencies(node.body)
    self.blockvisit(node.body, frame)
    self.outdent()

    # make sure that the parent root is called.
    if have_extends:
        if not self.has_known_extends:
            self.indent()
            self.writeline('if parent_template is not None:')
        self.indent()
        self.writeline('for event in parent_template.'
                       'root_render_func(context):')
        self.indent()
        self.writeline('yield event')
        self.outdent(2 + (not self.has_known_extends))

    # at this point we now have the blocks collected and can visit them too.
    for name, block in iteritems(self.blocks):
        block_frame = Frame(eval_ctx)
        block_frame.inspect(block.body)
        block_frame.block = name
        self.writeline('def block_%s(context%s):' % (name, envenv),
                       block, 1)
        self.indent()
        undeclared = find_undeclared(block.body, ('self', 'super'))
        if 'self' in undeclared:
            block_frame.identifiers.add_special('self')
            self.writeline('l_self = TemplateReference(context)')
        if 'super' in undeclared:
            block_frame.identifiers.add_special('super')
            self.writeline('l_super = context.super(%r, '
                           'block_%s)' % (name, name))
        self.pull_locals(block_frame)
        self.pull_dependencies(block.body)
        self.blockvisit(block.body, block_frame)
        self.outdent()

    self.writeline('blocks = {%s}' % ', '.join('%r: block_%s' % (x, x)
                                               for x in self.blocks),
                   extra=1)

    # add a function that returns the debug info
    self.writeline('debug_info = %r' % '&'.join('%s=%s' % x for x
                                                in self.debug_info))

    self.writeline('return (root, blocks, debug_info)')
    self.outdent()
    self.writeline('')


def load_environment():

    '''  '''

    # fcm + stdlib
    from fatcatmap.config import config

    # base + core
    from canteen.base import handler as base
    from canteen.logic import template as core

    # compiler monkeypatch
    from jinja2 import compiler
    compiler.CodeGenerator.visit_Template = _visit_template_shim

    return core.Templates().environment(base.Handler(), config)


def run(module=None, sources=None, target=None):

    '''  '''

    import os
    if not module or not sources or not target:
        root = os.path.dirname(os.path.abspath(os.path.realpath(__file__)))  ## scripts/
        root = os.path.dirname(root)  ## /

        module, sources, target = root+'/fatcatmap/templates', root+'/fatcatmap/templates/source', root+'/fatcatmap/templates/compiled'

    env = load_environment()
    for name, _filter in (
        ('json', json.dumps),
        ):
        env.filters[name] = _filter

    print "=== Compiling canteen templates. ==="

    for _mod in compile_dir(env, sources, target, base_dir=module, as_module=True, _root_path=root):
        print 'Generated module %s...' % _mod

    return 0

if __name__ == "__main__": exit(run())
