import { _decorator, Component, Node } from 'cc';
import { PoolObjectManager } from './PoolObjectManager';
import { CCComponentKey, CCComponentLocator } from '../locator/ComponentLocator';
const { ccclass, property } = _decorator;

@ccclass('WorldPoolManager')
export class WorldPoolManager extends PoolObjectManager {
    onLoad(): void {
        super.onLoad();
        CCComponentLocator.registerCCComponent<WorldPoolManager>(CCComponentKey.WORLD_POOL, this);
    }

    onDisable(): void {
        super.onDisable();
    }
}


