import { JsxElement } from "typescript";

// external.d.ts
declare module JSX {
  type Element = JsxElement;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
