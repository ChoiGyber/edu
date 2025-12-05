module.exports = {
  apps: [
    {
      name: 'edu',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/edu',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
