# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # ~~ box ~~ #
  config.vm.provider "virtualbox" do |vb|
    config.vm.box = "wheezy-7"
    config.vm.box_url = "https://storage.googleapis.com/fcm-dev/vagrant/vagrant-debian-wheezy64.box"
  end

  config.vm.provider "vmware_fusion" do |vmw|
    config.vm.box = "wheezy-7-vmware"
    config.vm.box_url = "https://storage.googleapis.com/fcm-dev/vagrant/debian-7.5.0-amd64-vmware.box"

  # ~~ network ~~ #
  config.vm.network "forwarded_port", guest: 80, host: 8080  # K9 HTTP
  config.vm.network "forwarded_port", guest: 443, host: 8443  # K9 HTTPS
  config.vm.network "forwarded_port", guest: 6379, host: 65379  # Redis

  config.vm.network "public_network"
  config.vm.network "private_network", ip: "10.25.25.25"

  # ~~ ssh ~~ #
  config.ssh.forward_agent = true

  # ~~ app ~~ #
  config.vm.synced_folder ".", "/fatcatmap"
  config.vm.synced_folder "./lib/canteen", "/canteen"

  # ~~ startup ~~ #
  config.vm.provision "shell", path: './scripts/instance/initialize.sh', args: [ENV.fetch("environment", "sandbox"), ENV.fetch("group", "app")]

end

