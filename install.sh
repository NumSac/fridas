sudo su -

echo 'Modify User Capabilities...'
apt-get install libcap2-bin
setcap cap_net_bind_service=+ep `readlink -f \`which node\``

