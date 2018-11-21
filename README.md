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

Set configuration property overrides

```js
import azcli from 'azcli-npm'

var cli = new azcli(<IAzOptions> {
    minVersion: '2.0.0'
    maxVersion: '2.1'
    ignoreVersion: false
})

console.log(cli.getAzCliVersion())
```

Login with a SP and secret

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.login('<tenant-id>', '<service-id>','<service-secret>')
cli.logout()
```

Login with a SP and PEM certificate

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.loginWithCert('<tenant-id>', '<cert-path>','<service-secret>')
cli.logout()
```

Set Subscription

```js
import azcli from 'azcli-npm';

var cli = new azcli()
cli.login('<tenant-id>', '<service-id>','<service-secret>')
   .setSubscription('<subscription-name>')
   .logout()
```
List VMs via json object

```js
import azcli from 'azcli-npm';

var cli = new azcli()
var results =
cli.login('<tenant-id>', '<service-id>','<service-secret>')
   .setSubscription('<subscription-name')
   .beginCmd()
     .arg('vm')
     .arg('list')
   .execJson<any>()

results.forEach(function(element)=>{
    console.log(element.id)
    console.log(element.name)
    console.log(element.location)
})

cli.logout()
```

## Unit test/mocking

If you want to incoroporate this module into your unit tests we provide a built-in mocking system, or you can roll your own.

To roll your own create a class that implements ShellRunner and its constructor. Then just override all the public facing functions

```js
import azcli, { ShellRunner, ShellRunnerType, IExecResults } from 'azcli-npm'

export class MyMock extends ShellRunner {
    constructor(shellPath: string){
        super(shellPath)
    };
}

//Now you can use this class as the shell override type when creating a new cli()
var cli = new azcli(<IAzOptions> {
    shellRunner: MyMock
})
```

You can instead use the built-in mocking system which provides helpers for setting expected response types for commands

```js
import cli, { IAzOptions, IExecResults, 
  MockResponseTypes, MockRunner, MockResponse, MockResponseFunctions} 'azcli-npm'

let options = <IAzOptions>{ shellRunner: MockRunner}
let wrapper = MockResponse(options)

//grab the cli instance injected with MockRunner
let runner = wrapper.cli

//the mr object is used to inject responses before commands are executed
//these functions return the cli instance so you can directly chain off it
let mr = wrapper.mr


//now you can assign response objects before calling commands

//this will be the result for the setSubscription() call
mr.AddMockResponse( MockResponseTypes.justReturnCode ) //-> returns wrapper.cli
  .setSubscription('subscription with space')

//this creates a custom result for the 'webapp list' cmd after
 let results = 
    mr.AddResponse(<IExecResults>{
        code: 0, 
        stdout: JSON.stringify([{id: '/id'}]) 
    }) // -> returns wrapper.cli so we can chain from it
    .beginCmd()
        .arg('webapp')
        .arg('list')
    .execJson<any>()

console.log(results[0].id)

//You can also use this without chaining if you have commands pre-wrapped
mr.AddMockResponse( MockResponseTypes.justReturnCode )
mr.AddMockResponse( MockResponseTypes.justReturnCode )

//this chain will consume the two mock responses above
runner.login(...)
      .setSubscription(...)

```


## Contributing

[Contribution Guide](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)
