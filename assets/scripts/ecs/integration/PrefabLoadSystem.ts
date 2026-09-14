import { Node } from "cc";
import { CCComponentKey, CCComponentLocator } from "../../locator/ComponentLocator";
import { WorldPoolManager } from "../../manager/WorldPoolManager";
import { LOADING_STATE, NodeConfigComponent } from "../components/NodeConfigComponent";
import { ECSEntity } from "../core/ECSEntity";
import { ECSQuery } from "../core/ECSQuery";
import { ecsSystem, ECSSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";
import { PrefabComponent } from "../components/PrefabComponent";

@ecsSystem(SystemType.PREFAB_LOADER)
export class PrefabLoadSystem extends ECSSystem {
    private worldPoolMgr: WorldPoolManager;

    constructor() {
        super(ECSQuery.all(NodeConfigComponent));
        this.worldPoolMgr = CCComponentLocator.getCCComponent<WorldPoolManager>(CCComponentKey.WORLD_POOL);
    }

    public onProcess(entities: readonly ECSEntity[], dt: number): void {
        for (const entity of entities) {
            this.loadPrefab(entity);
        }
    }

    private loadPrefab(entity: ECSEntity): void {
        const nodeConfig = entity.getComponent<NodeConfigComponent>(NodeConfigComponent);

        if (nodeConfig.isDirty) {
            this.collectNodeFromEntity(entity);
            nodeConfig.state = LOADING_STATE.UNLOAD;
        }

        if (!nodeConfig) {
            console.warn("NodeConfigComponent not found for entity:", entity.getId());
            return;
        }

        if (!nodeConfig.prefabUrl) {
            console.warn("Prefab URL not found for entity:", entity.getId());
            return;
        }

        if (nodeConfig.state === LOADING_STATE.LOADED) {
            return;
        }

        const node = this.worldPoolMgr.getNode(nodeConfig.prefabUrl);
        if (node != null && nodeConfig.isDirty) {
            nodeConfig.isDirty = false;
            this.attachNodeToEntity(entity, node);
            nodeConfig.state = LOADING_STATE.LOADED;
        }
    }

    private attachNodeToEntity(entity: ECSEntity, node: Node): void {
        if (!entity.hasComponent(PrefabComponent)) {
            entity.addComponent<PrefabComponent>(PrefabComponent);
        }
        const prefabComp = entity.getComponent<PrefabComponent>(PrefabComponent);
        prefabComp.node = node;
        prefabComp.isDirty = false;
    }

    private collectNodeFromEntity(entity: ECSEntity): void {
        const prefabComp = entity.getComponent<PrefabComponent>(PrefabComponent);
        if (prefabComp && prefabComp.node) {
            const prefabUrl = entity.getComponent<NodeConfigComponent>(NodeConfigComponent).prefabUrl;
            this.worldPoolMgr.putNode(prefabUrl, prefabComp.node);
            prefabComp.node = null;
        }
    }

}
