import { createApp } from './app.js'
import { env } from './config/env.js'
import { startPostScheduler } from './lib/post-scheduler.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Posting API listening on http://localhost:${env.PORT}`)
  startPostScheduler()
})
