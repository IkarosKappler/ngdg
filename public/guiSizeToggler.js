/**
 * @requires dat.gui
 *
 * @author   Ikaros Kappler
 * @date     2021-12-13
 * @modified 2022-01-10
 * @version  1.0.1
 */

globalThis.guiSizeToggler =
  globalThis.guiSizeToggler ||
  (function () {
    var gst = function (gui, config, cssProps) {
      return {
        update: function () {
          applyGuiSize(gui, config.guiDoubleSize, cssProps);
        }
      };
    };

    /**
     *
     * @param {boolean} guiDoubleSize
     */
    var applyGuiSize = function (gui, guiDoubleSize, cssProps) {
      if (cssProps && cssProps.hasOwnProperty("transformOrigin")) {
        gui.domElement.style["transform-origin"] = cssProps["transformOrigin"];
      } else {
        gui.domElement.style["transform-origin"] = "100% 0%";
      }

      const transform = cssProps && cssProps.hasOwnProperty("transform") ? cssProps["transform"] + " " : "";

      if (guiDoubleSize) {
        gui.domElement.style["transform"] = transform + "scale(2.0)";
      } else {
        gui.domElement.style["transform"] = transform + "scale(1.0)";
      }
    };

    return gst;
  })();
