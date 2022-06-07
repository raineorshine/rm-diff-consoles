Removes all `console.log` statements in all changed files in a git repository.

It is recommended that you use `console.log` solely for debugging, and `console.info` for printing information to the console as part of its production behavior.

## Usage

1. Add some `console.log` statements to one or more files in a git repository.
2. Run `npx rm-diff-consoles` from the project's root directory.

Tada! All your `console.log` statements have been removed.
