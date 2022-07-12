import rmDiffConsoles from '../index'
import fs from 'fs'
import path from 'path'

// a list of fs.writeFile results that have been mocked
// make sure to clear after each test
let mockedWrites: { name: string; text: string }[] = []

// mock the fs module to return files that are consistent with the mock diff
jest.mock('fs', () => {
  const _fs = jest.requireActual('fs')
  const path = require('path')

  // define the original text of a.js
  // a.js has a multiline console.log
  // these must exactly correspond to the diff
  const mockFiles: Record<string, string> = {
    'a.js': `const a = 1

if (a) {
  console.log(1)
  console.log(2)
}

export default a
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

// the diff that corresponds to the added console.log into the mock files a.js
const diff = `diff --git a/MOCK_DIR/a.js b/MOCK_DIR/a.js
index 4e7bb20..cf39e47 100644
--- a/MOCK_DIR/a.js
+++ b/MOCK_DIR/a.js
@@ -1,3 +1,5 @@
 const a = 1

+if (a) {
+  console.log(1)
+  console.log(2)
+}
+
 export default a
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

test.skip('replace empty if statements after console.logs are removed', async () => {
  await rmDiffConsoles(`/MOCK_DIR/`, diff)
  expect(mockedWrites).toEqual([
    {
      name: 'a.js',
      text: `const a = 1

export default a
`,
    },
  ])
  mockedWrites = []
})
