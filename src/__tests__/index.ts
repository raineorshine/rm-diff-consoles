import rmDiffConsoles from '../index'
import fs from 'fs'

const diff = fs.readFileSync(`${__dirname}/sample.diff`, 'utf-8')

it('rmDiffConsoles', () => {
  expect(rmDiffConsoles(__dirname, diff)).toEqual('???')
})
