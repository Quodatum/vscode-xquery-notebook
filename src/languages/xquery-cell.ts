import * as basex from '@quodatum/basex';
import * as vscode from 'vscode';
import { CellProvider } from './cellprovider';
import { Configuration } from '../common';
export type EvalResult={
    serialization: string;
    result: string[]
}

export class XQueryCell implements CellProvider {
    private connected = false;
    private session: basex.Session | undefined;
   
    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let query :basex.Query | undefined;
            try {
                if (!this.connected) {
                    this.session = newSession();
                    this.connected = true;
                    this.session.on("socketError",
                        (e: any) => { 
                            this.connected = false;
                            vscode.window.showInformationMessage("BaseX socket error."); 
                            reject(e);
                        }
                    );
                }
                if (!this.session) reject("no sess");
                query = this.session?.query(code);
                    
                    query?.results(function (err: any, reply: any) {
                        if (err) return reject(err);
                        const result=reply.result;
                        query?.options(function (err: any, reply: any){
                            if (err) return reject(err);
                        const serialization=reply.result;   
                        resolve({serialization:serialization,
                                result: result});
                        if(serialization) vscode.window.showInformationMessage("serialization: "+serialization); 
                        query?.close();       
                    });
                });
                
                 

            } catch (err) {
                reject(err);
            } finally {
               // query?.close();
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

const qresult = (query: { results: (arg0: (err: any, data: any) => void) => void; }) => {
    return new Promise((resolve, reject) => {
        query.results((err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
const qoptions = (query: { option: (arg0: (err: any, data: any) => void) => void; }) => {
    return new Promise((resolve, reject) => {
        query.option((err: any, data: unknown) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};