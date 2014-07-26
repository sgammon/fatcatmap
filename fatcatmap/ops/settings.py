# -*- coding: utf-8 -*-

'''

  fcm ops: settings

  Settings for deployment.  Specifies allowed groups
  as well as packages and configs for specific groups

'''

ALLOWED_GROUPS = ['lb', 'app']  # @TODO(sgammon): db (someday) :'(
ALLOWED_ENVIRONMENTS = ['production', 'staging', 'sandbox']


###### GCE SETTINGS #####
USER = 'k9'
PROJECT = 'fcm-catnip'
REGION = 'us-central1-a'
KEY = ['conf/keys/id_k9']
ENABLED_REGIONS = ['us-central1-a', 'us-central1-testingf', 'europe-west1-a']
DATADOG_KEY = "ac728205a32668467a1e4c4f16f61501"
PEM = 'conf/credentials/identity.pem'
STARTUP_SCRIPT_URL = 'https://storage.googleapis.com/fcm-dev/base/bootstrap.sh'
PROJECT_ID = '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com'
NETWORK = 'backend'
BASE_SERVICE_SCOPES = [
  "compute.read_only",
  "devstorage.read_only"
]


class BootDisk(object):

  ''' Boot disk type enum '''

  NAME = 'boot-v10'
  SSD = 'pd-ssd'
  MAGNETIC = None


class Components(object):

  ''' Enumerated component processes. '''

  PROXY = 'haproxy'
  WEBSERVER = 'httpd'
  DATABASE = 'redis'


class ComponentProcesses(object):

  ''' Supervisor configuration for component processes. '''

  haproxy = {
    'command': '/base/software/haproxy/sbin/haproxy -f /etc/haproxy/haproxy.conf -db -p /base/ns/pid/haproxy',
  }

  httpd = {
    'command': '/base/software/httpd/bin/httpd -f /etc/apache2/httpd.conf -DFOREGROUND'
  }

  k9 = {
    'command': '/base/software/k9/sbin/k9 --ini /base/software/k9/apphosting/master.ini'
  }

  redis = {
    'process_name': 'redis-server',
    'command': '/base/software/redis/bin/redis-server /etc/redis/db.conf --daemonize no'
  }



###### ENV/GROUP SETTINGS ######
ENV_TAGS, GROUP_SETTINGS = {

  # ~~ settings by environment ~~ #

  'production': ['production', 'public'],
  'staging': ['staging', 'internal'],
  'sandbox': ['sandbox', 'internal']

}, {

  # ~~ settings by role ~~ ##

  'lb': {
    #'size': 'n1-standard-2-1x-ssd',
    'size': 'n1-standard-2',
    'image': 'debian-7-wheezy-v20140606',
    'ip_forwarding': True,
    'tags': ['frontline', 'http-server', 'https-server'],
    'scopes': BASE_SERVICE_SCOPES,
    'services': [Components.PROXY, Components.WEBSERVER],
    'disk': {
      'size': 10,
      'snap': BootDisk.NAME,
      'type': BootDisk.SSD,
    }
  },

  'app': {
    #'size': 'n1-standard-2-1x-ssd',
    'size': 'n1-standard-2',
    'image': 'debian-7-wheezy-v20140606',
    'ip_forwarding': False,
    'tags': ['app', 'db'],  # @TODO(sgammon): split out DB role
    'scopes': [
      "userinfo.email",
      "devstorage.read_write",
      "taskqueue",
      "bigquery",
      "sqlservice",  # TODO(sgammon): delegate to db role
      "datastore"  # @TODO(sgammon): delegate to db role
    ],
    'services': [
      Components.PROXY,  # @TODO(sgammon): split out proxy role
      Components.WEBSERVER,  # @TODO(sgammon): delegate webserver to lb role
      Components.DATABASE
    ],
    'disk': {
      'size': 20,
      'snap': BootDisk.NAME,
      'type': BootDisk.SSD,
    }
  },

  'db': {
    #'size': 'n1-highcpu-2-1x-ssd',
    'size': 'n1-standard-2',
    'image': 'debian-7-wheezy-v20140606',
    'ip_forwarding': False,
    'tags': ['db'],
    'scopes': [
      "userinfo.email",
      "devstorage.read_write",
      "taskqueue",
      "bigquery",
      "sqlservice",
      "datastore"
    ],
    'services': [Components.DATABASE],
    'disk': {
      'size': 40,
      'snap': BootDisk.NAME,
      'type': BootDisk.SSD,
    }
  }

}


####### package settings #######
GLOBAL_PACKAGES = ['supervisor']
