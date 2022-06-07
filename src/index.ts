import fs from 'fs'
import path from 'path'

/** Parses console.logs from git diff and returns file matches and replaced content. */
export const parse = async (basePath: string, input: string) => {
  const fileDiffs = input.split(/^diff --git /gm)

  // extract all the console.logs from the diff
  const files = fileDiffs
    // first entry of split is empty string since the file starts with "diff --get"
    .slice(1)
    .map(fileDiff => {
      // parse the path from the first line
      const filepath = fileDiff.slice(0, fileDiff.indexOf(' ')).slice(2)
      const pathResolved = path.resolve(`${basePath}/${filepath}`)

      const content = fileDiff.replace(/^(.*\n){5}/g, '')
      const matches = content
        .match(/^.*console\.log.*/gm)
        // remove prefixed '+' from the diff
        ?.map(s => s.slice(1))

      return { filepath: pathResolved, matches: matches || [] }
    })

    // filter out file diffs with no console.logs
    .filter(file => file.matches.length > 0)

  // replace console.logs in each file
  const results = await Promise.all(
    files.map(async file => {
      const original = await fs.promises.readFile(file.filepath, 'utf8')
      return {
        ...file,
        replaced: original.replace(/^.*console\.log.*\n/gm, ''),
      }
    }),
  )

  return results
}

/** Parses console.logs and removes them from the original files. MODIFIES ORIGINAL FILES. */
const rmDiffConsoles = async (basePath: string, input: string) => {
  const parsed = await parse(basePath, input)
  return parsed.map(async file => {
    await fs.promises.writeFile(file.filepath, file.replaced)
    return file
  })
}

export default rmDiffConsoles
