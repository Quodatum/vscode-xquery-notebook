import * as basex from 'basex';
import util = require('util');
import { XQueryCell } from './xquery-cell';
import { JavascriptCell } from './javascript-cell';

export interface CellProvider {
     eval(code :string): Promise<any>;
}
 const Providers :Map<string,CellProvider|null> = new Map([
     ["xquery", null],
     ["javascript", null]
   ]);

export function getProvider(lang:string) :CellProvider{
     const r=Providers.get(lang);
     if(r) return r;
      
     let r2:CellProvider=new JavascriptCell();
     if (lang=="xquery") r2=new XQueryCell();
     if (lang=="javascript") r2=new JavascriptCell();
     Providers.set(lang,r2);
     return r2;
}
export function languages():string[]{
     return Array.from( Providers.keys() );
}
