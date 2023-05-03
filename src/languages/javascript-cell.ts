import {CellProvider}  from './cellprovider';

export class JavascriptCell implements CellProvider {
   
    async eval(code: string): Promise<any> {
        try {
            return  eval?.(`"use strict";(${code})`);
        } catch (err :any) {
            return err;
        } 
    }
}