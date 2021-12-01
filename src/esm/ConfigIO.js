/**
 * @author  Ikaros Kappler
 * @date    2021-10-13
 * @version 1.0.0
 */
export class ConfigIO {
    constructor(element) {
        this.handleDropEvent = (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("File dropped", event);
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
                    reader.onload = (readEvent) => {
                        // Finished reading file data.
                        //   console.log(readEvent.target.result);
                        this.pathDroppedCallback(readEvent.target.result);
                    };
                    reader.readAsText(file); // start reading the file data.
                }
            }
        };
        this.handleDragOverEvent = (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("Drag over", event);
            this.element.style.opacity = "0.5";
        };
        this.handleDragLeaveEvent = (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("Drag out", event);
            this.element.style.opacity = "1.0";
        };
        this.element = element;
        // Init
        element.addEventListener("drop", this.handleDropEvent.bind(this));
        element.addEventListener("dragover", this.handleDragOverEvent.bind(this));
        element.addEventListener("dragleave", this.handleDragLeaveEvent.bind(this));
    }
    onPathDropped(callback) {
        this.pathDroppedCallback = callback;
    }
    onPathRestored(handlePathRestored, requestPath) {
        const bezierJSON = localStorage.getItem("bezier_path");
        if (bezierJSON) {
            handlePathRestored(bezierJSON);
        }
        setInterval(() => {
            const newBezierJSON = requestPath();
            console.log("localstorage store", newBezierJSON);
            if (newBezierJSON) {
                localStorage.setItem("bezier_path", newBezierJSON);
            }
        }, 10000);
    }
    destroy() {
        this.element.removeEventListener("drop", this.handleDropEvent);
        this.element.removeEventListener("dragover", this.handleDragOverEvent);
        this.element.removeEventListener("dragleave", this.handleDragLeaveEvent);
    }
}
//# sourceMappingURL=ConfigIO.js.map