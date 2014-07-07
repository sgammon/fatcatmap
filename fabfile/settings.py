# -*- coding: utf-8 -*-

'''

  fabric: settings
  ~~~~~~~~~~~~~~~~


  Settings for deployment.  Specifies allowed groups
  as well as packages and configs for specific groups

'''


###### GENERAL SETTINGS ######

ALLOWED_GROUPS = ['lb', 'app']
ALLOWED_ENVIRONMENTS = ['production', 'staging', 'sandbox']


###### GCE SETTINGS #####
BOOT_DISK_SIZE = 10  # in gigabytes
BOOT_DISK_SNAPSHOT = 'boot-v5'  # snapshot name
STARTUP_SCRIPT_URL = 'https://storage.googleapis.com/fcm-dev/base/bootstrap.sh'
BOOT_DISK_TYPE = 'https://www.googleapis.com/compute/v1/projects/fcm-catnip/zones/us-central1-a/diskTypes/pd-ssd'
PROJECT_ID = '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com'
PEM = 'fabfile/credentials/identity.pem'
PROJECT = 'fcm-catnip'
REGION = 'us-central1-a'
IMAGE = 'debian-7-wheezy-v20140606'
NETWORK = 'backend'
BASE_SCOPES = [
  'userinfo.email',
  'compute.readonly'
]


###### ENV SETTINGS #####
GROUP_SETTINGS = {
  'lb': {'size': 'g1-small', 'ip_forwarding': True, 'service_scopes': ['devstorage.read_only'] + BASE_SCOPES},
  'app': {'size': 'g1-small', 'ip_forwarding': False, 'service_scopes': [
    'taskqueue',
    'bigquery',
    'sqlservice',
    'datastore',
    'devstorage.read_write'
  ] + BASE_SCOPES}
}


####### PACKAGE SETTINGS #######
BASE_SNAPSHOT = 'base-v1'
GLOBAL_PACKAGES = ['supervisor']
GROUP_LABELS = {
  'production': 'prod',
  'staging': 'stage',
  'sandbox': 'sandbox'
}


####### TAG SETTINGS #######
GROUP_TAGS = {
  'lb': ['http-server', 'https-server', 'lb'],
  'app': ['app']
}
ENVIRONMENT_TAGS = {
  'production': ['ext', 'production'],
  'staging': ['internal', 'staging'],
  'sandbox': ['internal', 'sandbox']
}
