import { _decorator, Component, Node, Vec3 } from 'cc';
import { EventProcess } from '../../core/EventProcess';
const { ccclass, property } = _decorator;

interface ITransformNode {
    syncPos(vec3: Vec3): void;
    syncRotation(vec3: Vec3): void;
    syncScale(vec3: Vec3): void;
}

@ccclass('ECSNode')
export class ECSNode extends EventProcess implements ITransformNode {
    syncPos(vec3: Vec3): void {
        this.node.setPosition(vec3);
    }

    syncRotation(vec3: Vec3): void {
        this.node.setRotationFromEuler(vec3);
    }

    syncScale(vec3: Vec3): void {
        this.node.setScale(vec3);
    }
}


