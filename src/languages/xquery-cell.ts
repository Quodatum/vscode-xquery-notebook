import * as basex from '@quodatum/basex';

import { CellProvider } from './cellprovider';
import { Configuration } from '../common';

export class XQueryCell implements CellProvider {
    private connected = false;
    private session: basex.Session | undefined;
   
    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {

            try {
                if (!this.connected) {
                    this.session = newSession();
                    this.connected = true;
                    this.session.on("socketError",
                        (e: any) => { this.connected = false; reject(e); }
                    );
                }
                if (!this.session) reject("no sess");
                const q = this.session?.query(code);
                q?.results(
                    function (err: any, reply: any) {
                        if (err) reject(err); resolve(reply.result);
                    }
                );
                q?.close();

            } catch (err) {
                reject(err);
            }
        });
    }
}

function newSession(): basex.Session {
    return new basex.Session(
        Configuration.hostname, Configuration.port,
        Configuration.user, Configuration.password
    );
}