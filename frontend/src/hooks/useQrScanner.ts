"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type ScannerStatus = "idle" | "starting" | "scanning" | "error";

type UseQrScannerArgs = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onResult: (text: string) => void;
};

type ScannerControls = {
  stop?: () => void;
  releaseAllStreams?: () => void;
};

type ScannerReader = {
  reset?: () => void;
  decodeFromVideoDevice: (
    deviceId: string | undefined,
    previewElem: HTMLVideoElement,
    callbackFn: (result: { getText: () => string } | undefined, error: unknown) => void
  ) => Promise<ScannerControls>;
};

function getFriendlyScannerError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name?: string }).name)
      : "";

  if (name === "NotAllowedError") {
    return "Camera access denied. Allow camera access in your browser settings and try again.";
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return "Camera access requires HTTPS or localhost. Open this page in a secure context and try again.";
  }

  if (name === "NotFoundError") {
    return "No camera was found on this device.";
  }

  if (name === "NotReadableError") {
    return "The camera is already in use by another application.";
  }

  return message || "Unable to start the camera scanner.";
}

export function useQrScanner({ videoRef, onResult }: UseQrScannerArgs) {
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<ScannerControls | null>(null);
  const readerRef = useRef<ScannerReader | null>(null);

  const stop = useCallback(() => {
    controlsRef.current?.stop?.();
    controlsRef.current?.releaseAllStreams?.();
    readerRef.current?.reset?.();
    controlsRef.current = null;
    readerRef.current = null;

    const video = videoRef.current;
    if (video?.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    setStatus((current) => (current === "error" ? current : "idle"));
  }, [videoRef]);

  const start = useCallback(async () => {
    if (status === "starting" || status === "scanning") {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      setError("Unable to start the scanner because the camera element is unavailable.");
      setStatus("error");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access requires HTTPS or localhost. Open this page in a secure context and try again.");
      setStatus("error");
      return;
    }

    try {
      setError(null);
      setStatus("starting");
      stop();

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader() as unknown as ScannerReader;
      readerRef.current = reader;

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        video,
        (result) => {
          if (result) {
            onResult(result.getText());
            return;
          }

          // Per-frame decode failures (no code visible yet, checksum mismatch,
          // format mismatch) are expected during scanning and must not be
          // escalated. Class names get minified in production, so we cannot
          // reliably filter on `error.name` — we just ignore all decode errors
          // here. Real setup failures throw from `decodeFromVideoDevice` itself
          // and are caught by the outer try/catch.
        }
      );

      controlsRef.current = controls;
      setStatus("scanning");
    } catch (scannerError) {
      stop();
      setError(getFriendlyScannerError(scannerError));
      setStatus("error");
    }
  }, [onResult, status, stop, videoRef]);

  useEffect(() => stop, [stop]);

  return { start, stop, status, error };
}
