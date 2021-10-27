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

## Available Rules
### @dczajkowski/enum-value-name
This rule forces enum value names to be PascalCase.

#### Example:
```ts
/* Valid */
enum A {
  PascalCase = 0,
  SnakeCase = 1,
  CamelCase = 2,
  CapitalizedWithUnderscores = 3,
}

/* Invalid */
enum A {
  PascalCase = 0,
  snake_case = 1,
  camelCase = 2,
  CAPITALIZED_WITH_UNDERSCORES = 3,
}
```

## Licence
This project is under [The MIT License (MIT)](https://github.com/DCzajkowski/eslint-plugin/blob/master/LICENSE)
