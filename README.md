Removes all `console.log` statements in all changed files in a git repository.

Helpful for removing `console.log` automatically from changed files so it does not end up in production, while not accidentally removing `console.log` from other files in the project.

It is recommended that you use `console.log` solely for debugging, and `console.info` for printing information to the console as part of its production behavior.

## Usage

1. Add some `console.log` statements to one or more files in a git repository.
2. Run `npx rm-diff-consoles` from the project's root directory.

Tada! All your `console.log` statements have been removed.

## Example

Before:

```ts
const toTitleCase = (s: string) => s.split(' ').map(word => {
  const first = word[0].toUpperCase()
  const rest = word.slice(1).toLowerCase()).join(' ')
  console.log(first) // just for debugging!!!
  console.log(rest) // just for debugging!!!
  return first + rest
}

export default toTitleCase
```

After:

```ts
const toTitleCase = (s: string) => s.split(' ').map(word => {
  const first = word[0].toUpperCase()
  const rest = word.slice(1).toLowerCase()).join(' ')
  return first + rest
}

export default toTitleCase
```
