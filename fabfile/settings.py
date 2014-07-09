# -*- coding: utf-8 -*-

'''

  fabric: settings
  ~~~~~~~~~~~~~~~~


  Settings for deployment.  Specifies allowed groups
  as well as packages and configs for specific groups

'''

ALLOWED_GROUPS = ['lb', 'app']
ALLOWED_ENVIRONMENTS = ['production', 'staging', 'sandbox']


###### GCE SETTINGS #####
USER = 'k9'
KEY = ['fabfile/keys/id_k9']
STARTUP_SCRIPT_URL = 'https://storage.googleapis.com/fcm-dev/base/bootstrap.sh'
MAGNETIC_BOOT_DISK_TYPE = None  # `None`
SSD_BOOT_DISK_TYPE = 'https://www.googleapis.com/compute/v1/projects/fcm-catnip/zones/us-central1-a/diskTypes/pd-ssd'
PROJECT_ID = '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com'
PEM = 'fabfile/credentials/identity.pem'
PROJECT =  'fcm-catnip'
REGION = 'us-central1-a'
SIZE = 'g1-small'
IMAGE = 'debian-7-wheezy-v20140606'
NETWORK = 'backend'
BASE_SERVICE_SCOPES = [
  "compute.readonly"
]

class BootDisk(object):

  ''' boot disk type enum '''

  NAME = 'boot-v9'
  SSD = SSD_BOOT_DISK_TYPE
  MAGNETIC = MAGNETIC_BOOT_DISK_TYPE


###### ENV/GROUP SETTINGS ######
ENV_TAGS, GROUP_SETTINGS = {

  'production': ['production', 'ext'],
  'staging': ['staging', 'internal'],
  'sandbox': ['sandbox', 'internal']

}, {

  'lb': {
    'ip_forwarding': True,
    'disk_size': 10,
    'disk_snap': BootDisk.NAME,
    'disk_type': BootDisk.SSD,
    'tags': ['lb', 'http-server', 'https-server'],
    'services': ["devstorage.read_only"] + BASE_SERVICE_SCOPES
  },

  'app': {
    'ip_forwarding': False,
    'tags': ['app'],
    'disk_size': 20,
    'disk_snap': BootDisk.NAME,
    'disk_type': BootDisk.SSD,
    'services': [
      "userinfo.email",
      "compute",
      "devstorage.read_write",
      "taskqueue",
      "bigquery",
      "sqlservice",
      "datastore"
    ]
  }

}


####### package settings #######
GLOBAL_PACKAGES = ['supervisor']
