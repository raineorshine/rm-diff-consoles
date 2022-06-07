import fs from 'fs'

const rmDiffConsoles = (path: string, input: string) => {
  const fileDiffs = input.split(/^diff --git /gm)

  // extract all the console.logs from the diff
  const files = fileDiffs
    // first entry of split is empty string since the file starts with "diff --get"
    .slice(1)
    .map(fileDiff => {
      // parse the filename from the first line
      const filename = fileDiff.slice(0, fileDiff.indexOf(' ')).slice(2)

      // parse the line numbers
      // const lineNumberLine = fileDiff.replace(/^(.*\n){4}/g, '')
      // const lineColumnPairs = lineNumberLine.split(/\s*@@\s*/)[1]?.split(' ')
      // const lineNumbers = lineColumnPairs.map(pair => +pair.split(',')[0])

      const content = fileDiff.replace(/^(.*\n){5}/g, '')
      const matches = content
        .match(/^.*console\.log.*/gm)
        // remove prefixed '+' from the diff
        ?.map(s => s.slice(1))

      return { filename, matches: matches || [] }
    })

    // filter out file diffs with no console.logs
    .filter(Boolean)

  const output = files
  // replace console.logs in each file
  // const output = files.map(async file => {
  //   const original = await fs.promises.readFile(file.filename, 'utf8')
  //   return original.length
  // })

  return JSON.stringify(output, null, 2)
}

export default rmDiffConsoles
