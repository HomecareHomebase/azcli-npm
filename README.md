# azcli-npm

> node module wrapper around azure cli 2.x

[![npm](https://img.shields.io/npm/v/azcli-npm.svg)](https://www.npmjs.com/package/azcli-npm)

## Install

```bash
npm i -S azcli-npm
```

## Usage

```
import * as azcli from 'azcli-npm';

var cli = new azcli.azWrapper()
console.log(cli.getAzCliVersion());
```

## Contributing
[Contribution Guide](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)
