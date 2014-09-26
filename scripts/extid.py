# -*- coding: utf-8 -*-

'''

  fcm: external ID debug script

  uses model internals to fetch external IDs for a provider.
  invoked like 'python scripts/extid.py govtrack', to retrieve all govtrack IDs.
  always sorts output by ID content.

'''

from __future__ import print_function

# stdlib
import sys, os

# pathfix
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

# fcm
from fatcatmap import models

# process args
args = sys.argv[1:] if len(sys.argv) > 1 else []
if len(args) == 1:
  provider = args[0]
else:
  provider = 'govtrack'

# crawl IDs and add
_content = set()
for model in models.all.ExternalID.query().filter(models.all.ExternalID.provider == provider).fetch(limit=1000):
  for content_item in model.content:
    _content.add(model.provider + ': ' + content_item)

# print, sorted
for line in sorted(_content):
  print(line)

