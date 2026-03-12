module.exports = {
  apps: [
    {
      name: 'utopia-x',
      script: 'python3',
      args: '-m http.server 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
