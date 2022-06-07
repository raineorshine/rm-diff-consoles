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

      // match the console.log that needs to be replaced
      // does not match additional newlines
      // that is better handled in the actual replacement, since it is hard to do in regex
      const matches = content
        .match(/\n\+[^\n]*console\.log[^\n]*/g)
        // remove all prefixed '+' from the diff
        ?.map(s => s.replace(/\n\+/g, '\n'))

      return { filepath: pathResolved, matches: matches || [] }
    })

    // filter out file diffs with no console.logs
    .filter(file => file.matches.length > 0)

  // replace console.logs in each file
  const results = await Promise.all(
    files.map(async file => {
      // read the original file with staged changes
      const original = await fs.promises.readFile(file.filepath, 'utf8')

      // remove each console.log match from the original file
      const replaced = file.matches.reduce((accum, match) => {
        // first attempt to replace the console.log with a redundant newline
        const replaceWithExtraNewline = accum.replace(`\n${match}\n`, '\n')
        if (replaceWithExtraNewline.length !== accum.length) return replaceWithExtraNewline
        // otherwise replace single line
        return accum.replace(match, '')
      }, original)
      return {
        ...file,
        replaced,
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
