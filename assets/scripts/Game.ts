import { _decorator, Component } from 'cc';
import { ECSScene } from './ecs/core/ECSScene';
import { NodeConfigComponent } from './ecs/components/NodeConfigComponent';
import { Layer, PrefabUrl } from './utils/Const';
import { CocosRenderSystem } from './ecs/integration/CocosRenderSystem';
import { NodeBindingSystem } from './ecs/integration/NodeBindingSystem';
import { PrefabLoadSystem } from './ecs/integration/PrefabLoadSystem';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    private ecsScene!: ECSScene;

    protected onLoad(): void {
        this.ecsScene = new ECSScene();
    }

    start() {
        this.initSystem();
        this.createHero();
    }

    private initSystem(): void {
        this.ecsScene.addSystem(new PrefabLoadSystem());
        this.ecsScene.addSystem(new NodeBindingSystem());
        this.ecsScene.addSystem(new CocosRenderSystem());
    }

    update(deltaTime: number) {
        this.ecsScene && this.ecsScene.onUpdate(deltaTime);
    }

    protected lateUpdate(dt: number): void {
        this.ecsScene && this.ecsScene.onLastUpdate(dt);
    }

    createHero() {
        const heroEntity = this.ecsScene.createEntity();
        const nodeConfigComp = heroEntity.addComponent<NodeConfigComponent>(NodeConfigComponent);
        nodeConfigComp.layer = Layer.HERO;
        nodeConfigComp.prefabUrl = PrefabUrl.HERO;
    }
}


