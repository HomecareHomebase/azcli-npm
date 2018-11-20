import * as Q from 'q';
import * as child from 'child_process';
import events = require('events');


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
}

export class ShellRunner extends events.EventEmitter {
    constructor(shellPath: string){
        super()

        if (!shellPath) {
            throw new Error('Parameter \'shellPath\' cannot be null or empty.');
        }    
        this.shellPath = shellPath;
    };

    private shellPath: string;
    private args:string[] = [];


    private parseArgLine(arg: string ): string[] {

        var args = [];

        var inQuotes = false;
        var escaped = false;
        var arg = '';

        var append = function (c: string) {
            if (escaped && c !== '"') {
                arg += '\\';
            }

            arg += c;
            escaped = false;
        }

        for (var i = 0; i < arg.length; i++) {
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
                if (arg.length > 0) {
                    args.push(arg);
                    arg = '';
                }
                continue;
            }

            append(c);
        }

        if (arg.length > 0) {
            args.push(arg.trim());
        }

        return args;
    }

    private getShellPath(): string {
        return this.shellPath;
    }

    private getShellArgs(): string[] {
        return this.args;
    }

    private getSpawnOptions(): child.SpawnSyncOptions {
        let result = <child.SpawnSyncOptions>{};
        result.cwd = process.cwd();
        result.env = process.env;
        return result;
    }

    /** Reset all arugments */
    public clear(): void {
        this.args = []
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

    public exec() : IExecResults {

       // let defer = Q.defer();

        let r = child.spawnSync(this.getShellPath(), this.getShellArgs(), this.getSpawnOptions());

        this.clear()
        
        var res: IExecResults = <IExecResults>{ code: r.status, error: r.error, stdout: "", stderr: ""};
        res.stdout = (r.stdout) ? r.stdout.toString() : "";
        res.stderr = (r.stderr) ? r.stderr.toString() : "";
        return res;
    }


}