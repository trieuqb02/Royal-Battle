import { ECSComponent } from "./ECSComponent";
import { EntityIndex } from "./ECSEntity";
import { ComponentType } from "./ECSType";

interface SparseSetAPI<T> {
    add(id: EntityIndex, component: T): T;
    remove(id: EntityIndex): boolean;
    has(id: EntityIndex): boolean;
    get(id: EntityIndex): T | undefined;
    clear(): void;
    size(): number;
    entities(): EntityIndex[];
    components(): T[];
}

export class ECSComponentPool<T extends ECSComponent> implements SparseSetAPI<T> {
    private dense: number[];
    private sparse: number[];
    private maxEntityIndex: number;
    private capacity: number;
    private data: T[];
    private poolType: ComponentType;

    constructor(compType: ComponentType, initialCapacity: number = 100) {
        this.dense = [];
        this.data = [];
        this.capacity = initialCapacity;
        this.maxEntityIndex = initialCapacity;
        this.poolType = compType;
        this.sparse = new Array(this.maxEntityIndex).fill(undefined);
    }

    private resize(capacity: number): void {
        const newSparse = new Array(capacity).fill(undefined);

        for (let i = 0; i < this.sparse.length; i++) {
            newSparse[i] = this.sparse[i];
        }

        this.sparse = newSparse;
    }

    public add(id: EntityIndex, component: T): T {
        this.dense.push(id);
        this.data.push(component);
        this.sparse[id] = this.dense.length - 1;
        return component;
    }

    public remove(id: EntityIndex): boolean {
        const index = this.sparse[id];
        if (index !== undefined) {
            const lastId = this.dense[this.dense.length - 1];
            this.dense[index] = lastId;
            this.sparse[lastId] = index;
            this.dense.pop();
            this.data.splice(index, 1);
            this.sparse[id] = undefined;
            return true;
        }
        return false;
    }

    public has(id: EntityIndex): boolean {
        return this.sparse[id] !== undefined;
    }

    public get(id: EntityIndex): T | undefined {
        const index = this.sparse[id];
        if (index !== undefined) {
            return this.data[index];
        }
        return undefined;
    }

    public clear(): void {
        this.dense = [];
        this.data = [];
        this.sparse = new Array(this.capacity).fill(undefined);
    }

    public size(): number {
        return this.dense.length;
    }

    public entities(): EntityIndex[] {
        return [...this.dense];
    }

    public components(): T[] {
        return [...this.data];
    }

    public getPoolType(): ComponentType {
        return this.poolType;
    }

    public setMaxEntityIndex(maxIndex: number): void {
        if (maxIndex > this.maxEntityIndex) {
            this.maxEntityIndex *= 2;
            this.resize(this.maxEntityIndex);
        }
    }
}