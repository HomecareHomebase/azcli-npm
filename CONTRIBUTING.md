# Contributing to azcli-npm

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

## How Can I Contribute?

### Reporting Bugs

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). Explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. When listing steps, **don't just say what you did, but explain how you did it**.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/).

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Explain why this enhancement would be useful**

### Your First Code Contribution

#### Local development

You must have azure cli 2.0.x installed globably to develop locally. You might also need an azure subscription where you can test out commands.

### Pull Requests

The process described here has several goals:

* Maintain quality
* Fix problems that are important to users
* Enable a sustainable system for maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Make sure the below styleguides are followed
2. The reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

* Squash your commits and follow our commit message standard, or use the PR description and fill out what the merge commit message should be (following the standard).
* PR's will be squashed during merge and a proper commit message applied, unless the PR has proper commits where we can do a normal merge commit.
* Commits must follow https://www.conventionalcommits.org/en/v1.0.0-beta.2/
  * The following structure elements are supported:
    * **fix:** bug/issue fixes
    * **feat:** new features
    * **refactor:** renaming variables, etc. No functional change
    * **chore:** build script, docs, style changes, etc.
* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Run command..." not "Runs command...")
* Limit the first line to 72 characters or less
* Inlude #123 issue numbers and @github_username in the body/footer

### JavaScript Styleguide

All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).

* Prefer the object spread operator (`{...anotherObj}`) to `Object.assign()`
* Inline `export`s with expressions whenever possible
  ```js
  // Use this:
  export default class ClassName {

  }

  // Instead of:
  class ClassName {

  }
  export default ClassName
  ```
* Place requires in the following order:
    * Built in Node Modules (such as `path`)
    * Local Modules (using relative paths)
* Place class properties in the following order:
    * Class methods and properties (methods starting with `static`)
    * Instance methods and properties
* Avoid platform-dependent code