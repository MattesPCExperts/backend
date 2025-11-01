# Auto Social Manager Backend Deployment Guide

This guide walks through provisioning a Proxmox VM or container, installing the Auto Social Manager backend, and exposing it through a Cloudflare Tunnel at `https://api.504i.com`. All services run as the non-root user `dio`, and PostgreSQL uses a matching `dio` database/user.

## 1. Proxmox Provisioning

### Option A – LXC Container (Debian 12)
1. In Proxmox, download the latest Debian 12 template.
2. Create a new container:
   - CPU: 2 cores (minimum).
   - RAM: 4–8 GB depending on load.
   - Disk: 20 GB+ on fast storage.
   - Enable nesting (required for systemd + Node tooling).
   - Set a temporary root password (runtime work happens under `dio`).
3. Start the container and open a console.

### Option B – VM (Debian 12)
1. Upload a Debian 12 ISO to Proxmox.
2. Create a VM (UEFI + VirtIO disk). Assign resources similar to the container plan.
3. Install Debian with an initial admin account (root or sudoer).

## 2. Base OS Configuration

```bash
apt update && apt upgrade -y
apt install -y sudo curl gnupg2 ca-certificates lsb-release software-properties-common unzip

# Create the non-root service account
deluser --remove-home dio 2>/dev/null || true
adduser --disabled-password --gecos "Auto Social Manager" dio
passwd dio  # set a strong password
usermod -aG sudo dio

# Harden SSH (optional but recommended)
sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd
```

## 3. Install Node.js 20 (pnpm optional)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs build-essential
npm install -g pnpm

node --version   # verify >= 20
```

## 4. Install PostgreSQL 16

```bash
source /etc/os-release
sh -c "echo 'deb http://apt.postgresql.org/pub/repos/apt $VERSION_CODENAME-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor > /usr/share/keyrings/postgresql.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $VERSION_CODENAME-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16

sudo -u postgres psql <<'SQL'
CREATE USER dio WITH PASSWORD 'change-this-password';
CREATE DATABASE dio OWNER dio;
GRANT ALL PRIVILEGES ON DATABASE dio TO dio;
SQL

# Enforce password auth and bind to localhost
sed -i "s/^#\?listen_addresses =.*/listen_addresses = '*' /" /etc/postgresql/16/main/postgresql.conf
echo "host    all    dio    127.0.0.1/32    scram-sha-256" >> /etc/postgresql/16/main/pg_hba.conf
systemctl restart postgresql
```

> **Security tip:** replace `change-this-password` with a strong credential. Restrict inbound access to PostgreSQL to the backend host (for example with UFW or the Proxmox firewall) if remote clients are not required.

## 5. Obtain the Application Code

```bash
sudo -iu dio
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/your-org/dio.git
cd dio/backend

cp .env.example .env
```

Edit `.env` with production values:

```ini
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://dio:change-this-password@127.0.0.1:5432/dio
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32 | cut -c1-32)
OAUTH_REDIRECT_BASE_URL=https://api.504i.com/social

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

Install dependencies and initialise the database:

```bash
pnpm install     # or npm install
npx prisma migrate deploy
pnpm run build   # or npm run build
```

> Run `pnpm exec prisma generate` after schema updates to refresh the Prisma client.

## 6. Systemd Service

Create `/etc/systemd/system/auto-social-manager.service` as root:

```ini
[Unit]
Description=Auto Social Manager API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
User=dio
WorkingDirectory=/home/dio/apps/auto-social-manager/backend
EnvironmentFile=/home/dio/apps/auto-social-manager/backend/.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable --now auto-social-manager
systemctl status auto-social-manager
```

Verify the health endpoint locally:

```bash
curl http://127.0.0.1:4000/health
```

## 7. Cloudflare Tunnel (api.504i.com)

### Install cloudflared

```bash
curl -fsSL https://developers.cloudflare.com/cloudflare-one/static/documentation/connections/cloudflared-install-linux-amd64.deb -o cloudflared.deb
apt install -y ./cloudflared.deb
```

### Authenticate and Create the Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create auto-social-manager
cloudflared tunnel route dns auto-social-manager api.504i.com
```

Move credentials to `/etc/cloudflared`:

```bash
mkdir -p /etc/cloudflared
mv ~/.cloudflared/*.json /etc/cloudflared/
```

### Configure cloudflared

Create `/etc/cloudflared/config.yml`:

```yaml
tunnel: auto-social-manager
credentials-file: /etc/cloudflared/<tunnel-id>.json

ingress:
  - hostname: api.504i.com
    service: http://localhost:4000
  - service: http_status:404
```

Replace `<tunnel-id>.json` with the actual credential file name.

Install the systemd service:

```bash
cloudflared service install
systemctl enable --now cloudflared
systemctl status cloudflared
```

Confirm the DNS record exists in Cloudflare (a CNAME pointing `api.504i.com` to the tunnel hostname) and set SSL/TLS mode to **Full** or **Full (strict)**.

## 8. Firewall & Hardening

- Enable the Proxmox firewall on the node/VM and allow only SSH (TCP/22) inbound, plus outbound HTTPS for `cloudflared`.
- If PostgreSQL needs remote access, restrict allowed IP ranges using either UFW (`ufw allow from <backend-ip> to any port 5432`) or Proxmox security groups.
- Schedule automatic security updates (`apt install unattended-upgrades && dpkg-reconfigure unattended-upgrades`).

## 9. Operations Checklist

- **Backups:** snapshot the VM/container and dump the `dio` database regularly (`pg_dump -U dio dio > /home/dio/backups/dio-$(date +%F).sql`).
- **Deployments:** pull latest changes, run `pnpm install`, `pnpm run build`, `pnpm exec prisma migrate deploy`, and restart the service.
- **Monitoring:** tail logs with `journalctl -u auto-social-manager -f` and `journalctl -u cloudflared -f`.
- **Secrets:** rotate JWT and encryption keys periodically; update `.env` and restart the service.

Once the tunnel reports healthy and DNS propagates, the backend is reachable at `https://api.504i.com`, serving authenticated API requests from the Chrome extension.
