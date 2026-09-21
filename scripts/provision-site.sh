#!/usr/bin/env bash
# Root on dev1. Idempotent: writes the upstream + vhost, then reloads nginx.
#   provision-site.sh         HTTP only (safe before DNS exists)
#   provision-site.sh --tls   issues the cert if needed and adds the HTTPS vhost
#
# The vhost carries its own log format and rate-limit zones, so it never depends
# on load order relative to the other sites in /etc/nginx/sites-enabled.
set -euo pipefail

DOMAIN=story.inferaft.com
UPSTREAM=story_frontend
PORT=3084
AVAILABLE=/etc/nginx/sites-available/$DOMAIN
ENABLED=/etc/nginx/sites-enabled/$DOMAIN
UPSTREAMS=/etc/nginx/conf.d/story-upstreams.conf
WEBROOT=/var/lib/letsencrypt
CERT=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
TLS=${1:-}

[[ $EUID -eq 0 ]] || { echo "run as root" >&2; exit 1; }

if [[ "$TLS" == "--tls" && ! -f "$CERT" ]]; then
  echo "[site] requesting certificate for $DOMAIN (needs the A record to resolve)"
  /snap/bin/certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email --keep-until-expiring
fi

cat > "$UPSTREAMS" <<EOF
# Managed by inferaft-character/scripts/provision-site.sh
upstream $UPSTREAM { server 127.0.0.1:$PORT; }
EOF

cat > "$AVAILABLE" <<EOF
# Managed by inferaft-character/scripts/provision-site.sh
limit_req_zone \$binary_remote_addr zone=story_web:10m rate=20r/s;
limit_req_zone \$binary_remote_addr zone=story_auth:10m rate=20r/m;
log_format story_security escape=json '{"time":"\$time_iso8601","ip":"\$remote_addr","method":"\$request_method","path":"\$uri","status":\$status,"duration":\$request_time}';
map \$http_upgrade \$story_connection_upgrade { default upgrade; '' close; }

server {
  listen 80;
  server_name $DOMAIN;
  location ^~ /.well-known/acme-challenge/ { root $WEBROOT; }
  $( [[ -f "$CERT" ]] && echo "location / { return 301 https://\$host\$request_uri; }" || echo "location / {
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_pass http://$UPSTREAM;
  }" )
}
EOF

if [[ -f "$CERT" ]]; then
  cat >> "$AVAILABLE" <<EOF

server {
  listen 443 ssl;
  http2 on;
  server_name $DOMAIN;
  ssl_certificate $CERT;
  ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  access_log /var/log/nginx/story-security.log story_security;
  error_log /var/log/nginx/story-error.log crit;
  client_max_body_size 2m;
  client_header_timeout 15s;
  client_body_timeout 30s;
  keepalive_timeout 30s;
  limit_req_status 429;
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options DENY always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

  proxy_set_header Host \$host;
  proxy_set_header X-Real-IP \$remote_addr;
  proxy_set_header X-Forwarded-For \$remote_addr;
  proxy_set_header X-Forwarded-Proto https;
  proxy_http_version 1.1;
  proxy_set_header Upgrade \$http_upgrade;
  proxy_set_header Connection \$story_connection_upgrade;
  proxy_buffering off;
  proxy_read_timeout 300s;
  proxy_send_timeout 300s;

  # Better Auth endpoints are the only ones worth rate limiting tightly.
  location ~ ^/api/auth/(sign-in|sign-up) {
    limit_req zone=story_auth burst=10 nodelay;
    proxy_pass http://$UPSTREAM;
  }
  location ~ /\.(?!well-known/) { return 404; }
  location / {
    limit_req zone=story_web burst=40 nodelay;
    proxy_pass http://$UPSTREAM;
  }
}
EOF
fi

ln -sf "$AVAILABLE" "$ENABLED"
nginx -t
systemctl reload nginx
echo "[site] $DOMAIN -> 127.0.0.1:$PORT $( [[ -f "$CERT" ]] && echo '(https)' || echo '(http only, run with --tls once DNS resolves)' )"
