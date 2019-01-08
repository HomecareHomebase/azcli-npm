# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.1.4"></a>
## [1.1.4](https://github.com/HomecareHomebase/azcli-npm/compare/v1.1.3...v1.1.4) (2019-01-08)


### Bug Fixes

* line() method of ShellRunner now working as intended ([#7](https://github.com/HomecareHomebase/azcli-npm/issues/7)) ([18e5be4](https://github.com/HomecareHomebase/azcli-npm/commit/18e5be4))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/HomecareHomebase/azcli-npm/compare/v1.1.2...v1.1.3) (2018-12-07)


### Bug Fixes

* Adding parent proc stream support for execAsync() ([369c9dd](https://github.com/HomecareHomebase/azcli-npm/commit/369c9dd))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/HomecareHomebase/azcli-npm/compare/v1.1.1...v1.1.2) (2018-11-28)


### Bug Fixes

* Resolving async argument building. arguments should now start with a .start() method which can then be used to chain args() and .exec* against. This isolates arguments to a unique object and allows async/await usage ([#5](https://github.com/HomecareHomebase/azcli-npm/issues/5)) ([c7c1fd1](https://github.com/HomecareHomebase/azcli-npm/commit/c7c1fd1))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/HomecareHomebase/azcli-npm/compare/v1.1.0...v1.1.1) (2018-11-27)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/HomecareHomebase/azcli-npm/compare/v1.0.2...v1.1.0) (2018-11-27)


### Features

* Adding async execution support with exec*Async() ([b639147](https://github.com/HomecareHomebase/azcli-npm/commit/b639147))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/HomecareHomebase/azcli-npm/compare/v1.0.1...v1.0.2) (2018-11-27)


### Bug Fixes

* Fixing cli error handling to use new emit tag (error was throwing an error vs just reporting). Added new test to cover this gap ([538933a](https://github.com/HomecareHomebase/azcli-npm/commit/538933a))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/HomecareHomebase/azcli-npm/compare/v1.0.0...v1.0.1) (2018-11-27)


### Bug Fixes

* CLI errors are now thrown as correct error objects ([0fbd620](https://github.com/HomecareHomebase/azcli-npm/commit/0fbd620))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/HomecareHomebase/azcli-npm/compare/v0.1.0...v1.0.0) (2018-11-21)


### Features

* Added mocking support for the shell runner ([#4](https://github.com/HomecareHomebase/azcli-npm/issues/4)) ([f573958](https://github.com/HomecareHomebase/azcli-npm/commit/f573958))


### BREAKING CHANGES

* the cli constructor parameters have changed



<a name="0.1.0"></a>
# [0.1.0](https://github.com/HomecareHomebase/azcli-npm/compare/v0.0.2...v0.1.0) (2018-11-20)


### Features

* Add login and logout APIs ([#3](https://github.com/HomecareHomebase/azcli-npm/issues/3)) ([a589376](https://github.com/HomecareHomebase/azcli-npm/commit/a589376))



<a name="0.0.2"></a>
## 0.0.2 (2018-11-20)
