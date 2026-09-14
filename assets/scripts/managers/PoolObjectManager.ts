import { _decorator, CCBoolean, CCInteger, CCString, Component, Enum, instantiate, Node, NodePool, Prefab } from 'cc';
import { PoolHandlerName, PrefabUrl } from '../utils/Const';
import { Utils } from '../utils/Utils';
const { ccclass, property } = _decorator;

export interface PoolHandler {
    unuse(): void;
    reuse(args: any[]): void;
}

@ccclass('PrefabObject')
class PrefabObject {
    @property(CCBoolean)
    public isUsingPath: boolean = true;

    @property({ type: CCString, visible: function (this: PrefabObject) { return this.isUsingPath } })
    public path: string = '';

    @property({ type: Prefab, visible: function (this: PrefabObject) { return !this.isUsingPath } })
    public prefab: Prefab = null;

    @property({ type: Enum(PoolHandlerName) })
    public poolHandler: PoolHandlerName = PoolHandlerName.NONE;

    @property({ type: Enum(PrefabUrl) })
    public prefabName: PrefabUrl = PrefabUrl.NONE;

    @property(CCInteger)
    public quantity: number = 0;
}

@ccclass('PoolObjectManager')
export class PoolObjectManager extends Component {
    @property({ type: [PrefabObject] })
    public prefabObjects: PrefabObject[] = [];

    private _pools: Map<string, NodePool> = new Map();
    private _prefabMap: Map<string, Prefab> = new Map();

    protected onLoad(): void {
        this.initPools();
    }

    private initPools(): void {
        for (const prefabObject of this.prefabObjects) {
            const pool = new NodePool();
            pool.poolHandlerComp = prefabObject.poolHandler;
            if (prefabObject.isUsingPath && prefabObject.path) {
                Utils.loadResSync<Prefab>(prefabObject.path, Prefab, null, () => { })
                    .then((prefab: Prefab) => {
                        this._prefabMap.set(prefabObject.path, prefab);
                        for (let i = 0; i < prefabObject.quantity; i++) {
                            const node = instantiate(prefab);
                            pool.put(node);
                        }
                    })
                    .catch((err: Error) => {
                        console.error(`Failed to load prefab at path: ${prefabObject.path}. Error: ${err}`);
                    });
            } else if (!prefabObject.isUsingPath && prefabObject.prefab) {
                this._prefabMap.set(prefabObject.prefabName, prefabObject.prefab);
                for (let i = 0; i < prefabObject.quantity; i++) {
                    const node = instantiate(prefabObject.prefab);
                    pool.put(node);
                }
            }
            this._pools.set(prefabObject.prefabName, pool);
        }
    }

    public getPool(prefabName: PrefabUrl): NodePool | null {
        return this._pools.get(prefabName) || null;
    }

    public getNode(prefabName: PrefabUrl, data?: any): Node | null {
        const pool = this.getPool(prefabName);
        if (pool) {
            let node = pool.get(data);
            if (!node) {
                const prefab = this._prefabMap.get(prefabName);
                if (prefab) {
                    node = instantiate(prefab);
                }
                this._pools.set(prefabName, pool);
                return pool.get(data);
            }
            return node;
        }
        return null;
    }

    public putNode(prefabName: PrefabUrl, node: Node): void {
        if (!node) {
            return
        }

        node.removeFromParent();
        node.active = false;

        const pool = this.getPool(prefabName);
        if (pool) {
            pool.put(node);
        }
    }

    public clearAllPool(): void {
        this._pools.forEach(pool => pool.clear());
        this._pools.clear();
    }

    public clearPool(path: string): void {
        this._pools.get(path).clear();
    }
}


