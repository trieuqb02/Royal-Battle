import { Vec3 } from "cc";
import { CCComponentKey, CCComponentLocator } from "../../locator/ComponentLocator";
import { LayerManager } from "../../managers/LayerManager";
import { Utils } from "../../utils/Utils";
import { MovementComponent } from "../components/MovementComponent";
import { NodeConfigComponent } from "../components/NodeConfigComponent";
import { NodeRefComponent } from "../components/NodeRefComponent";
import { ECSEntity } from "../core/ECSEntity";
import { ECSQuery } from "../core/ECSQuery";
import { ECSSystem, ecsSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";
import { ECSNode } from "../core/ECSNode";

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
        const hasMovementComp = entity.hasComponent<MovementComponent>(MovementComponent);
        if (hasMovementComp) {
            const nodeRef = entity.getComponent<NodeRefComponent>(NodeRefComponent);
            const movementComp = entity.getComponent<MovementComponent>(MovementComponent);
            const eventProcess = nodeRef.node.getComponent<ECSNode>(ECSNode);
            eventProcess.syncPos(new Vec3(movementComp.x, movementComp.y, 0));
        }
    }
}