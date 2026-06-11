import React, { Component } from "react";
import { Rnd } from "react-rnd";
import { getPageFromElement } from "../lib/pdfjs-dom";
import "../style/AreaHighlight.css";
export class AreaHighlight extends Component {
    render() {
        const { highlight, onChange, isScrolledTo, ...otherProps } = this.props;
        return (React.createElement("div", { className: `AreaHighlight ${isScrolledTo ? "AreaHighlight--scrolledTo" : ""}` },
            React.createElement(Rnd, { className: "AreaHighlight__part", onDragStop: (_, data) => {
                    const boundingRect = {
                        ...highlight.position.boundingRect,
                        top: data.y,
                        left: data.x,
                    };
                    onChange(boundingRect);
                }, onResizeStop: (_mouseEvent, _direction, ref, _delta, position) => {
                    const boundingRect = {
                        top: position.y,
                        left: position.x,
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                        pageNumber: getPageFromElement(ref)?.number || -1,
                    };
                    onChange(boundingRect);
                }, position: {
                    x: highlight.position.boundingRect.left,
                    y: highlight.position.boundingRect.top,
                }, size: {
                    width: highlight.position.boundingRect.width,
                    height: highlight.position.boundingRect.height,
                }, onClick: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }, ...otherProps })));
    }
}
export default AreaHighlight;
//# sourceMappingURL=AreaHighlight.js.map