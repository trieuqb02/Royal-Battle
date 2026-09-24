import { _decorator, Component, Node } from 'cc';
import { ECSScene } from '../ecs/core/ECSScene';
import { GridMapManager } from '../managers/GridMapManager';
const { ccclass, property } = _decorator;

export class ECSWorld extends ECSScene {
    public gridMap: GridMapManager;

    constructor() {
        super();
    }
}


