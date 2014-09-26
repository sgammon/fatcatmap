# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  env = ENV.fetch("environment", "sandbox")
  initializer = './scripts/instance/initialize.sh'

  # ~~ boxes ~~ #
  config.vm.provider "virtualbox" do |vb|
    config.vm.box = "wheezy-7"
    config.vm.box_url = "https://storage.googleapis.com/fcm-dev/vagrant/vagrant-debian-wheezy64.box"
  end

  config.vm.provider "vmware_fusion" do |vmw|
    config.vm.box = "wheezy-7-vmware"
    config.vm.box_url = "https://storage.googleapis.com/fcm-dev/vagrant/debian-7.5.0-amd64-vmware.box"
  end

  # ~~ network ~~ #
  config.vm.network :forwarded_port, guest: 80, host: 5000  # K9 HTTP
  config.vm.network :forwarded_port, guest: 443, host: 5443  # K9 HTTPS
  config.vm.network :forwarded_port, guest: 6379, host: 6379  # Redis

  config.vm.network "public_network"
  config.vm.network "private_network", ip: "10.25.25.25"

  # ~~ ssh ~~ #
  config.ssh.forward_agent = true

  # ~~ roles ~~ #
  config.vm.define "load-balancer" do |lb|
    lb.vm.provision "shell", path: initializer, args: [env, "lb"]
  end

  config.vm.define "database" do |db|
    db.vm.provision "shell", path: initializer, args: [env, "db"]
  end

  config.vm.define "elasic-search" do |es|
    es.vm.provision "shell", path: initializer, args: [env, "es"]
  end

  config.vm.define "app-server", primary: true do |app|
    app.vm.provision "shell", path: initializer, args: [env, "app"]
  end

end

