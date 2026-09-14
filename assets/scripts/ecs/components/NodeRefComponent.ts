import { Node } from "cc";
import { ecsComponent, ECSComponent } from "../core/ECSComponent";
import { ComponentType } from "../type/ComponentType";

export enum NODE_STATE {
    LOADED,
    LOADING,
    UNLOAD
}

@ecsComponent(ComponentType.NODE_REF)
export class NodeRefComponent extends ECSComponent {
    public node!: Node;
    public state!: NODE_STATE;
}