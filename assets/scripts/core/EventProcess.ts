import { _decorator, Component, Vec3 } from "cc";
import { EventType } from "../utils/Const";
const { ccclass, property } = _decorator;
@ccclass('EventProcess')
export class EventProcess extends Component {
    private _handlers = new Map<EventType | string, Function>();

    public emitEvent(type: EventType | string, ...args: any[]): void {
        const func = this._handlers.get(type);
        func(args);
    }

    public onEvent(type: EventType | string, callback: Function, target?: unknown): void {
        const func = target ? callback.bind(target) : callback;
        this._handlers.set(type, func);
    }

    public offEvent(type: EventType | string, callback: Function, target?: unknown): void {
        const func = target ? callback.bind(target) : callback;
        this._handlers.delete(type);
        func();
    }

    public offAllEvent(): void {
        this._handlers.clear();
    }
}