import { EntityIndex } from "../ecs/core/ECSEntity";

export enum TerrainType {
    Ground
}

export interface GridCell {
    readonly x: number;
    readonly y: number;

    walkable: boolean;
    occupied: boolean;

    terrain: TerrainType;
    movementCost: number;

    entityId: EntityIndex | null;
}

export interface GridMapConfig {
    width: number;
    height: number;

    cellSize: number;

    defaultTerrain?: TerrainType;
    defaultWalkable?: boolean;
}

export class GridPosition {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class GridMapManager {
    private readonly width: number;
    private readonly height: number;
    private readonly cellSize: number;
    private readonly cells: GridCell[];

    constructor(config: GridMapConfig) {
        if (config.width <= 0) {
            throw new Error("GridMap width must be greater than 0");
        }

        if (config.height <= 0) {
            throw new Error("GridMap height must be greater than 0");
        }

        if (config.cellSize <= 0) {
            throw new Error("GridMap cellSize must be greater than 0");
        }

        this.width = config.width;
        this.height = config.height;
        this.cellSize = config.cellSize;

        const defaultTerrain = config.defaultTerrain ?? TerrainType.Ground;
        const defaultWalkable = config.defaultWalkable ?? true;

        this.cells = new Array<GridCell>(this.width * this.height);

        this.initialize(defaultTerrain, defaultWalkable);
    }

    private initialize(terrain: TerrainType, walkable: boolean): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const index = this.toIndex(x, y);
                this.cells[index] = { x, y, walkable, occupied: false, terrain, movementCost: 1, entityId: null };
            }
        }
    }

    private toIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    private fromIndex(index: number): GridPosition {
        const x = index % this.width;
        const y = Math.floor(index / this.width);
        return new GridPosition(x, y);
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getCellSize(): number {
        return this.cellSize;
    }

    public getCellCount(): number {
        return this.cells.length;
    }

    public isInside(x: number, y: number): boolean {
        return (x >= 0 && x < this.width && y >= 0 && y < this.height);
    }

    public getCell(x: number, y: number): GridCell | null {
        if (!this.isInside(x, y)) {
            return null;
        }
        return this.cells[this.toIndex(x, y)];
    }

    public getCellByIndex(index: number): GridCell | null {
        if (index < 0 || index >= this.cells.length) {
            return null;
        }
        return this.cells[index];
    }

    public gridToWorld(x: number, y: number): { x: number; y: number } {
        return { x: x * this.cellSize, y: y * this.cellSize, };
    }

    public worldToGrid(worldX: number, worldY: number): GridPosition {
        return { x: Math.floor(worldX / this.cellSize), y: Math.floor(worldY / this.cellSize) };
    }

    public getTerrain(x: number, y: number): TerrainType | null {
        const cell = this.getCell(x, y);
        if (!cell) {
            return null;
        }
        return cell.terrain;
    }

    public setTerrain(x: number, y: number, terrain: TerrainType): boolean {
        const cell = this.getCell(x, y);
        if (!cell) {
            return false;
        }
        cell.terrain = terrain;
        return true;
    }

    public isOccupied(x: number, y: number): boolean {
        const cell = this.getCell(x, y);
        if (!cell) {
            return false;
        }
        return cell.occupied;
    }

    public occupy(x: number, y: number, entityId: EntityIndex): boolean {
        const cell = this.getCell(x, y);
        if (!cell) {
            return false;
        }
        if (cell.occupied) {
            return false;
        }
        if (!cell.walkable) {
            return false;
        }
        cell.occupied = true;
        cell.entityId = entityId;
        return true;
    }

}