import React, { Component } from "react";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface Props {
  /**
   * URL for the pdf.js worker, applied to `GlobalWorkerOptions.workerSrc`.
   * Confido fork: no CDN default — the worker must be supplied by the host
   * application (e.g. a bundled asset URL) so it always matches the installed
   * pdfjs-dist version and avoids an external runtime dependency.
   */
  workerSrc?: string;

  /**
   * Directory URL pdf.js fetches its WebAssembly decoders from (CCITT/JBIG2/
   * JPX images, ICC color profiles); pdf.js appends fixed filenames to it.
   * Forwarded to `getDocument` along with the rest of these props.
   */
  wasmUrl?: string;

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

export class PdfLoader extends Component<Props, State> {
  state: State = {
    pdfDocument: null,
    error: null,
  };

  documentRef = React.createRef<HTMLElement>();

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

  componentDidUpdate({ url }: Props) {
    if (this.props.url !== url) {
      this.load();
    }
  }

  componentDidCatch(error: Error) {
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
    return (
      <>
        <span ref={this.documentRef} />
        {error
          ? this.renderError()
          : !pdfDocument || !children
            ? beforeLoad
            : children(pdfDocument)}
      </>
    );
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
