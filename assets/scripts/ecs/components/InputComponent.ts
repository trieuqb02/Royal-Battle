import { ecsComponent, ECSComponent } from "../core/ECSComponent";
import { ComponentType } from "../type/ComponentType";

@ecsComponent(ComponentType.INPUT)
export class InputComponent extends ECSComponent {
    public x: number = 0;
    public y: number = 0;
}