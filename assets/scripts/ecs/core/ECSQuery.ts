import { ECS_COMPONENT_TYPE } from "./ECSComponent";
import { ComponentConstructor } from "./ECSScene";
import { ComponentType } from "./ECSType";

export class ECSQuery {
    private _all: Set<ComponentType>;
    private _any: Set<ComponentType>;
    private _exclude: Set<ComponentType>;

    private constructor() {
        this._all = new Set();
        this._any = new Set();
        this._exclude = new Set();
    }

    public static all(...comps: ComponentConstructor[]): ECSQuery {
        return new ECSQuery().all(...comps);
    }

    public static any(...comps: ComponentConstructor[]): ECSQuery {
        return new ECSQuery().any(...comps);
    }

    public static exclude(...comps: ComponentConstructor[]): ECSQuery {
        return new ECSQuery().exclude(...comps);
    }

    public all(...comps: ComponentConstructor[]): this {
        return this.addTo(this._all, comps);
    }

    public any(...comps: ComponentConstructor[]): this {
        return this.addTo(this._any, comps);
    }

    public exclude(...comps: ComponentConstructor[]): this {
        return this.addTo(this._exclude, comps);
    }

    private addTo(target: Set<ComponentType>, comps: ComponentConstructor[]): this {
        comps.forEach(comp => target.add(comp[ECS_COMPONENT_TYPE]));
        return this;
    }

    public get allType(): ComponentType[] {
        return Array.from(this._all);
    }

    public get anyType(): ComponentType[] {
        return Array.from(this._any);
    }

    public get excludeType(): ComponentType[] {
        return Array.from(this._exclude);
    }
}