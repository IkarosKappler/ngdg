/**
 * A basic IO interface for storing and retrieving json data from local storage.
 *
 * @author   Ikaros Kappler
 * @date     2021-10-13
 * @modified 2022-02-02 Removed the dnd IO (using FileDrop.js instead).
 * @version  1.1.0
 */

type PathRestoredCallback = (jsonData: string) => void;
type PathRequestJSONCallback = () => string;

export class LocalstorageIO {
  /**
   *
   * @param {HTMLElement} element - The element you wish to operate as the drop zone (like <body/>).
   */
  constructor() {}

  /**
   * Install a callback for retrieving the `bezier_path` string from the localstorage.
   *
   * @param {(data:string)=>void} handlePathRestored - The callback to handle the retrieved storage value. Will be called immediately.
   * @param {()=>string} requestPath - Requests the `bezier_path` string value to store; will be called on a 10 second timer interval.
   */
  onPathRestored(handlePathRestored: PathRestoredCallback, requestPath: PathRequestJSONCallback) {
    const bezierJSON = localStorage.getItem("bezier_path");
    if (bezierJSON) {
      handlePathRestored(bezierJSON);
    }
    setInterval(() => {
      const newBezierJSON = requestPath();
      if (newBezierJSON) {
        localStorage.setItem("bezier_path", newBezierJSON);
      }
    }, 10000);
  }
}
