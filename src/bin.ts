#!/usr/bin/env node
import rmDiffConsoles from './index.js'
import { execa } from 'execa'
import chalk from 'chalk'

// run git diff
const { stdout: unstaged } = await execa('git', ['diff'])
const { stdout: staged } = await execa('git', ['diff', '--staged'])

if (!staged) {
  console.info(`No staged changes`)
}

if (unstaged) {
  if (!staged) console.info('')

  // if the only unstaged changes are removed console.logs, then this is a redundant call and we can do nothing
  const changes = unstaged.match(/^[+-][^+-][^+-].*/gm)
  const isConsolesOnly = changes?.every(match => /^-.*console\.log/.test(match))
  if (isConsolesOnly) {
    process.exit(0)
  }

  console.info(
    `You have unstaged changes. ${chalk.cyan('rm-diff-consoles')} only works on staged changes. Use ${chalk.cyan(
      'git add -A',
    )} to stage all changes and then re-run ${chalk.cyan('rm-diff-consoles')}.`,
  )
}

if (!staged || unstaged) {
  process.exit(0)
}

const results = await rmDiffConsoles(process.cwd(), staged)

console.info(
  results.length > 0
    ? `${chalk.green('✓')} Removed console.log from ${results.length} file${results.length === 1 ? '' : 's'}`
    : `${chalk.green('✓')} No console.log in ${chalk.cyan('git diff --staged')}`,
)
