"use strict";
/**
 * @author  Ikaros Kappler
 * @date    2021-10-13
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigIO = void 0;
var ConfigIO = /** @class */ (function () {
    function ConfigIO(element) {
        var _this = this;
        this.handleDropEvent = function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("File dropped", event);
            _this.element.style.opacity = "1.0";
            if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
                // No files were dropped
                return;
            }
            if (event.dataTransfer.files.length > 1) {
                // Multiple file drop is not nupported
                return;
            }
            if (!_this.pathDroppedCallback) {
                // No handling callback defined.
                return;
            }
            if (event.dataTransfer.files[0]) {
                var file = event.dataTransfer.files[0];
                console.log("file", file);
                if (file.type.match(/json.*/)) {
                    var reader = new FileReader();
                    reader.onload = function (readEvent) {
                        // Finished reading file data.
                        console.log(readEvent.target.result);
                        _this.pathDroppedCallback(readEvent.target.result);
                    };
                    reader.readAsText(file); // start reading the file data.
                }
            }
        };
        this.handleDragOverEvent = function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Drag over", event);
            _this.element.style.opacity = "0.5";
        };
        this.handleDragLeaveEvent = function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Drag out", event);
            _this.element.style.opacity = "1.0";
        };
        this.element = element;
        // Init
        element.addEventListener("drop", this.handleDropEvent.bind(this));
        element.addEventListener("dragover", this.handleDragOverEvent.bind(this));
        element.addEventListener("dragleave", this.handleDragLeaveEvent.bind(this));
    }
    ConfigIO.prototype.onPathDropped = function (callback) {
        this.pathDroppedCallback = callback;
    };
    ConfigIO.prototype.destroy = function () {
        this.element.removeEventListener("drop", this.handleDropEvent);
        this.element.removeEventListener("dragover", this.handleDragOverEvent);
        this.element.removeEventListener("dragleave", this.handleDragLeaveEvent);
    };
    return ConfigIO;
}());
exports.ConfigIO = ConfigIO;
//# sourceMappingURL=ConfigIO.js.map