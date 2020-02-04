import React from "react";
import Animated from "react-native-reanimated";
import { SpringDriver } from "@tleef/react-native-reanimated-utils/lib";
import { SceneClass } from "./Scene";
import withStage, { InjectedStageProps } from "./withStage";
import SceneTransition from "./SceneTransition";
import TransitionReceipt from "./TransitionReceipt";
import { EndListeners, SpringConfig, StartListeners } from "./types";

const {
  Value,
  SpringUtils,
  set,
  cond,
  block,
  eq,
  not,
  clockRunning,
  call
} = Animated;

type TransitionArgs = {
  from: string;
  to: string;
  springConfig?: SpringConfig;
};

type State = {
  from?: string;
  fromScene?: SceneClass;
  to?: string;
  toScene?: SceneClass;
};

export class SceneTransitionerClass extends React.Component<
  InjectedStageProps,
  State
> {
  // @ts-ignore
  private _driver: SpringDriver;
  // @ts-ignore
  private _inOut: Animated.Value<-1 | 0 | 1>;
  // @ts-ignore
  private _prevInOut: Animated.Value<-1 | 0 | 1>;
  // @ts-ignore
  private _drive: Animated.Node<number>;
  // @ts-ignore
  private _enterStartListeners: StartListeners;
  // @ts-ignore
  private _enterEndListeners: EndListeners;
  // @ts-ignore
  private _leaveStartListeners: StartListeners;
  // @ts-ignore
  private _leaveEndListeners: EndListeners;

  constructor(props: InjectedStageProps) {
    super(props);

    this.state = {};

    this._resetAnimation();
  }

  render() {
    const { fromScene, toScene } = this.state;

    if (!fromScene || !toScene) {
      return null;
    }

    return (
      <React.Fragment>
        <Animated.Code>{() => this._drive}</Animated.Code>
        <SceneTransition
          from={fromScene}
          to={toScene}
          position={this._driver.value}
        />
      </React.Fragment>
    );
  }

  public transition = ({ from, to, springConfig }: TransitionArgs) => {
    const { stage } = this.props;

    const fromScene = stage.getScene(from);
    const toScene = stage.getScene(to);

    if (!fromScene) {
      stage.onAddScene(from, this._handleAddScene);
    }
    if (!toScene) {
      stage.onAddScene(to, this._handleAddScene);
    }

    if (from !== this.state.from || to !== this.state.to) {
      this._resetAnimation(springConfig);
    }

    this._inOut.setValue(1);

    this.setState({
      from,
      fromScene,
      to,
      toScene
    });

    return new TransitionReceipt(
      this._inOut,
      this._enterStartListeners,
      this._enterEndListeners,
      this._leaveStartListeners,
      this._leaveEndListeners
    );
  };

  public reset = () => {
    this._resetAnimation();
    this._resetState();
  };

  private _resetAnimation = (springConfig: Partial<SpringConfig> = {}) => {
    const defaultSpringConfig = SpringUtils.makeDefaultConfig();

    this._driver = new SpringDriver({
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

    this._inOut = new Value(1);
    this._prevInOut = new Value(0);

    // ENTER

    const handleLeaveCancelled = cond(
      eq(this._prevInOut, -1),
      call([], () => this._onLeaveEnd(true))
    );

    const handleEnterStart = cond(
      not(eq(this._prevInOut, 1)),
      call([], this._onEnterStart)
    );

    const handleEnterEnd = cond(
      not(clockRunning(this._driver.clock)),
      call([], () => this._onEnterEnd(false))
    );

    const handleEnter = block([
      handleLeaveCancelled,
      handleEnterStart,
      this._driver.run(),
      handleEnterEnd,
      set(this._prevInOut, 1)
    ]);

    // LEAVE

    const handleEnterCancelled = cond(
      eq(this._prevInOut, 1),
      call([], () => this._onEnterEnd(true))
    );

    const handleLeaveStart = cond(
      not(eq(this._prevInOut, -1)),
      call([], this._onLeaveStart)
    );

    const handleLeaveEnd = cond(
      not(clockRunning(this._driver.clock)),
      call([], () => this._onLeaveEnd(false))
    );

    const handleLeave = block([
      handleEnterCancelled,
      handleLeaveStart,
      this._driver.rev(),
      handleLeaveEnd,
      set(this._prevInOut, -1)
    ]);

    this._drive = cond(
      eq(this._inOut, 1),
      handleEnter,
      cond(eq(this._inOut, -1), handleLeave)
    );

    this._enterStartListeners = [];
    this._enterEndListeners = [];
    this._leaveStartListeners = [];
    this._leaveEndListeners = [];
  };

  private _resetState = () => {
    this.setState({
      from: undefined,
      fromScene: undefined,
      to: undefined,
      toScene: undefined
    });
  };

  private _onEnterStart = () => {
    this._enterStartListeners.forEach(fn => fn());
  };

  private _onEnterEnd = (cancelled: boolean) => {
    this._enterEndListeners.forEach(fn => fn(cancelled));
    if (!cancelled) {
      this.reset();
    }
  };

  private _onLeaveStart = () => {
    this._leaveStartListeners.forEach(fn => fn());
  };

  private _onLeaveEnd = (cancelled: boolean) => {
    this._leaveEndListeners.forEach(fn => fn(cancelled));
    if (!cancelled) {
      this.reset();
    }
  };

  private _handleAddScene = (sceneId: string, scene: SceneClass) => {
    const { from, to } = this.state;

    if (from === sceneId) {
      this.setState({
        fromScene: scene
      });
    } else if (to === sceneId) {
      this.setState({
        toScene: scene
      });
    }

    this.props.stage.removeAddSceneListener(sceneId, this._handleAddScene);
  };
}

export default withStage(SceneTransitionerClass);
