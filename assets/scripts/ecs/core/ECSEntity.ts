import { ECSComponent } from "./ECSComponent";
import { ComponentConstructor, ECSScene } from "./ECSScene";

export type EntityIndex = number;

interface IECSEntity {
    getId(): EntityIndex;

    hasComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): boolean;
    getComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): T;
    addComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): T;
    removeComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): boolean;
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

    hasComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): boolean {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.hasComponentByEntity(this, comp);
    }

    getComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): T {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.getComponentById(this.id, comp);
    }

    addComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): T {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.addComponentById(this.id, comp);
    }

    removeComponent<T extends ECSComponent>(comp: ComponentConstructor<T> | T): boolean {
        if (!this.scene) {
            throw new Error("Entity is not associated with a scene.");
        }
        return this.scene.removeComponentById(this.id, comp);
    }

    getId(): EntityIndex {
        return this.id;
    }
}