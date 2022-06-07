#!/usr/bin/env node
import rmDiffConsoles from './index.js'
import { execa } from 'execa'

const { stdout: diff } = await execa('git', ['diff'])
const result = rmDiffConsoles(process.cwd(), diff)
console.log('result', result)
