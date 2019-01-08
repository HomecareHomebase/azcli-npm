import cli, { IAzOptions, IExecResults, 
  MockResponseTypes, MockRunner, MockResponse, MockResponseFunctions, AzError, ShellRunner} from '../dist'
import {expect} from 'chai'
import 'mocha'
import * as Q from 'q';

const delay = time => Q.Promise(res=>setTimeout(()=>res(),time));

describe('bootstrap', () => {

  let runner: cli
  let mr: MockResponseFunctions

  beforeEach(()=> {

    let options = <IAzOptions>{ shellRunner: MockRunner}
    let wrapper = MockResponse(options)

    runner = wrapper.cli
    mr = wrapper.mr
  })

  it ('#line test', ()=> {

    var cli = new ShellRunner("cmd")
    var response = cli
      .start()
      .line("/?")
      .exec()
      expect(response.stdout.length).greaterThan(300)
  })

  it('#throw correct error', ()=> {

    let azcli = new cli()

    try {
      azcli.arg('wrong').arg('arg').exec()
    } catch(e){
      let err = <AzError>e
      expect(err).not.null
      expect(err.code).greaterThan(0)
      expect(err.stderr).not.null
      return
    }
    throw new Error("should have thrown error")

  })

  it('#should return version', () => {

    var version = runner.getAzCliVersion()
    expect(version).is.not.null
  });

  it ('#should return args', ()=>
  {
    runner.clear()
    runner.arg('will').arg('ignore')
    let args = mr.GetMockShell().mockArgs
    expect(args.length).eq(2)
    expect(args[0]).eq('will')
    expect(args[1]).eq('ignore')


    let azcli = runner.start()
    azcli.arg('test1').arg('test2')

    args = mr.GetMockShell().mockArgs
    expect(args.length).eq(2)
    expect(args[0]).eq('test1')
    expect(args[1]).eq('test2')

  });

  it ('#async arg test', (done)=>
  {
    mr.AddMockResponse(MockResponseTypes.justReturnCode)
    mr.AddMockResponse(MockResponseTypes.justReturnCode)

    var p1 = Q.Promise<MockRunner>( (resolves)=> {

      let azcli = runner.start()
      let mock = <MockRunner>(<any>azcli).runner
      azcli.arg('test1a').arg('test2a')
      
      delay(150).then(()=>{
        azcli.execAsync().then(()=> {
          resolves(mock)
        })
      })
    })

    var p2 = Q.Promise<MockRunner>( (resolves)=> {

      let azcli2 = runner.start()
      let mock2 = <MockRunner>(<any>azcli2).runner
      azcli2.arg('test1b').arg('test2b')

      delay(150).then(()=>{
        azcli2.execAsync().then(()=>{
          resolves(mock2)
        })
      })
    })


    Q.all<MockRunner>([p1, p2]).then(values=>
      {
        try {
          let a1 = values[0]
          let a2 = values[1]
  
          expect(a1.mockArgs.length).eq(2)
          expect(a1.mockArgs[0]).eq('test1a')
          expect(a1.mockArgs[1]).eq('test2a')
  
  
          expect(a2.mockArgs.length).eq(2)
          expect(a2.mockArgs[0]).eq('test1b')
          expect(a2.mockArgs[1]).eq('test2b')
  
          done()
        }
        catch(e){
          done(e)
        }
      })


  });

  it ('#should login with secret', ()=>{

    expect(()=>{
      mr.AddMockResponse( MockResponseTypes.justReturnCode)
        .login('tenant','account','secret')
    }).to.not.throw();
  });

  it ('#should login with certificate', ()=>{

    expect(()=>{
      mr.AddMockResponse( MockResponseTypes.justReturnCode)
        .loginWithCert('tenantId', 'serviceId', 'serviceCert')
    }).to.not.throw();
  });

  it ('#Set subscription with spaces', ()=>{

    
    expect(()=>{
      mr.AddMockResponse( MockResponseTypes.justReturnCode)
        .setSubscription('subscription with space')
    }).to.not.throw();
  });

  it ('#List webapps', ()=>{
    
    var results: any = null
    expect(()=>{
      mr.AddMockResponse( MockResponseTypes.justReturnCode)
        .setSubscription('subscription with space')
      
      results = 
        mr.AddResponse(<IExecResults>{ code: 0, stdout: JSON.stringify([{id: '/id'}]) })
        .start()
          .arg('webapp')
          .arg('list')
          .execJson<any>()
    }).to.not.throw();

    expect(results).is.not.null
    expect(results[0].id).is.eq('/id')

  });

  it ('#Logout', ()=>{

    mr.AddMockResponse( MockResponseTypes.justReturnCode )

    expect(()=>{
      runner.logout()
    }).to.not.throw();
  });



});