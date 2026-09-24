import { createApp } from './app.js'
import { env } from './config/env.js'
<<<<<<< HEAD
import { startPostScheduler } from './lib/post-scheduler.js'
=======
>>>>>>> origin/main

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Posting API listening on http://localhost:${env.PORT}`)
<<<<<<< HEAD
  startPostScheduler()
=======
>>>>>>> origin/main
})
