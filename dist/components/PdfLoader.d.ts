import React, { Component } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
interface Props {
    /**
     * URL for the pdf.js worker, applied to `GlobalWorkerOptions.workerSrc`.
     * Confido fork: no CDN default — the worker must be supplied by the host
     * application (e.g. a bundled asset URL) so it always matches the installed
     * pdfjs-dist version and avoids an external runtime dependency.
     */
    workerSrc?: string;
    url: string;
    beforeLoad: JSX.Element;
    errorMessage?: JSX.Element;
    children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
    onError?: (error: Error) => void;
    cMapUrl?: string;
    cMapPacked?: boolean;
}
interface State {
    pdfDocument: PDFDocumentProxy | null;
    error: Error | null;
}
export declare class PdfLoader extends Component<Props, State> {
    state: State;
    documentRef: React.RefObject<HTMLElement>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate({ url }: Props): void;
    componentDidCatch(error: Error): void;
    load(): void;
    render(): React.JSX.Element;
    renderError(): React.FunctionComponentElement<any> | null;
}
export default PdfLoader;
