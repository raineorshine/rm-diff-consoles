#!/usr/bin/env node
import rmDiffConsoles from './index.js'
import { execa } from 'execa'
import chalk from 'chalk'

// run git diff
const { stdout: diff } = await execa('git', ['diff', '--staged'])

if (!diff) {
  const { stdout: unstaged } = await execa('git', ['diff'])
  console.info(`No staged changes`)
  if (unstaged) {
    console.info(
      `\nYou do have unstaged changes. ${chalk.cyan('rm-diff-consoles')} only works on staged changes. Use ${chalk.cyan(
        'git add -A',
      )} to stage all changes and then re-run ${chalk.cyan('rm-diff-consoles')}.`,
    )
  }
  process.exit(0)
}

const results = await rmDiffConsoles(process.cwd(), diff)

console.info(
  results.length > 0
    ? `${chalk.green('✓')} Removed console.log from ${results.length} file${results.length === 1 ? '' : 's'}`
    : `${chalk.green('✓')} No console.log in ${chalk.cyan('git diff --staged')}`,
)
