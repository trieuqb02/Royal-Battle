import { ECSComponent } from "./ECSComponent";
import { ComponentConstructor, ECSScene } from "./ECSScene";
import { ComponentType } from "./ECSType";

export type EntityIndex = number;

interface IECSEntity {
    getId(): EntityIndex;

    hasComponent(comp: ComponentConstructor | ComponentType): boolean;
    getComponent<T extends ECSComponent>(comp: ComponentConstructor | ComponentType): T;
    addComponent<T extends ECSComponent>(comp: ComponentConstructor | T): T;
    removeComponent(comp: ComponentConstructor | ComponentType): boolean;
}

export class ECSEntity implements IECSEntity {
    private name: string;
    private id: EntityIndex;
    private scene: ECSScene;

    constructor(id: number, name?: string) {
        this.id = id;
        this.name = name;
    }

    public setScene(scene: ECSScene): void {
        this.scene = scene;
    }

    hasComponent(comp: ComponentConstructor | ComponentType): boolean {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.hasComponentByEntity(this, comp);
    }

    getComponent<T extends ECSComponent>(comp: ComponentConstructor | ComponentType): T {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.getComponentById(this.id, comp);
    }

    addComponent<T extends ECSComponent>(comp: ComponentConstructor | T): T {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.addComponentById(this.id, comp);
    }

    removeComponent(comp: ComponentConstructor | ComponentType): boolean {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.removeComponentById(this.id, comp);
    }

    getId(): EntityIndex {
        return this.id;
    }
}