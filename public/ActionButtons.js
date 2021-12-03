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
      var buttonNew = createStyledButton();
      buttonNew.style.transform = "translateX(0px)";
      buttonNew.innerHTML = '<img src="icons/empty_document.png" />';
      buttonNew.setAttribute("title", "Start with a new model");
      buttonNew.addEventListener("click", actionCallback);
      document.querySelector("body").appendChild(buttonNew);
    };

    /**
     * Add the 'Fit to view' button to the action menu.
     *
     * @param {function} actionCallback - The function to be triggered when the button is clicked.
     */
    AB.addFitToViewButton = function (actionCallback) {
      var buttonFit = createStyledButton();
      buttonFit.style.transform = "translateX(26px)";
      buttonFit.innerHTML = '<img src="icons/fit_view.png" />';
      buttonFit.setAttribute("title", "Zoom to best fit");
      buttonFit.addEventListener("click", actionCallback);
      document.querySelector("body").appendChild(buttonFit);
    };

    var createStyledButton = function (button) {
      var button = document.createElement("button");
      button.style.position = "absolute";
      button.style.left = "10px";
      button.style.bottom = "10px";
      button.style.width = "24px";
      button.style.height = "24px";
      button.style.borderRadius = "12px";
      button.style.display = "flex";
      button.style["justify-content"] = "center";
      button.style.padding = "4px";
      return button;
    };

    return AB;
  })();
