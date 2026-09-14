import { _decorator, Component, Enum, Node } from 'cc';
import { Layer } from '../utils/Const';
import { CCComponentKey, CCComponentLocator } from '../locator/ComponentLocator';
const { ccclass, property } = _decorator;

@ccclass('LayerData')
export class LayerData {
    @property({ type: Enum(Layer) })
    public layer: Layer = Layer.NONE;

    @property({ type: Node })
    public node: Node | null = null;
}

@ccclass('LayerManager')
export class LayerManager extends Component {
    @property({ type: [LayerData] })
    public layerDataList: LayerData[] = [];

    private layers: Partial<Record<Layer, Node>> = {};

    protected onLoad(): void {
        CCComponentLocator.registerCCComponent(CCComponentKey.LAYER_MANAGER, this);
        for (const layerData of this.layerDataList) {
            this.layers[layerData.layer] = layerData.node;
        }
    }

    public getNodeLayer(layer: Layer): Node | null {
        return this.layers[layer] || null;
    }

    protected onDisable(): void {
        CCComponentLocator.unregisterCCComponent(CCComponentKey.LAYER_MANAGER);
    }
}


