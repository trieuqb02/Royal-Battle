import { NodeRefComponent } from "../components/NodeRefComponent";
import { PrefabComponent } from "../components/PrefabComponent";
import { ECSEntity } from "../core/ECSEntity";
import { ECSQuery } from "../core/ECSQuery";
import { ecsSystem, ECSSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";

@ecsSystem(SystemType.NODE_BINDING)
export class NodeBindingSystem extends ECSSystem {
    constructor() {
        super(ECSQuery.all(PrefabComponent));
    }

    public onProcess(entities: readonly ECSEntity[], dt: number): void {
        for (const entity of entities) {
            this.bindNodeToEntity(entity);
        }
    }

    private bindNodeToEntity(entity: ECSEntity): void {
        const prefabComp = entity.getComponent<PrefabComponent>(PrefabComponent);
        if (prefabComp && prefabComp.node && !prefabComp.isDirty) {
            if (!entity.hasComponent(NodeRefComponent)) {
                entity.addComponent<NodeRefComponent>(NodeRefComponent);
            }
            const nodeRefComp = entity.getComponent<NodeRefComponent>(NodeRefComponent);
            nodeRefComp.node = prefabComp.node;
            prefabComp.isDirty = true;
        }
    }
}   