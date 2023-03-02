import { DependencyList, RefObject, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch as _useDispatch, useSelector as _useSelector } from "react-redux";
import { Dispatch, State } from "@/types";

export const useDispatch: () => Dispatch = _useDispatch;

export const useSelector: TypedUseSelectorHook<State> = _useSelector;

export function useDropFile(
  ref: RefObject<HTMLElement>,
  validateFile: (file: File) => boolean,
  setFile: (file: File) => void,
  deps?: DependencyList
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    element.addEventListener("dragleave", (e) => {
      e.preventDefault();
    });
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        const files = e.dataTransfer.files;
        if (files.length && validateFile(files[0])) {
          setFile(files[0]);
        }
      }
    });
  }, deps);
}
