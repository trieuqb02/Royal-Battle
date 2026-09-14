import { CCComponentKey, CCComponentLocator } from "../../locator/ComponentLocator";
import { LayerManager } from "../../managers/LayerManager";
import { Utils } from "../../utils/Utils";
import { NodeConfigComponent } from "../components/NodeConfigComponent";
import { NodeRefComponent } from "../components/NodeRefComponent";
import { ECSEntity } from "../core/ECSEntity";
import { ECSQuery } from "../core/ECSQuery";
import { ECSSystem, ecsSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";

@ecsSystem(SystemType.COCOS_RENDERING)
export class CocosRenderSystem extends ECSSystem {

    private layerManager!: LayerManager;

    constructor() {
        super(ECSQuery.all(NodeRefComponent, NodeConfigComponent));
        this.layerManager = CCComponentLocator.getCCComponent(CCComponentKey.LAYER_MANAGER);
    }

    public onProcess(entities: readonly ECSEntity[], dt: number): void {
        for (const entity of entities) {
            this.updateNodeLayer(entity);
            this.updateNodeVisibility(entity);
            this.updateNodeTransform(entity);
        }
    }

    private updateNodeLayer(entity: ECSEntity): void {
        const nodeRef = entity.getComponent(NodeRefComponent);
        const nodeConfig = entity.getComponent(NodeConfigComponent);

        const node = nodeRef.node;
        const parentNode = this.layerManager.getNodeLayer(nodeConfig.layer);

        Utils.reparent(node, parentNode);
    }

    private updateNodeVisibility(entity: ECSEntity): void {
        const nodeRef = entity.getComponent(NodeRefComponent);
        const nodeConfig = entity.getComponent(NodeConfigComponent);
    }

    private updateNodeTransform(entity: ECSEntity): void {
        const nodeRef = entity.getComponent(NodeRefComponent);
        const nodeConfig = entity.getComponent(NodeConfigComponent);
    }
}