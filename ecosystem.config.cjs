/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "family-planning",
      cwd: "/var/www/family-planning",
      script: "npm",
      args: "start -- -p 3042",
      env: {
        NODE_ENV: "production",
        PORT: "3042",
        NEXT_PUBLIC_BASE_PATH: "/family-planning",
        SESSION_COOKIE_PATH: "/family-planning",
      },
    },
  ],
};
