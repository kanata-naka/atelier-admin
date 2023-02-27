import { TypedUseSelectorHook, useDispatch as _useDispatch, useSelector as _useSelector } from "react-redux";
import { Dispatch, State } from "@/types";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch: () => Dispatch = _useDispatch;
export const useSelector: TypedUseSelectorHook<State> = _useSelector;
