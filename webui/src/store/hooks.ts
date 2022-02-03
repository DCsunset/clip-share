import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootDispatch, RootState } from ".";

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useRootDispatch = () => useDispatch<RootDispatch>();
