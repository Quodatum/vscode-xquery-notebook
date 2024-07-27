
import { XQueryCell } from './xquery-cell';
import { JavascriptCell } from './javascript-cell';

export interface CellProvider {
     eval(code: string): Promise<any>;
}
const Providers: Map<string, CellProvider | null> = new Map([
     ["xquery", null],
     ["javascript", null]
]);

export function getProvider(lang: string): CellProvider {
     const r = Providers.get(lang);
     if (r) return r;
     let cell:CellProvider;
     switch (lang) {
          case "xquery":
               cell = new XQueryCell();
               break;
          case "javascript":
               cell = new JavascriptCell();
               break;
          default:
               throw "bad lang: "+lang;
     }
   
     Providers.set(lang, cell);
     return cell;
}
export function languages(): string[] {
     return Array.from(Providers.keys());
}
