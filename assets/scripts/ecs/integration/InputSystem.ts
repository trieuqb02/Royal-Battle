import { EventTouch, Input, input } from "cc";
import { ECSEntity } from "../core/ECSEntity";
import { ecsSystem, ECSSystem } from "../core/ECSSystem";
import { SystemType } from "../type/SystemType";
import { ECSQuery } from "../core/ECSQuery";
import { InputComponent } from "../components/InputComponent";

@ecsSystem(SystemType.INPUT)
export class InputSystem extends ECSSystem {

    private locationX: number = 0;
    private locationY: number = 0;
    private isClick: boolean = false;

    constructor() {
        super(ECSQuery.all(InputComponent));
        this.init();
    }

    private init(): void {
        input.on(Input.EventType.TOUCH_END, this.touchEnd, this);
    }

    public onProcess(entities: readonly ECSEntity[], dt: number): void {
        for (const entity of entities) {
            this.setPos(entity);
        }
    }

    private setPos(entity: ECSEntity): void {
        const inputComp = entity.getComponent(InputComponent);
        inputComp.x = this.locationX;
        inputComp.y = this.locationY;
    }

    private touchEnd(event: EventTouch): void {
        const location = event.getLocation();
        this.locationX = location.x;
        this.locationY = location.y;
    }
}