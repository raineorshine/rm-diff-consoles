import { execa } from 'execa'

const cwd = process.cwd()
console.log('cwd', cwd)

const { stdout } = await execa('echo', ['unicorns'])
console.log('stdout', stdout)
