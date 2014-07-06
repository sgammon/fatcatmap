"""
Settings for deployment.  Specifies allowed groups
as well as packages and configs for specific groups

"""

ALLOWED_GROUPS=['lb','web','app','misc']
ALLOWED_ENVIRONMENTS = ['prod','stage']

GLOBAL_PACKAGES = ['supervisor']

GROUP_PACKAGES = {
    'lb':{'packages': ['nginx','haproxy'],
          'apt_keys':['http://haproxy.debian.net/bernat.debian.org.gpg'],
          'apt_sources':[('backports','http://ftp.debian.org/debian/','wheezy-backports', 'main')]
          }
}