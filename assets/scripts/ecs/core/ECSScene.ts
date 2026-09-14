import { ECSEntity, EntityIndex } from "./ECSEntity";
import { ECS_SYSTEM_TYPE, ECSSystem } from "./ECSSystem";
import { ComponentType, SystemType } from "./ECSType";
import { ECS_COMPONENT_TYPE, ECSComponent } from "./ECSComponent";
import { ECSComponentPool } from "./ECSComponentPool";
import { ECSQuery } from "./ECSQuery";

export type ComponentConstructor<T extends ECSComponent = ECSComponent> = new (...args: any[]) => T;

interface IECSScene {
    createEntity(): ECSEntity;
    removeEntity(id: EntityIndex): boolean;

    hasComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): boolean;
    hasComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): boolean;

    addComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): T;
    addComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): T;

    getComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): T;
    getComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): T;

    removeComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): boolean;
    removeComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): boolean;

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

    public createEntity(name?: string): ECSEntity {
        const entity = new ECSEntity(this.id++, name);
        entity.setScene(this);
        this.entities.push(entity);
        return entity;
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

    public hasComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): boolean {
        comp = this.convertToComponent<T>(comp);
        const compType = this.getComponentType(comp);
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.has(id);
        }
        return false;
    }

    public hasComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor | T): boolean {
        return this.hasComponentById(entity.getId(), comp);
    }

    public addComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): T {
        comp = this.convertToComponent<T>(comp);
        const compType = this.getComponentType<T>(comp);
        let pool = this.componentPools.find((pool: ECSComponentPool<T>) => pool.getPoolType() === compType);
        pool.setMaxEntityIndex(id + 1);
        return pool.add(id, comp as T) as T;
    }

    public addComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): T {
        return this.addComponentById(entity.getId(), comp);
    }

    public getComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): T {
        comp = this.convertToComponent<T>(comp);
        const compType = this.getComponentType<T>(comp);
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.get(id) as T;
        }
        return undefined;
    }

    public getComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): T {
        return this.getComponentById(entity.getId(), comp);
    }

    public removeComponentById<T extends ECSComponent>(id: EntityIndex, comp: ComponentConstructor<T> | T): boolean {
        comp = this.convertToComponent<T>(comp);
        const compType = this.getComponentType(comp);
        const pool = this.componentPools.find((p) => p.getPoolType() === compType);
        if (pool) {
            return pool.remove(id);
        }
        return false;
    }

    public removeComponentByEntity<T extends ECSComponent>(entity: ECSEntity, comp: ComponentConstructor<T> | T): boolean {
        return this.removeComponentById(entity.getId(), comp);
    }

    public addSystem<T extends ECSSystem>(system: T): void {
        system.setScene(this);
        this.systems.push(system);
    }

    public getAllSystem(): ECSSystem[] {
        return this.systems;
    }

    public getSystemByType<T extends ECSSystem>(type: SystemType): T | undefined {
        const system = this.systems.find((sys: ECSSystem) => type === sys.constructor[ECS_SYSTEM_TYPE]);
        return system as T;
    }

    public removeSystem<T extends ECSSystem>(system: T): boolean {
        const length = this.systems.length;
        this.systems = this.systems.filter((sys: ECSSystem) => sys !== system);
        return length === this.systems.length;
    }

    private getComponentType<T extends ECSComponent>(comp: T): ComponentType {
        return comp.constructor[ECS_COMPONENT_TYPE];
    }

    private convertToComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): T {
        if (typeof comp === "function") {
            comp = new comp();
        }
        return comp;
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