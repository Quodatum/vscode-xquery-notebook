import * as basex from 'basex';
import util = require('util');
import { CellProvider } from './cellprovider';

export class XQueryCell implements CellProvider {
    private connected = false;
    private session: basex.Session | undefined;
    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {

            try {
                if (!this.connected) {
                    this.session = new basex.Session("localhost", 1984, "admin", "admin");
                    this.connected = true;
                    this.session.on("socketError",(e:any)=>{this.connected=false; reject(e);});
                }
                if(!this.session) reject("no sess");
                this.session?.query(code) .results(function (err: any, reply: any) {
                    if (err) reject(err);
                    resolve(reply.result);
                    
                }
                );

            } catch (err) {
                reject(err);
            }
        });
    }
}