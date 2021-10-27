# @dczajkowski/eslint-plugin
This is an [eslint](https://eslint.org/) plugin that provides several eslint rules that are not available out of the box.

## Installation
```bash
npm i @dczajkowski/eslint-plugin --save-dev # yarn add -D @dczajkowski/eslint-plugin
```
## Setup
In your `.eslintrc` config:

```json
{
  "plugins": ["@dczajkowski"],
  "rules": {
    "@dczajkowski/enum-value-name": "error",
    "@dczajkowski/no-relative-imports": "warn",
    "@dczajkowski/ordered-imports": "warn"
  }
}
```

## Licence
This project is under [The MIT License (MIT)](https://github.com/DCzajkowski/eslint-plugin/blob/master/LICENSE)
