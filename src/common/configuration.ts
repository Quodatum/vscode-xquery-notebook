import { workspace, Uri } from "vscode";

export const ExtensionTopLevelSection = "quobook";

export interface Server{
    name?:string;
    hostname:string;
    port:number;
    user:string;
    password:string;
}

export class Configuration {
    static get hostname(): string {
        return this._getForWindow<string>("server.host");
    }

    static get port(): number {
        return this._getForWindow<number>("server.port");
    }

    static get user(): string {
        return this._getForWindow<string>("server.user");
    }

    static get password(): string {
        return this._getForWindow<string>("server.password");
    }
    static get connection(): Server {
        return this._getForWindow<object>("server") as Server;
    }
    static set connection(server :Server) {
        this._setForWindow<object>("server",server);
    }
    static get connections(): Server[] {
        return this._getForWindow<object>("connections") as Server[];
    }
    static set connections(servers :Server[]) {
        this._setForWindow<object>("server",servers);
    }
    private static _getForResource<T>(section: string, resource: Uri): T {
        return workspace.getConfiguration(ExtensionTopLevelSection, resource).get<T>(section)!;
    }

    private static _getForWindow<T>(section: string): T  {
        return workspace.getConfiguration(ExtensionTopLevelSection).get<T>(section)!;
    }
    private static _setForWindow<T>(section: string,value:any) {
         workspace.getConfiguration(ExtensionTopLevelSection).update(section,value);
    }
    static get summary():string{
        return `${Configuration.user}@${Configuration.hostname}:${Configuration.port}`;
    }
}