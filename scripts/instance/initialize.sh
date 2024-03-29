#!/bin/bash

echo "";
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
echo "=== !!! Bootstrapping K9 instance. !!! ===";
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
echo "";

K9_ENVIRONMENT=$1
K9_GROUP=$2
K9_BUNDLE=$3

# make groups/users
echo "Making users and groups..."
(groupadd runtime > /dev/null 2> /dev/null && echo "Runtime group created.") || echo "Runtime group exists."
(useradd -g runtime -m -r -s /bin/bash k9 > /dev/null 2> /dev/null && echo "K9 user created.") || (/usr/sbin/usermod -g runtime -s /bin/bash k9 > /dev/null 2> /dev/null && echo "K9 user converged.")
chsh -s /bin/bash k9 > /dev/null 2> /dev/null

# datadog sources
echo "Adding datadog apt sources..."
cat /etc/apt/sources.list.d/datadog.list > /dev/null 2> /dev/null || sudo sh -c "echo 'deb http://apt.datadoghq.com/ unstable main' > /etc/apt/sources.list.d/datadog.list"
apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C7A7DA52

# /base setup
echo "Making /base SDK root..." && mkdir -p /base /base/apps /base/software /base/environments
echo "Fixing permissions..." && chown -R k9:runtime /base
echo "Performing package update..." && DEBIAN_FRONTEND=noninteractive apt-get update > /var/log/k9-bootstrap.log

# install software
echo "Installing dependencies..." && DEBIAN_FRONTEND=noninteractive apt-get -y install irqbalance binutils bzip2 cpp cpp-4.7 datadog-agent devscripts fakeroot g++ g++-4.7 gawk gcc gcc-4.7 git gperf htop libc-dev-bin libc6-dev libcurl3-gnutls libevent-2.0-5 libevent-core-2.0-5 libevent-dev libevent-extra-2.0-5 libevent-openssl-2.0-5 libevent-pthreads-2.0-5 libexpat1-dev libexporter-lite-perl libfcgi-perl libffi5 libffi-dev libglib2.0-0 libglib2.0-data libgmp10 libgomp1 libgpm2 libjansson4 libjemalloc-dev libjemalloc1 libltdl-dev libltdl7 liblua5.2-0 liblua5.2-dev libmpc2 libmpfr4 libmysqlclient18 libneon27-gnutls libossp-uuid16 libparse-debcontrol-perl libparse-debianchangelog-perl libpcre3 libpcre3-dev libpcrecpp0 libpython2.7 libquadmath0 libreadline-dev libreadline6-dev libsensors4 libsigsegv2 libsnappy1 libsnappy-dev libssl-dev libssl-doc libstdc++6-4.7-dev libsvn1 libtinfo-dev libtool libunistring0 libxml2 libxml2-utils libxslt1.1 lintian linux-libc-dev lua5.2 make mercurial mercurial-common multitail mysql-common patch patchutils pkg-config python-apt python-setuptools python-apt-common python-chardet python-debian python-dev python-magic python-medusa python-meld3 python-mysqldb python-pkg-resources python-pycurl python-setuptools python-support python-tornado python2.7-dev rsyslog-gnutls stow strace subversion supervisor tree unzip vim vim-runtime xsltproc zlib1g-dev btrfs-tools parted ncurses-dev >> /var/log/k9-bootstrap.log
echo "Installing pip..." && easy_install pip
echo "Installing virtualenv..." && pip install --upgrade virtualenv redis fabtools fabric google-api-python-client msgpack-python python-snappy eventlet gevent dogapi hiredis pycrypto pyopenssl >> /var/log/k9-bootstrap.log

echo ""
echo "Using package $DEV$BASE..."
cd /

gsutil cp gs://fcm-dev/base/latest.tar.gz - | tar -xvz;

# run K9 SDK init script
K9_ENVIRONMENT=$K9_ENVIRONMENT K9_GROUP=$K9_GROUP K9_MANIFEST=$K9_BUNDLE bash -c /base/scripts/init
