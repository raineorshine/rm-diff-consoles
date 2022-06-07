import rmDiffConsoles from '../index'
import fs from 'fs'
import path from 'path'

// a list of fs.writeFile results that have been mocked
// make sure to clear after each test
let mockedWrites: { name: string; text: string }[] = []

// a mock diff that represents the console.logs into the mock files a.js and b.js
const diff = `diff --git a/src/__tests__/sample/a.js b/src/__tests__/sample/a.js
index 4e7bb20..cf39e47 100644
--- a/src/__tests__/sample/a.js
+++ b/src/__tests__/sample/a.js
@@ -1,3 +1,5 @@
 const a = 1
+console.log('a', a)
+
 
 export default a
diff --git a/src/__tests__/sample/b.js b/src/__tests__/sample/b.js
index 8791d11..5004448 100644
--- a/src/__tests__/sample/b.js
+++ b/src/__tests__/sample/b.js
@@ -1,3 +1,7 @@
-const b = 2
+let b = 2
+console.log('b1', b)
+
+b++ // a real change to be committed
+console.log('b2', b)
 
 export default b
diff --git a/src/bin.ts b/src/bin.ts
index 40b5d1a..54fce15 100644
--- a/src/bin.ts
+++ b/src/bin.ts
@@ -2,6 +2,7 @@
 import rmDiffConsoles from './index.js'
 import { execa } from 'execa'
 
+// run git diff
 const { stdout: diff } = await execa('git', ['diff'])
 const result = rmDiffConsoles(process.cwd(), diff)
 console.info('result', result)
`

// mock the fs module to return files that are consistent with the mock diff
jest.mock('fs', () => {
  const _fs = jest.requireActual('fs')
  const path = require('path')

  // define the original text of two mock files, a.js and b.js
  // a.js has a single console.log that was added with an additional newline
  // b.js has two console.logs and an unrelated change
  // these must exactly correspond to the diff
  const mockFiles: Record<string, string> = {
    'a.js': `const a = 1

console.log('a', a)

export default a
`,
    'b.js': `let b = 2
console.log('b1', b)

b++ // a real change to be committed
console.log('b2', b)

export default b
`,
  }

  return {
    ..._fs,
    promises: {
      ..._fs.promises,
      readFile: async (filepath: string): Promise<string | undefined> =>
        new Promise(resolve => {
          const name = path.basename(filepath) as string
          resolve(mockFiles[name])
        }),
      writeFile: async (filepath: string, text: string) => {
        const name = path.basename(filepath) as string
        mockedWrites.push({ name, text })
      },
    },
  }
})

it('replace console.logs and additional newlines in edited file', async () => {
  await rmDiffConsoles(`${__dirname}/../../`, diff)
  expect(mockedWrites).toEqual([
    {
      name: 'a.js',
      text: `const a = 1

export default a
`,
    },
    {
      name: 'b.js',
      text: `let b = 2

b++ // a real change to be committed

export default b
`,
    },
  ])
  mockedWrites = []
})
