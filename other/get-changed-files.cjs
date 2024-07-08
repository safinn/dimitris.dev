// try to keep this dep-free so we don't have to install deps
const execSync = require('node:child_process').execSync
const https = require('node:https')

function fetchJson(url, { timoutTime } = {}) {
  return new Promise((resolve, reject) => {
    const request = https
      .get(url, (res) => {
        let data = ''
        res.on('data', (d) => {
          data += d
        })

        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          }
          catch (error) {
            reject(error)
          }
        })
      })
      .on('error', (e) => {
        reject(e)
      })
    if (timoutTime) {
      setTimeout(() => {
        request.destroy(new Error('Request timed out'))
      }, timoutTime)
    }
  })
}

const changeTypes = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'moved',
}

async function getChangedFiles(currentCommitSha, compareCommitSha) {
  try {
    const lineParser
    // eslint-disable-next-line regexp/no-super-linear-backtracking
      = /^(?<change>\w).*?(?:[\n\r\u2028\u2029]\s*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])(?<filename>.+$)/
    const gitOutput = execSync(
      `git diff --name-status ${currentCommitSha} ${compareCommitSha}`,
    ).toString()
    const changedFiles = gitOutput
      .split('\n')
      .map(line => line.match(lineParser)?.groups)
      .filter(Boolean)
    const changes = []
    for (const { change, filename } of changedFiles) {
      const changeType = changeTypes[change]
      if (changeType) {
        changes.push({ changeType: changeTypes[change], filename })
      }
      else {
        console.error(`Unknown change type: ${change} ${filename}`)
      }
    }
    return changes
  }
  catch (error) {
    console.error(`Something went wrong trying to get changed files.`, error)
    return null
  }
}

module.exports = { getChangedFiles, fetchJson }
