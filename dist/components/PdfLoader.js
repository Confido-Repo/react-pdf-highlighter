import React, { Component } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
export class PdfLoader extends Component {
    state = {
        pdfDocument: null,
        error: null,
    };
    documentRef = React.createRef();
    componentDidMount() {
        this.load();
    }
    componentWillUnmount() {
        const { pdfDocument: discardedDocument } = this.state;
        if (discardedDocument) {
            // pdfjs >= 6 removed PDFDocumentProxy.destroy(); the loading task owns
            // worker/network teardown.
            discardedDocument.loadingTask.destroy();
        }
    }
    componentDidUpdate({ url }) {
        if (this.props.url !== url) {
            this.load();
        }
    }
    componentDidCatch(error) {
        const { onError } = this.props;
        if (onError) {
            onError(error);
        }
        this.setState({ pdfDocument: null, error });
    }
    load() {
        const { ownerDocument = document } = this.documentRef.current || {};
        const { url, cMapUrl, cMapPacked, workerSrc } = this.props;
        const { pdfDocument: discardedDocument } = this.state;
        this.setState({ pdfDocument: null, error: null });
        if (typeof workerSrc === "string") {
            GlobalWorkerOptions.workerSrc = workerSrc;
        }
        Promise.resolve()
            .then(() => discardedDocument?.loadingTask.destroy())
            .then(() => {
            if (!url) {
                return;
            }
            const document = {
                ...this.props,
                ownerDocument,
                cMapUrl,
                cMapPacked,
            };
            return getDocument(document).promise.then((pdfDocument) => {
                this.setState({ pdfDocument });
            });
        })
            .catch((e) => this.componentDidCatch(e));
    }
    render() {
        const { children, beforeLoad } = this.props;
        const { pdfDocument, error } = this.state;
        return (React.createElement(React.Fragment, null,
            React.createElement("span", { ref: this.documentRef }),
            error
                ? this.renderError()
                : !pdfDocument || !children
                    ? beforeLoad
                    : children(pdfDocument)));
    }
    renderError() {
        const { errorMessage } = this.props;
        if (errorMessage) {
            return React.cloneElement(errorMessage, { error: this.state.error });
        }
        return null;
    }
}
export default PdfLoader;
//# sourceMappingURL=PdfLoader.js.map