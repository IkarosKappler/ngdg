/**
 * A basic IO interface for storing and retrieving json data from dropped files and local storage.
 *
 * @author  Ikaros Kappler
 * @date    2021-10-13
 * @version 1.0.0
 */

type PathDroppedCallback = (jsonData: string) => void;
type PathRequestJSONCallback = () => string;

export class ConfigIO {
  /**
   * The 'dropzone' element.
   * @private
   * @memberof ConfigIO
   * @member {HTMLElement}
   */
  private element: HTMLElement;

  private pathDroppedCallback: PathDroppedCallback | null;

  /**
   *
   * @param {HTMLElement} element - The element you wish to operate as the drop zone (like <body/>).
   */
  constructor(element: HTMLElement) {
    this.element = element;

    // Init the drop listeners
    element.addEventListener("drop", this.handleDropEvent.bind(this));
    element.addEventListener("dragover", this.handleDragOverEvent.bind(this));
    element.addEventListener("dragleave", this.handleDragLeaveEvent.bind(this));
  }

  /**
   * Install the drop callback. Note than only one callback can be installed in this
   * implementation. Calling this method multiple times will overwrite previously
   * installed listeners.
   *
   * The callback will receive the dropped files as a string.
   *
   * @param {(data:string)=>void} callback
   */
  onPathDropped(callback: PathDroppedCallback) {
    this.pathDroppedCallback = callback;
  }

  /**
   * Install a callback for retrieving the `bezier_path` string from the localstorage.
   *
   * @param {(data:string)=>void} handlePathRestored - The callback to handle the retrieved storage value. Will be called immediately.
   * @param {()=>string} requestPath - Requests the `bezier_path` string value to store; will be called on a 10 second timer interval.
   */
  onPathRestored(handlePathRestored: PathDroppedCallback, requestPath: PathRequestJSONCallback) {
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

  private handleDropEvent = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.element.style.opacity = "1.0";

    if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
      // No files were dropped
      return;
    }
    if (event.dataTransfer.files.length > 1) {
      // Multiple file drop is not nupported
      return;
    }
    if (!this.pathDroppedCallback) {
      // No handling callback defined.
      return;
    }
    if (event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      console.log("file", file);
      if (file.type.match(/json.*/)) {
        var reader = new FileReader();
        reader.onload = (readEvent: ProgressEvent<FileReader>) => {
          // Finished reading file data.
          this.pathDroppedCallback(readEvent.target.result as string);
        };
        reader.readAsText(file); // start reading the file data.
      }
    }
  };

  private handleDragOverEvent = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.element.style.opacity = "0.5";
  };

  private handleDragLeaveEvent = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.element.style.opacity = "1.0";
  };

  destroy() {
    this.element.removeEventListener("drop", this.handleDropEvent);
    this.element.removeEventListener("dragover", this.handleDragOverEvent);
    this.element.removeEventListener("dragleave", this.handleDragLeaveEvent);
  }
}
