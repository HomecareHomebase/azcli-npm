import * as Q from 'q';
import * as child from 'child_process';
import events = require('events');
import { isRegExp } from 'util';


/**
 * Interface for exec results
 */
export interface IExecResults {

    /** standard output */
    stdout: string;

    /** error output */
    stderr: string;

    /** return code */
    code: number;

    /** Error on failure */
    error: Error;

    /** arguments */
    arguments: string[]
}

export interface ShellRunnerType {
    new(shellPath: string): ShellRunner;
  }

export class ShellRunner extends events.EventEmitter {
    constructor(shellPath: string){
        super()

        if (!shellPath) {
            throw new Error('Parameter \'shellPath\' cannot be null or empty.');
        }    
        this.shellPath = shellPath;
    };

    protected shellPath: string;
    protected args:string[] = [];


    protected parseArgLine(arg: string ): string[] {

        var args = [];

        var inQuotes = false;
        var escaped = false;
        var specArg = '';

        var append = function (c: string) {
            if (escaped && c !== '"') {
                specArg += '\\';
            }

            specArg += c;
            escaped = false;
        }

        for (let i = 0; i < arg.length; i++) {
            var c = arg.charAt(i);

            if (c === '"') {
                if (!escaped) {
                    inQuotes = !inQuotes;
                }
                else {
                    append(c);
                }
                continue;
            }

            if (c === "\\" && inQuotes) {
                escaped = true;
                continue;
            }

            if (c === ' ' && !inQuotes) {
                if (specArg.length > 0) {
                    args.push(specArg);
                    specArg = '';
                }
                continue;
            }

            append(c);
        }

        if (specArg.length > 0) {
            args.push(specArg.trim());
        }

        return args;
    }

    private getShellPath(): string {
        return this.shellPath;
    }

    private getShellArgs(): string[] {
        return this.args;
    }

    private getSpawnOptions(options: child.SpawnSyncOptions = <child.SpawnSyncOptions>{}): child.SpawnSyncOptions {
        let result = options;
        result.cwd = process.cwd()
        result.env = process.env
        return result;
    }

    /** Reset all arugments */
    public clear(): void {
        this.args = []
    }

    /**
     * Start a new arg->exec chain which is guaranteed to be async safe
     * @returns {ShellRunner} - returns a new instance of a shell runner with an isolated argument buffer
     */
    public start(): ShellRunner {

        let shell = new ShellRunner(this.shellPath)
        return shell
    }

    /**
     * Add argument
     * Add one or more arguments to the argument buffer 
     * returns ShellRunner to chain
     * 
     * @param     val        string arg or array of args
     * @returns   ShellRunner
     */
    public arg(val: string | string[]): ShellRunner {

        if (!val) {
            return this;
        }

        if (val instanceof Array) {
            this.args = this.args.concat(val);
        }
        else if (typeof (val) === 'string') {
            this.args = this.args.concat(val.trim());
        }

        return this;
    }

     /**
     * Parses a full argument into one or more arguments
     * e.g. .line('"arg one" two -z') is equivalent to .arg(['arg one', 'two', '-z'])
     *  returns ShellRunner to chain
     * 
     * @param     val        string argument line
     * @returns   ToolRunner
     */
    public line(val: string): ShellRunner {

        if (!val) {
            return this;
        }

        this.args = this.args.concat(this.parseArgLine(val));
        return this;
    }

    /**
     * Add argument(s) if a condition is met
     * Wraps arg().  See arg for details
     * returns ShellRunner for chaining
     *
     * @param     condition     boolean condition
     * @param     val     string cmdline or array of strings
     * @returns   ShellRunner
     */
    public argIf(condition: ()=>boolean, val: string | string[] ): ShellRunner {
        if (condition) {
            this.arg(val);
        }
        return this;
    }

    /**
     * Execute the shell command against the current argument collection
     * @returns {IExecResults} - results of the shell execution
     */
    public exec() : IExecResults {

        let r = child.spawnSync(this.getShellPath(), this.getShellArgs(), this.getSpawnOptions());
        
        var res: IExecResults = <IExecResults>{ code: r.status, error: r.error, stdout: "", stderr: ""};
        res.stdout = (r.stdout) ? r.stdout.toString() : "";
        res.stderr = (r.stderr) ? r.stderr.toString() : "";
        res.arguments = this.args
        return res;
    }

    /**
     * Execute the shell command async
     * @returns {Promise<IExecResults>} - results of the shell execution
     */
    public execAsync(): Promise<IExecResults> {

        let proc = child.spawn(this.getShellPath(), this.getShellArgs(), this.getSpawnOptions())
        let p = new Promise<IExecResults>((resolves)=>
        {
            var res: IExecResults = <IExecResults>{}

            let stdout = (proc.stdout && proc.stdout.readable) ? Buffer.alloc(0) : null,
            stderr = (proc.stderr && proc.stderr.readable) ? Buffer.alloc(0) : null

            if (Buffer.isBuffer(stdout)) {
                proc.stdout.on('data', (data) => stdout = Buffer.concat([ stdout, data ]));
            }
            if (Buffer.isBuffer(stderr)) {
                proc.stderr.on('data', (data) => stderr = Buffer.concat([ stderr, data ]));
            }

            proc.on('close', (exitCode) => {
                res.code = exitCode
                res.stdout = (stdout) ? stdout.toString() : "";
                res.stderr = (stderr) ? stderr.toString() : "";
                res.arguments = this.args
                resolves(res)
            })
        })
        return p
    }

    public async execStream(): Promise<number> {

        let proc = child.spawn(this.getShellPath(), this.getShellArgs(), 
        this.getSpawnOptions(<child.SpawnSyncOptions>{stdio:"inherit"}))
        let p = new Promise<number>((resolves, rejected)=>
        {
            proc.on('close', (exitCode) => {
                resolves(exitCode)
            })

        })
        
        return await p
    }


}