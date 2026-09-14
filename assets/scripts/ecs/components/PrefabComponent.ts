import { ECSComponent, ecsComponent } from "../core/ECSComponent";
import { ComponentType } from "../type/ComponentType";
import { Node } from "cc";


@ecsComponent(ComponentType.PREFAB)
export class PrefabComponent extends ECSComponent {
    node: Node | null = null;
}