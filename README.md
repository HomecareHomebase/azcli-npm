# azcli-npm

> node module wrapper around azure cli 2.x

[![npm](https://img.shields.io/npm/v/azcli-npm.svg)](https://www.npmjs.com/package/azcli-npm)

## Install

```bash
npm i -S azcli-npm
```

## Usage

Basic usage and CLI version reporting

```js
import azcli from 'azcli-npm'

var cli = new azcli()
console.log(cli.getAzCliVersion())
```

Login with a SP and secret

```js
import azcli from 'azcli-npm';

var cli = new azcli()
var result = cli.login('<tenant-id>', '<service-id>','<service-secret>')
console.log(result)

result = cli.logout()
console.log(result)
```

Login with a SP and PEM certificate

```js
import azcli from 'azcli-npm';

var cli = new azcli()
var result = cli.loginWithCert('<tenant-id>', '<cert-path>','<service-secret>')
console.log(result)

result = cli.logout()
console.log(result)
```

Set Subscription

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.login('<tenant-id>', '<service-id>','<service-secret>')


//Note: quotes are passed literly with the argument when using arg() calls.
//You do not need to quote surround an argument with spaces.
//Individual arguments should be their own arg() call, with spaces, with nothing escaped.

//this results in : az account set --subscription="My demos"
cli.arg('account').arg('set').arg('--subscription=My demos').exec()

cli.logout()
```

Set Subscription using argument line parsing

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.login('<tenant-id>', '<service-id>','<service-secret>')

cli.line('account set --subscription \"My demos\"').exec()

cli.logout()
```

List VMs via json object

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.login('<tenant-id>', '<service-id>','<service-secret>')
var results = cli.arg('vm').arg('list').execJson<any>()
results.forEach(function(element)=>{
    console.log(element.id)
    console.log(element.name)
    console.log(element.location)
})

cli.logout()
```

## Contributing

[Contribution Guide](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)
