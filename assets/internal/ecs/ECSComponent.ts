import { ComponentType } from "./ECSType";

export const ECS_COMPONENT_TYPE = Symbol("ECS_COMPONENT_TYPE");

interface ECSComponentConstructor extends Function {
    new(): void;
}

export function ecsComponent(type: ComponentType): Function {
    return function (constructor: ECSComponentConstructor): void {
        constructor[ECS_COMPONENT_TYPE] = type;
    }
}

export abstract class ECSComponent {
    
}