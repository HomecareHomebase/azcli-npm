import { ShellRunner, ShellRunnerType, IExecResults } from './shellrunner'
import * as events from 'events';

/**
 * Error object for failed az-cli commands
 */
export class AzError extends Error {
    constructor(error: string, code: number) {
        super('code: ' + code + ' error: ' + error)
        this.stderr = error
        this.code = code
    }
    /** error output */
    stderr: string;

    /** return code */
    code: number;
}

/** Configuration Options */
export interface IAzOptions {

    /** Minimum supported version of the az cli command tool. */
    minVersion?: string
    /** Maximum supported version of the az cli command tool (version must be lower then this). */
    maxVersion?: string
    /** Ignore all version checks and allow attempted usage. Can also be overriden with the envvar AZCLI_SKIPVERSIONCHECK=1 */
    ignoreVersion?: boolean

    /** Override the underlying shell runner for the az cli tool */
    shellRunner?: ShellRunnerType
}


/**
 * Wrapper for executing az-cli commands with simple options for string/JsonObject based return data
 */
export default class cli extends events.EventEmitter {

    private _buildOptions(options: IAzOptions | null): IAzOptions {

        options = options || <IAzOptions>{}
        options.minVersion = options.minVersion || "2.0.0"
        options.maxVersion = options.maxVersion || "2.1"
        options.ignoreVersion = options.ignoreVersion || false
        options.shellRunner = options.shellRunner || ShellRunner

        return options
    }
    /**
     * Create new wrapper instance to execute commands. This wrapper can be reused with new arguments after each exec* call.
     * @constructor
     * @param {IAzOptions} - configuration options
     */
    constructor(options: IAzOptions | null = null) {
        super()

        //expand out options to cover defaults
        options = this._buildOptions(options)

        if (options.shellRunner == undefined)
            throw "shellRunner is undefined"
        if (options.minVersion == undefined)
            throw "minVersion is undefined"
        if (options.maxVersion == undefined)
            throw "maxVersion is undefined"

        //seems libuv has a bug in windows where it can't resolve commands to .cmd
        //following check resolve it.
        if (process.platform == 'win32') {
            this.runner = new options.shellRunner('az.cmd');
        }
        else {
            this.runner = new options.shellRunner('az');
        }

        let version = this.validateVersion();
        this.azVersion = version;

        var envSkip = this.toBool(process.env.AZCLI_SKIPVERSIONCHECK || "");
        if (envSkip)
            options.ignoreVersion =  envSkip;

        if (!options.ignoreVersion){

            var isNewerOrSame = this.compareVersions(version, options.minVersion);
            if (isNewerOrSame >= 0)
            {
                var isOlderThen = this.compareVersions(version,options.maxVersion);
                if (isOlderThen == -1) {
                    return;
                }
            }

            //fall through means it's either < minVersion or >= maxVersion
            throw "version does not pass: " + options.minVersion + " <= " + version + " > " + options.maxVersion;
        }
    }

    private runner: ShellRunner;
    private azVersion: string;

    private usingCert: boolean = false;
    private certPath: string = "";

    private throwIfError(result : IExecResults): void {
        if (result.code != 0){
            this.emit('clierror', "Error Code: [" + result.code + "]");
            this.emit('clierror', result.stderr);
            throw new AzError( result.stderr, result.code);
        }
    }

    private validateVersion() : string {

        try {

            var results = this.arg('-v').execRawString();      
            
            var match = results.match(/^azure-cli \(?(.*)\)/);           
            if (match != null && match.length > 1)
            {
                return match[1];
            }
            else
            {
                return "0.0.0";

            }

        } catch (error) {
            throw "could not determin azure cli 2.x tool installation";
        }
    }

    private compareVersions(a: string, b: string): number {
        var i;
        var len;
    
        if (typeof a + typeof b !== 'stringstring') {
            throw "input params are not strings";
        }
    
        var aArray = a.split('.');
        var bArray = b.split('.');
        i = 0;
        len = Math.max(aArray.length, bArray.length);
    
        for (; i < len; i++) {
            if ((aArray[i] && !bArray[i] && parseInt(aArray[i]) > 0) || (parseInt(aArray[i]) > parseInt(bArray[i]))) {
                return 1;
            } else if ((bArray[i] && !aArray[i] && parseInt(bArray[i]) > 0) || (parseInt(aArray[i]) < parseInt(bArray[i]))) {
                return -1;
            }
        }
    
        return 0;
    };

