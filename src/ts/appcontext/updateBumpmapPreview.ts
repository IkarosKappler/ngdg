/**
 * An AppContext function: set the global outline to use.
 *
 * @date 2026-03-13 Refactored from the global `index.js`.
 */

import { GeometryGenerationHelpers } from "../GeometryGenerationHelpers";
import { IBumpmap } from "../interfaces";

/**
 * Create a pewview for the used bumpmap.
 *
 * @param {IBumpmap|undefined} bumpmap
 * @param {boolean} isPreviewVisible
 */
export const updateBumpmapPreview = (bumpmap: IBumpmap, isPreviewVisible: boolean) => {
  // var updateBumpmapPreview = function (bumpmap, isPreviewVisible) {
  // Note: this is currently not in use
  var previewWrapper = document.getElementById("bumpmap-preview");
  if (bumpmap && isPreviewVisible) {
    var previewImageElem = bumpmap.createPreviewImage();
    previewImageElem.style["object-fit"] = "contain";
    previewImageElem.style["position"] = "relative";
    previewImageElem.style["box-flex"] = 1;
    previewImageElem.style["flex"] = "1 1 auto";
    previewImageElem.style["width"] = "100%";
    previewImageElem.style["height"] = "100%";
    GeometryGenerationHelpers.removeAllChildNodes(previewWrapper);
    previewWrapper.appendChild(previewImageElem);
    previewWrapper.style.display = "flex";
  } else {
    previewWrapper.style.display = "none";
  }
};
