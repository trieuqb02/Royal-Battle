import { _decorator, Component } from 'cc';

export enum CCComponentKey {
    WORLD_POOL,
    LAYER_MANAGER
}

export class CCComponentLocator {
    private static components = new Map<CCComponentKey, Component>();

    public static registerCCComponent<T extends Component>(key: CCComponentKey, instance: T): void {
        this.components.set(key, instance);
    }

    public static unregisterCCComponent(key: CCComponentKey): void {
        if (!this.components.get(key)) {
            console.warn("Not Found Component");
            return;
        }
        this.components.delete(key);
    }

    public static getCCComponent<T extends Component>(key: CCComponentKey): T | undefined {
        return this.components.get(key) as T || undefined;
    }
}