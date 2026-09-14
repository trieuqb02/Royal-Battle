import { ecsComponent, ECSComponent } from "../core/ECSComponent";
import { ComponentType } from "../type/ComponentType";
import { Layer, PrefabUrl } from "../../utils/Const";
import { NODE_STATE } from "./NodeRefComponent";

export enum LOADING_STATE {
    UNLOAD,
    LOADING,
    LOADED
}

@ecsComponent(ComponentType.NODE_CONFIG)
export class NodeConfigComponent extends ECSComponent {
    public prefabUrl!: PrefabUrl;
    public layer!: Layer;
    public state: LOADING_STATE = LOADING_STATE.UNLOAD;
}