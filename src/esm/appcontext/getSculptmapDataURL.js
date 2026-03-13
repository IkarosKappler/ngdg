/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */
import { ngdg } from "../ngdg";
export const getSculptmapDataURL = (appContext) => {
    return () => {
        const geometry = appContext.dildoGeneration.primaryDildoGeometry;
        const sculptmap = ngdg.SculptMap.fromDildoGeometry(geometry);
        const canvas = sculptmap.toCanvas();
        const dataString = canvas.toDataURL();
        return dataString;
    };
};
//# sourceMappingURL=getSculptmapDataURL.js.map