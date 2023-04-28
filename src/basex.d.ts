declare module 'basex'{
export class Session{
    constructor(host:string, port:number, username:string, password:string);
    public query(code :string): [Query];
    public close() :void
}
export class Query{
    public close() :void;
    public results(callback :any) :void
}
}