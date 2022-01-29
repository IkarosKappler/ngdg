/**
 * A set of action buttons to display in the left lower corner.
 *
 * @author  Ikaros Kappler
 * @version 1.0.0
 * @date    2021-12-03
 */

globalThis.ActionButtons =
  globalThis.ActionButtons ||
  (function () {
    var AB = {};

    /**
     * Add the 'New' button to the action menu.
     *
     * @param {function} actionCallback - The function to be triggered when the button is clicked.
     */
    AB.addNewButton = function (actionCallback) {
      var buttonNew = createStyledButton("icons/empty_document.png", "Start with a new model", actionCallback);
      buttonNew.style.transform = "translateX(0px)";
      document.querySelector("body").appendChild(buttonNew);
    };

    /**
     * Add the 'Fit to view' button to the action menu.
     *
     * @param {function} actionCallback - The function to be triggered when the button is clicked.
     */
    AB.addFitToViewButton = function (actionCallback) {
      var buttonFit = createStyledButton("icons/fit_view.png", "Zoom to best fit", actionCallback);
      buttonFit.style.transform = "translateX(26px)";
      document.querySelector("body").appendChild(buttonFit);
    };

    var createStyledButton = function (iconPath, title, actionCallback) {
      var button = document.createElement("button");
      button.style.position = "absolute";
      button.style.left = "10px";
      button.style.bottom = "10px";
      button.style.width = "24px";
      button.style.height = "24px";
      button.style.borderRadius = "12px";
      button.style.display = "flex";
      button.style["justify-content"] = "space-around";
      button.style["align-items"] = "center";
      button.style.padding = "4px";
      button.style["outline"] = "none";
      button.style["border-width"] = "1px";
      button.style["border-style"] = "solid";

      button.style["background-image"] = "url('" + iconPath + "')";
      button.style["background-size"] = "60% 60%";
      button.style["background-position"] = "center center";
      button.style["background-repeat"] = "no-repeat";

      button.classList.add("action-button");
      button.setAttribute("title", title);
      button.addEventListener("click", actionCallback);

      return button;
    };

    return AB;
  })();