    private toBool(a: string): boolean {
        return (/^(true|1)$/i).test(a);
    }

    private _login(tenantId: string, serviceId: string, serviceSecret: string | null = null, certificate: string | null = null) : void {

        if (certificate != null) {
            this.usingCert = true;
            this.certPath = certificate;
            serviceSecret = certificate;
        }
        else {
            this.usingCert = false;
            this.certPath = "";
        }

        this.runner.clear()
        this.arg('login')
            .arg('--service-principal')
            .arg('-u '+serviceId)
            .arg('-p '+serviceSecret)
            .arg('--tenant='+tenantId)
            .exec()
    }

    /** Return the detected az-cli tool version */
    public getAzCliVersion(): string {
        return this.azVersion;
    }


    /**
     * Login to azure with a service account
     * @param tenantId tenant which contains the service principal
     * @param serviceId accountId of the service principal
     * @param serviceSecret service principal secret/password
     * @returns {cli} return self for chaining
     * @throws {AzError}
     */
    public login(tenantId: string, serviceId: string, serviceSecret: string) : cli {
        this._login(tenantId, serviceId, serviceSecret)
        return this
    }

    /**
     * Login to azure with a service account
     * @param tenantId tenant which contains the service principal
     * @param serviceId accountId of the service principal
     * @param certificatePath path to a PEM certificate associated with the service principal
     * @returns {cli} return self for chaining
     * @throws {AzError}
     */
    public loginWithCert(tenantId: string, serviceId: string, certificatePath: string) : cli {
        this._login(tenantId, serviceId, null, certificatePath)
        return this
    }

    /** Logout of the current account */
    public logout(): cli {

        this.runner.clear()
        this.arg('account')
            .arg('clear')
            .exec()
        return this
    }

    /**
     * set the current azure subscription context
     * @param subscription {string} - Name of the subscription
     * @returns {cli} - return self for chaining
     * @throws {AzError}
     */
    public setSubscription(subscription: string) : cli {

        this.runner.clear()
        this.arg('account')
            .arg('set')
            .arg('--subscription=' + subscription)
            .exec()
        return this
    }

    /** start a new command stack that should end with an exec*() call */
    public beginCmd(): cli {
        this.runner.clear()
        return this
    }

    /**
     * Add one or more args to the argument list before execution.
     * @param {string | string[]} val - one or more args to add to the arg list. 
     *  Note: Quotes are treated literly in the argument. You do not need to quote arguments with spaces. Instead, they should be elements of the array.
     * @returns {cli} - returns self for chaining
     */
    public arg(val: string | string[]): cli {
        this.runner.arg(val);
        return this;
    }

    /**
     * Add the argument string to the argument list before execution
     * @param {string} val - expanded string of arguments to add (must quote spaces to keep the argument together)
     * @returns {cli} - returns self for chaining
     */
    public line(val: string): cli {
        this.runner.line(val);
        return this;
    }

    /**
     * Add one or more args to the argument list if the supplied condition is true
     * @param {()=>boolean} condition -function that must return a true/false condition
     * @param val - one or more args to add to the argument list
     * @returns {cli} - returns self for chaining
     */
    public argIf(condition: ()=>boolean, val: string | string[] ): cli {
        this.runner.argIf(condition, val);
        return this;
    }

    /**
     * Execute the az-cli tool with the previously supplied arguments.
     * @returns {string} - returns the results of the tool as a raw string
     * @throws {AzError}
     */
    public execRawString(): string {

        let result = this.runner.exec();
        this.throwIfError(result);
        return result.stdout;
    }

    /**
     * Execute the az-cli tool with the previously supplied arguments.
     * @returns {T} - Returns a object deserialized from json ouput of the az-cli tool
     * @throws {AzError}
     */
    public execJson<T>(): T {

        let result = this.runner.arg(['-o','json']).exec();
        this.throwIfError(result);

        return JSON.parse(result.stdout);
    }

    /**
     * Execute the az-cli tool with the previously supplied arguments.
     * @throws {AzError}
     */
    public exec(): void {
        let result = this.runner.exec();
        this.throwIfError(result);
    }
}

//Barrel exporting our supporting types for unit/mock support
export * from './mockrunner'
export * from './shellrunner'