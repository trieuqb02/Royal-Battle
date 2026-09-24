import { InputComponent } from "../components/InputComponent";
import { MovementComponent } from "../components/MovementComponent";
import { ECSEntity } from "../core/ECSEntity";
import { ECSQuery } from "../core/ECSQuery";
import { ecsSystem, ECSSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";

@ecsSystem(SystemType.MOVEMENT)
export class MovementSystem extends ECSSystem {
    constructor() {
        super(ECSQuery.all(MovementComponent, InputComponent));
    }

    public onProcess(entities: readonly ECSEntity[], dt: number): void {
        for (const entity of entities) {
            this.calPos(entity);
        }
    }

    private calPos(entity: ECSEntity): void {
        const inputComp = entity.getComponent<InputComponent>(InputComponent);
        const movementComp = entity.getComponent<MovementComponent>(MovementComponent);
        movementComp.x = inputComp.x;
        movementComp.y = inputComp.y;
    }
}