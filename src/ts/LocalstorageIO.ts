/**
 * A basic IO interface for storing and retrieving json data from local storage.
 *
 * @author   Ikaros Kappler
 * @date     2021-10-13
 * @modified 2022-02-02 Removed the dnd IO (using FileDrop.js instead).
 * @modified 2022-02-23 Handling twistAngle and bendAngle, too.
 * @version  1.2.0
 */

type PathRestoredCallback = (jsonData: string, bendAngle: number, twistAngle: number) => void;
type PathDataRequestCallback = () => { bezierJSON: string; bendAngle: number; twistAngle: number };

export class LocalstorageIO {
  constructor() {}

  /**
   * Install a callback for retrieving the `bezier_path` string from the localstorage.
   *
   * @param {(data:string)=>void} handlePathRestored - The callback to handle the retrieved storage value. Will be called immediately.
   * @param {()=>string} requestPath - Requests the `bezier_path` string value to store; will be called on a 10 second timer interval.
   */
  onPathRestored(handlePathRestored: PathRestoredCallback, requestPathData: PathDataRequestCallback) {
    const bezierJSON = localStorage.getItem("bezier_path");
    const bendAngle = localStorage.getItem("bend_angle");
    const twistAngle = localStorage.getItem("twist_angle");
    if (bezierJSON) {
      handlePathRestored(bezierJSON, bendAngle ? Number(bendAngle) : 0.0, twistAngle ? Number(twistAngle) : 0.0);
    }
    setInterval(() => {
      const pathData = requestPathData();
      if (pathData.bezierJSON) {
        localStorage.setItem("bezier_path", pathData.bezierJSON);
      }
      if (pathData.bendAngle) {
        localStorage.setItem("bend_angle", pathData.bendAngle.toString());
      }
      if (pathData.twistAngle) {
        localStorage.setItem("twist_angle", pathData.twistAngle.toString());
      }
    }, 10000);
  }
}
