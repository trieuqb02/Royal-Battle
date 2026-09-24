import { _decorator, Component } from 'cc';
import { NodeConfigComponent } from './ecs/components/NodeConfigComponent';
import { Layer, PrefabUrl } from './utils/Const';
import { CocosRenderSystem } from './ecs/integration/CocosRenderSystem';
import { NodeBindingSystem } from './ecs/integration/NodeBindingSystem';
import { PrefabLoadSystem } from './ecs/integration/PrefabLoadSystem';
import { InputSystem } from './ecs/integration/InputSystem';
import { InputComponent } from './ecs/components/InputComponent';
import { MovementSystem } from './ecs/systems/MovementSystem';
import { MovementComponent } from './ecs/components/MovementComponent';
import { GridMapManager } from './managers/GridMapManager';
import { ECSWorld } from './core/ECSWorld';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    private ecsWorld!: ECSWorld;

    protected onLoad(): void {
        this.ecsWorld = new ECSWorld();
    }

    start() {
        this.initMap();
        this.initSystem();
        this.createHero();
    }

    private initMap(): void {
        const configMap = {
            width: 10,
            height: 10,
            cellSize: 20,
        }
        const map = new GridMapManager(configMap);
        this.ecsWorld.gridMap = map;
    }

    private initSystem(): void {
        this.ecsWorld.addSystem(new InputSystem());
        this.ecsWorld.addSystem(new PrefabLoadSystem());
        this.ecsWorld.addSystem(new NodeBindingSystem());
        this.ecsWorld.addSystem(new MovementSystem());
        this.ecsWorld.addSystem(new CocosRenderSystem());
    }

    update(deltaTime: number) {
        this.ecsWorld && this.ecsWorld.onUpdate(deltaTime);
    }

    protected lateUpdate(dt: number): void {
        this.ecsWorld && this.ecsWorld.onLastUpdate(dt);
    }

    createHero() {
        const heroEntity = this.ecsWorld.createEntity();
        const inputComp = heroEntity.addComponent<InputComponent>(InputComponent);
        const movementComp = heroEntity.addComponent<MovementComponent>(MovementComponent);
        const nodeConfigComp = heroEntity.addComponent<NodeConfigComponent>(NodeConfigComponent);
        nodeConfigComp.layer = Layer.HERO;
        nodeConfigComp.prefabUrl = PrefabUrl.HERO;
    }
}