import { CellProvider } from './cellprovider';

export class JavascriptCell implements CellProvider {

    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(eval?.(`"use strict";(${code})`));
            } catch (err :any) {
                reject({'message': err.message});
            }
        });
}
}