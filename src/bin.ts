#!/usr/bin/env node
import rmDiffConsoles from './index.js'
import { execa } from 'execa'

// run git diff
const { stdout: diff } = await execa('git', ['diff', '--staging'])
const result = rmDiffConsoles(process.cwd(), diff)
console.info('result', result)
