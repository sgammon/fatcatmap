# -*- coding: utf-8 -*-

'''

  fcm ops: settings

  Settings for deployment.  Specifies allowed groups
  as well as packages and configs for specific groups

'''

from fatcatmap import config


## Globals
ifx = config.config.blocks['infrastructure']
gce, runtime, datadog, roles = (
  ifx['gce'], ifx['runtime'], ifx['datadog'], ifx['roles'])


#### Config Bindings
DATADOG_KEY = datadog['key']
USER, GROUP = runtime['user'], runtime['group']
ALLOWED_GROUPS, ALLOWED_ENVIRONMENTS = ifx['groups'], ifx['environments']
DEFAULT_REGION, ENABLED_REGIONS = gce['regions']['default'], gce['regions']['enabled']
BASE_SERVICE_SCOPES = gce['authorization']['scopes']['base']
PROJECT, PROJECT_ID, KEY, PEM = (
  gce['project']['name'],
  gce['project']['id'],
  [gce['authorization']['key']],
  gce['authorization']['identity'])


#### Env/Group Settings
ENV_TAGS, GROUP_SETTINGS = gce['environments'], ifx['roles']
