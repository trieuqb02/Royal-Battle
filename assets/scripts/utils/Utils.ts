import { Node, tween, Sprite, ITweenOption, UIOpacity, Asset, resources, AssetManager, Vec3, Quat } from "cc";

type onProgress = (completedCount: number, totalCount: number, item: AssetManager.RequestItem) => void | null;

export class Utils {

    public static reparentKeepWorld(node: Node, newParent: Node): void {
        const worldPosition = node.getWorldPosition(new Vec3());
        const worldRotation = node.getWorldRotation(new Quat());
        const worldScale = node.getWorldScale(new Vec3());

        node.setParent(newParent);

        node.setWorldPosition(worldPosition);
        node.setWorldRotation(worldRotation);
        node.setWorldScale(worldScale);
    }

    public static reparent(node: Node, newParent: Node): void {
        node.setParent(newParent);
    }

    public static reparentResetLocal(node: Node, newParent: Node): void {
        node.setParent(newParent);
        node.setPosition(0, 0, 0);
        node.setRotationFromEuler(0, 0, 0);
        node.setScale(1, 1, 1);
    }

    public static loadResSync<T extends Asset>(path: string, type: typeof Asset, onProgress: onProgress, onComplete: Function): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, type, onProgress, (err: Error, asset: T) => {
                if (err) {
                    reject(err);
                } else {
                    onComplete && onComplete();
                    resolve(asset);
                }
            });
        })
    }

    public static fadeIn(node: Node, duration: number = 0.5, optional?: ITweenOption) {
        if (!node || !node.active) {
            return;
        }
        this.fadeTo(node, duration, 255, optional);
    }

    public static fadeOut(node: Node, duration: number = 0.5, optional?: ITweenOption) {
        if (!node || !node.active) {
            return;
        }
        this.fadeTo(node, duration, 0, optional);
    }

    public static fadeTo(node: Node, duration: number = 0.5, opacity: number, optional?: ITweenOption) {
        if (!node || !node.active) {
            return;
        }

        const spriteComp = node.getComponent(Sprite);
        if (spriteComp) {
            const targetColor = spriteComp.color.clone();
            targetColor.a = opacity;
            tween(spriteComp)
                .to(duration, { color: targetColor }, optional)
                .start();
            return;
        } else {
            let opacityComp = node.getComponent(UIOpacity);
            if (!opacityComp) {
                opacityComp = node.addComponent(UIOpacity);
            }
            tween(opacityComp)
                .to(duration, { opacity: opacity }, optional)
                .start();
        }
    }
}