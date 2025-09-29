import { useContext } from "react";
import { OperationGroupContext } from "../contexts/OperationGroup";

export function useOperationGroup() {
    return useContext(OperationGroupContext);
}
