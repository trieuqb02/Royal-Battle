import { ECSEntity, EntityIndex } from "./ECSEntity";
import { ECS_SYSTEM_TYPE, ECSSystem } from "./ECSSystem";
import { ComponentType, SystemType } from "./ECSType";
import { ECS_COMPONENT_TYPE, ECSComponent } from "./ECSComponent";
import { ECSComponentPool } from "./ECSComponentPool";
import { ECSQuery } from "./ECSQuery";

export type ComponentConstructor<T extends ECSComponent = ECSComponent> = new (...args: any[]) => T;

interface IECSScene {
    createEntity(): EntityIndex;
    removeEntity(id: EntityIndex): boolean;

    hasComponentById(id: EntityIndex, comp: ComponentConstructor | ComponentType): boolean;
    hasComponentByEntity(entity: ECSEntity, comp: ComponentConstructor | ComponentType): boolean;

    addComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor | T): T;
    addComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor | T): T;

    getComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor | ComponentType): T;
    getComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor | ComponentType): T;

    removeComponentById(id: EntityIndex, comp: ComponentConstructor | ComponentType): boolean;
    removeComponentByEntity(entity: ECSEntity, comp: ComponentConstructor | ComponentType): boolean;

    getAllSystem(): ECSSystem[];
    getSystemByType(type: SystemType): ECSSystem | undefined;
    addSystem<T extends ECSSystem>(system: T): void;
    removeSystem<T extends ECSSystem>(system: T): boolean;

    getEntitiesWithQuery(query: ECSQuery): readonly ECSEntity[];
}

export class ECSScene implements IECSScene {
    private entities: ECSEntity[];
    private systems: ECSSystem[] = [];
    private id: EntityIndex = 0;
    private componentPools: ECSComponentPool<ECSComponent>[] = [];

    constructor() {
        this.entities = [];
        for (const key in ComponentType) {
            if (isNaN(Number(key))) {
                const compType = ComponentType[key as keyof typeof ComponentType];
                this.componentPools[compType] = new ECSComponentPool(compType, 100);
            }
        }
    }

    private _logTimer = 0;

    public onUpdate(dt: number): void {
        for (const system of this.systems) {
            system.onUpdate(dt);
        }
    }

    public onLastUpdate(dt: number): void {
        for (const system of this.systems) {
            system.onLastUpdate(dt);
        }
    }

    public createEntity(name?: string): EntityIndex {
        const entity = new ECSEntity(this.id++, name);
        entity.setScene(this);
        this.entities.push(entity);
        return entity.getId();
    }

    public removeEntity(id: EntityIndex): boolean {
        const oldLength = this.entities.length;
        this.entities = this.entities.filter((entity: ECSEntity) => entity.getId() !== id);

        const result = oldLength !== this.entities.length;

        if (result) {
            for (const pool of this.componentPools) {
                if (pool.has(id)) {
                    pool.remove(id);
                }
            }
        }

        return result;
    }

    public hasComponentById(id: EntityIndex, comp: ComponentConstructor | ComponentType): boolean {
        const compType = comp.constructor?.[ECS_COMPONENT_TYPE] ?? comp;
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.has(id);
        }
        return false;
    }

    public hasComponentByEntity(entity: ECSEntity, comp: ComponentConstructor | ComponentType): boolean {
        return this.hasComponentById(entity.getId(), comp);
    }

    public addComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor | T): T {
        const compType = comp.constructor?.[ECS_COMPONENT_TYPE] ?? comp[ECS_COMPONENT_TYPE];
        let pool = this.componentPools.find((pool: ECSComponentPool<T>) => pool.getPoolType() === compType);
        pool.setMaxEntityIndex(id + 1);
        return pool.add(id, comp) as T;
    }

    public addComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor | T): T {
        return this.addComponentById(entity.getId(), comp);
    }

    public getComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor | ComponentType): T {
        const compType = comp[ECS_COMPONENT_TYPE] ?? comp;
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.get(id) as T;
        }
        return undefined;
    }

    public getComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor | ComponentType): T {
        return this.getComponentById(entity.getId(), comp);
    }

    public removeComponentById(id: EntityIndex, comp: ComponentConstructor | ComponentType): boolean {
        const compType = comp.constructor[ECS_COMPONENT_TYPE] ?? comp;
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.remove(id);
        }
        return false;
    }

    public removeComponentByEntity(entity: ECSEntity, comp: ComponentConstructor | ComponentType): boolean {
        const compType = comp.constructor[ECS_COMPONENT_TYPE] ?? comp;
        return this.removeComponentById(entity.getId(), compType);
    }

    public addSystem<T extends ECSSystem>(system: T): void {
        system.setScene(this);
        this.systems.push(system);
    }

    public getAllSystem(): ECSSystem[] {
        return this.systems;
    }

    public getSystemByType(type: SystemType): ECSSystem | undefined {
        const system = this.systems.find((sys: ECSSystem) => type === sys[ECS_SYSTEM_TYPE]);
        return system;
    }

    public removeSystem<T extends ECSSystem>(system: T): boolean {
        const length = this.systems.length;
        this.systems = this.systems.filter((sys: ECSSystem) => sys !== system);
        return length === this.systems.length;
    }

    public getEntitiesWithQuery(query: ECSQuery): readonly ECSEntity[] {
        const result: ECSEntity[] = [];
        if (!query) {
            return result;
        }

        const types = new Set<ComponentType>();

        query.allType?.forEach((compType: ComponentType) => {
            const pool = this.componentPools.find((p) => p.getPoolType() === compType);
            if (pool) {
                types.add(pool.getPoolType());
            }
        });

        query.anyType?.forEach((compType: ComponentType) => {
            const pool = this.componentPools.find((p) => p.getPoolType() === compType);
            if (pool) {
                types.add(pool.getPoolType());
            }
        });

        query.excludeType?.forEach((compType: ComponentType) => {
            const pool = this.componentPools.find((p) => p.getPoolType() === compType);
            if (pool) {
                types.delete(pool.getPoolType());
            }
        });

        for (const entity of this.entities) {
            let hasAll = true;

            for (const compType of types) {
                const pool = this.componentPools.find((p) => p.getPoolType() === compType);
                if (!pool || !pool.has(entity.getId())) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                result.push(entity);
            }
        }

        return result;
    }
}