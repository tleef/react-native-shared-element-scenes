import { EndHandler, SpringConfig, StartHandler } from "./types";
import { SceneClass } from "./Scene";
import Animated from "react-native-reanimated";
import Stage from "./Stage";
import {
  Animation,
  SpringDriver
} from "@tleef/react-native-reanimated-utils/lib";

type ReadyHandler = (t: Transition) => void;
type FinishedHandler = (t: Transition) => void;

export default class Transition {
  private readonly _key: string;
  private readonly _fromId: string;
  private readonly _toId: string;
  private readonly _animation: Animation;
  private readonly _stage: Stage;
  private readonly _handleReady: ReadyHandler;
  private readonly _handleFinished: FinishedHandler;
  private _fromScene?: SceneClass;
  private _toScene?: SceneClass;

  constructor(
    fromId: string,
    toId: string,
    springConfig: Partial<SpringConfig>,
    stage: Stage,
    onReady: ReadyHandler,
    onFinish: FinishedHandler
  ) {
    const defaultSpringConfig = Animated.SpringUtils.makeDefaultConfig();

    const springDriver = new SpringDriver({
      stiffness: springConfig.stiffness || defaultSpringConfig.stiffness,
      mass: springConfig.mass || defaultSpringConfig.mass,
      damping: springConfig.damping || defaultSpringConfig.damping,
      overshootClamping:
        springConfig.overshootClamping || defaultSpringConfig.overshootClamping,
      restDisplacementThreshold:
        springConfig.restDisplacementThreshold ||
        defaultSpringConfig.restDisplacementThreshold,
      restSpeedThreshold:
        springConfig.restSpeedThreshold ||
        defaultSpringConfig.restSpeedThreshold
    });

    this._key = Transition.keyFor(fromId, toId);
    this._fromId = fromId;
    this._toId = toId;
    this._animation = new Animation(springDriver);
    this._stage = stage;
    this._handleReady = onReady;
    this._handleFinished = onFinish;

    this._fromScene = stage.getScene(fromId);
    this._toScene = stage.getScene(toId);

    if (!this._fromScene) {
      stage.onAddScene(fromId, this._handleAddScene);
    }
    if (!this._toScene) {
      stage.onAddScene(toId, this._handleAddScene);
    }

    this._animation.onEnterEnd(this._handleAnimationEnd);
    this._animation.onLeaveEnd(this._handleAnimationEnd);

    if (this._fromScene && this._toScene) {
      this._handleReady(this);
    }
  }

  get key() {
    return this._key;
  }

  get fromId() {
    return this._fromId;
  }

  get toId() {
    return this._toId;
  }

  get fromScene() {
    return this._fromScene;
  }

  get toScene() {
    return this._toScene;
  }

  get animValue(): Animated.Value<number> {
    return this._animation.value;
  }

  get animate(): Animated.Node<number> {
    return this._animation.animate;
  }

  continue = () => {
    this._animation.continue();
  };

  cancel = () => {
    this._animation.cancel();
  };

  onEnterStart = (handler: StartHandler) => {
    this._animation.onEnterStart(handler);
  };

  onEnterEnd = (handler: EndHandler) => {
    this._animation.onEnterEnd(handler);
  };

  onLeaveStart = (handler: StartHandler) => {
    this._animation.onLeaveStart(handler);
  };

  onLeaveEnd = (handler: EndHandler) => {
    this._animation.onLeaveEnd(handler);
  };

  private _handleAnimationEnd = (cancelled: boolean) => {
    if (!cancelled) {
      this._handleFinished(this);
    }
  };

  private _handleAddScene = (sceneId: string, scene: SceneClass) => {
    if (this._fromId === sceneId) {
      this._fromScene = scene;
    } else if (this._toId === sceneId) {
      this._toScene = scene;
    }

    this._stage.removeAddSceneListener(sceneId, this._handleAddScene);

    if (this._fromScene && this._toScene) {
      this._handleReady(this);
    }
  };

  static keyFor(fromId: string, toId: string) {
    return `${fromId}->${toId}`;
  }
}
