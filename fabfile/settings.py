# -*- coding: utf-8 -*-

'''

  fabric: settings
  ~~~~~~~~~~~~~~~~

  Settings for deployment.  Specifies allowed groups
  as well as packages and configs for specific groups

'''
###### GENERAL SETTINGS ######

ALLOWED_GROUPS = ['lb', 'web', 'app', 'misc']
ALLOWED_ENVIRONMENTS = ['prod', 'stage']


###### GCE SETTINGS #####
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
