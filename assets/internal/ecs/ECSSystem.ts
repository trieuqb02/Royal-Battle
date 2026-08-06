import { ECSEntity } from "./ECSEntity";
import { ECSQuery } from "./ECSQuery";
import { ECSScene } from "./ECSScene";
import { SystemType } from "./ECSType";

export const ECS_SYSTEM_TYPE = Symbol("ECS_SYSTEM_TYPE");

interface ECSSystemConstructor extends Function {
    new(): void;
}

export function ecsSystem(type: SystemType): Function {
    return function (constructor: ECSSystemConstructor): void {
        constructor[ECS_SYSTEM_TYPE] = type;
    }
}

export abstract class ECSSystem {
    public scene: ECSScene;
    private query: ECSQuery;

    constructor(query: ECSQuery) {
        this.query = query;
    }

    public onUpdate(dt: number): void {

    }

    public onLastUpdate(dt: number): void {
        const entities = this.scene.getEntitiesWithQuery(this.query);
        this.onProcess(entities, dt);
    }

    public setScene(scene: ECSScene): void {
        this.scene = scene;
    }

    public abstract onProcess(entities: readonly ECSEntity[], dt?: number): void;
}