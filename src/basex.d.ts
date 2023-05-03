
declare module 'basex'{
import { Event } from "vscode";
export class Session{
    constructor(host:string, port:number, username:string, password:string);
    public query(code :string): Query;
    public close() :void
    // eslint-disable-next-line @typescript-eslint/ban-types
    public on(event:string,handler:Function) :this;
}
export class Query{
    public close() :void;
    public results(callback :any) :void
}
}