import { CellProvider } from './cellprovider';

export class JavascriptCell implements CellProvider {

    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const result=eval?.(`"use strict";${code}`);
                return resolve({"result":result});
            } catch (err :any) {
                reject({'message': err.message});
            }
        });
}
}