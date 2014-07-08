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
BOOT_DISK_SIZE = 10  # in gigabytes
BOOT_DISK_SNAPSHOT = 'boot-v5'  # snapshot name
STARTUP_SCRIPT_URL = 'https://storage.googleapis.com/fcm-dev/base/bootstrap.sh'
BOOT_DISK_TYPE = 'https://www.googleapis.com/compute/v1/projects/fcm-catnip/zones/us-central1-a/diskTypes/pd-ssd'
PROJECT_ID = '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com'
PEM = 'fabfile/credentials/identity.pem'
PROJECT =  'fcm-catnip'
REGION = 'us-central1-a'
SIZE = 'g1-small'
IMAGE = 'debian-7-wheezy-v20140606'
NETWORK = 'backend'

####### package settings #######
GLOBAL_PACKAGES = ['supervisor']
GROUP_PACKAGES = {
    'lb': {'packages': ['nginx', 'haproxy'],
          'apt_keys': ['http://haproxy.debian.net/bernat.debian.org.gpg'],
          'apt_sources': [('backports', 'http://ftp.debian.org/debian/', 'wheezy-backports', 'main')]
          }
}
