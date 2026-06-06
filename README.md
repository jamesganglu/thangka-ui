This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

  1. On your EC2 instance, install Node.js (if not already)
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs

  2. Copy your code to the server (git clone or rsync)
  git clone <your-repo> /var/www/v3app
  cd /var/www/v3app

  3. Create .env.production on the server (don't copy it from local — it's gitignored)
  nano .env.production
  Paste in your STRAPI_URL and STRAPI_TOKEN.

  4. Install, build, start
  npm install
  npm run build
  npm run start   # runs on port 3000

  5. Keep it running with PM2
  npm install -g pm2
  pm2 start "npm run start" --name v3app
  pm2 save
  pm2 startup   # auto-restart on reboot

  6. (Optional) Nginx reverse proxy to serve on port 80/443
  server {
      listen 80;
      server_name yourdomain.com;

      location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }

  Make sure your EC2 security group allows inbound traffic on port 80/443 (and 3000 if you skip Nginx).
