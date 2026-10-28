#!/bin/sh
# Run as root on the Bixinu box (Mythic Beasts, Amsterdam):
#   scp -r deploy root@176.126.244.73:/root/leobruno-deploy && ssh root@176.126.244.73 sh /root/leobruno-deploy/setup.sh
# leobruno.it lives beside Bixinu and sabotypist: its own user, folder, service and Caddy block. Safe to run again.
set -eu
HERE=$(dirname "$0")

if ! id leobruno >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash leobruno
fi
install -d -o leobruno -g leobruno -m 0700 /home/leobruno/.ssh
install -o leobruno -g leobruno -m 0600 /root/.ssh/authorized_keys /home/leobruno/.ssh/authorized_keys
cat > /etc/sudoers.d/leobruno <<'CONF'
leobruno ALL=(root) NOPASSWD: /usr/bin/systemctl restart leobruno-web, /usr/bin/systemctl status leobruno-web
CONF
chmod 440 /etc/sudoers.d/leobruno

install -d -o leobruno -g leobruno -m 0755 /srv/leobruno /srv/leobruno/releases
[ -f /srv/leobruno/env ] || install -o leobruno -g leobruno -m 0600 /dev/null /srv/leobruno/env

install -m 0644 "$HERE/leobruno-web.service" /etc/systemd/system/leobruno-web.service
install -m 0644 "$HERE/leobruno.caddy" /etc/caddy/sites/leobruno.caddy
systemctl daemon-reload
systemctl enable leobruno-web >/dev/null
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy

echo "Ready. From the laptop: sh deploy/deploy.sh"
