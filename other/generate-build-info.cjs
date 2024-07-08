const process = require('node:process')
const path = require('node:path')
const fs = require('node:fs')
// this is installed by remix...

const fetch = require('node-fetch')

const commit = process.env.COMMIT_SHA

async function getCommit() {
  if (!commit)
    return `No COMMIT_SHA environment variable set.`
  try {
    const res = await fetch(
      `https://api.github.com/repos/safinn/dimitris.dev/commits/${commit}`,
    )
    const data = await res.json()

    return {
      isDeployCommit: commit === 'HEAD' ? 'Unknown' : true,
      sha: data.sha,
      author: data.commit.author.name,
      date: data.commit.author.date,
      message: data.commit.message,
      link: data.html_url,
    }
  }
  catch (error) {
    return `Unable to get git commit info: ${error.message}`
  }
}

async function go() {
  const buildInfo = {
    buildTime: Date.now(),
    commit: await getCommit(),
  }

  fs.writeFileSync(
    path.join(__dirname, '../public/build/info.json'),
    JSON.stringify(buildInfo, null, 2),
  )
  console.log('build info generated', buildInfo)
}
go()

/*
eslint
  consistent-return: "off",
*/
