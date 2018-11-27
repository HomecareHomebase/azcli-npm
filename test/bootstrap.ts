import cli, { IAzOptions, IExecResults, 
  MockResponseTypes, MockRunner, MockResponse, MockResponseFunctions, AzError} from '../dist'
import {expect} from 'chai'
import 'mocha'

describe('bootstrap', () => {

  let runner: cli
  let mr: MockResponseFunctions

  beforeEach(()=> {

    let options = <IAzOptions>{ shellRunner: MockRunner}
    let wrapper = MockResponse(options)

    runner = wrapper.cli
    mr = wrapper.mr
  })

  it('#throw correct error', ()=> {

    let azcli = new cli()

    try {
      azcli.arg('wrong').arg('arg').exec()
      expect(false).true('Should have thrown error')
    } catch(e){
      let err = <AzError>e
      expect(err).not.null
      expect(err.code).greaterThan(0)
      expect(err.stderr).not.null
    }
  })

  it('#should return version', () => {

    var version = runner.getAzCliVersion()
    expect(version).is.not.null
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
        .beginCmd()
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