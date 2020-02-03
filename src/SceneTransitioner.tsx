import React from "react";
import Animated from "react-native-reanimated";
import {
  SpringConfig,
  SpringDriver
} from "@tleef/react-native-reanimated-utils/lib";
import { SceneType } from "./Scene";
import withStage, { InjectedStageProps } from "./withStage";
import SceneTransition from "./SceneTransition";

const {
  Value,
  SpringUtils,
  set,
  cond,
  block,
  eq,
  not,
  and,
  clockRunning,
  call
} = Animated;

type TransitionArgs = {
  from: string;
  to: string;
  springConfig?: Partial<SpringConfig>;
};

type State = {
  from?: string;
  fromScene?: SceneType;
  to?: string;
  toScene?: SceneType;
};

type StartHandler = () => void;
type EndHandler = (cancelled: boolean) => void;

class SceneTransitioner extends React.Component<InjectedStageProps, State> {
  // @ts-ignore
  private _driver: SpringDriver;
  // @ts-ignore
  private _inOut: Animated.Value<-1 | 0 | 1>;
  // @ts-ignore
  private _prevInOut: Animated.Value<-1 | 0 | 1>;
  // @ts-ignore
  private _drive: Animated.Node<number>;
  // @ts-ignore
  private _enterStartListeners: Array<StartHandler>;
  // @ts-ignore
  private _enterEndListeners: Array<EndHandler>;
  // @ts-ignore
  private _leaveStartListeners: Array<StartHandler>;
  // @ts-ignore
  private _leaveEndListeners: Array<EndHandler>;

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

    this._inOut = new Value(0);
    this._prevInOut = new Value(0);

    const handleEnterEnd = cond(
      eq(this._prevInOut, 1),
      cond(
        not(eq(this._inOut, 1)),
        call([true], this._onEnterEnd),
        cond(
          not(clockRunning(this._driver.clock)),
          call([false], this._onEnterEnd)
        )
      )
    );

    const handleLeaveEnd = cond(
      eq(this._prevInOut, -1),
      cond(
        not(eq(this._inOut, -1)),
        call([true], this._onLeaveEnd),
        cond(
          not(clockRunning(this._driver.clock)),
          call([false], this._onLeaveEnd)
        )
      )
    );

    const handleEnterStart = cond(
      and(eq(this._inOut, 1), not(eq(this._prevInOut, 1))),
      call([], this._onEnterStart)
    );

    const handleLeaveStart = cond(
      and(eq(this._inOut, -1), not(eq(this._prevInOut, -1))),
      call([], this._onLeaveStart)
    );

    const handleEnter = cond(eq(this._inOut, 1), [
      set(this._prevInOut, 1),
      this._driver.run()
    ]);

    const handleLeave = cond(eq(this._inOut, -1), [
      set(this._prevInOut, -1),
      this._driver.rev()
    ]);

    this._drive = block([
      handleEnterEnd,
      handleLeaveEnd,
      handleEnterStart,
      handleLeaveStart,
      handleEnter,
      handleLeave
    ]);

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

  private _onEnterEnd = ([cancelled]: readonly boolean[]) => {
    if (!cancelled) {
      this.reset();
    }
    this._enterEndListeners.forEach(fn => fn(cancelled));
  };

  private _onLeaveStart = () => {
    this._leaveStartListeners.forEach(fn => fn());
  };

  private _onLeaveEnd = ([cancelled]: readonly boolean[]) => {
    if (!cancelled) {
      this.reset();
    }
    this._leaveEndListeners.forEach(fn => fn(cancelled));
  };

  private _handleAddScene = (sceneId: string, scene: SceneType) => {
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

class TransitionReceipt {
  private readonly _inOut: Animated.Value<-1 | 0 | 1>;
  private readonly _enterStartListeners: Array<StartHandler>;
  private readonly _enterEndListeners: Array<EndHandler>;
  private readonly _leaveStartListeners: Array<StartHandler>;
  private readonly _leaveEndListeners: Array<EndHandler>;

  constructor(
    inOut: Animated.Value<-1 | 0 | 1>,
    enterStartListeners: Array<StartHandler>,
    enterEndListeners: Array<EndHandler>,
    leaveStartListeners: Array<StartHandler>,
    leaveEndListeners: Array<EndHandler>
  ) {
    this._inOut = inOut;
    this._enterStartListeners = enterStartListeners;
    this._enterEndListeners = enterEndListeners;
    this._leaveStartListeners = leaveStartListeners;
    this._leaveEndListeners = leaveEndListeners;
  }

  cancel = () => {
    this._inOut.setValue(-1);
  };

  onEnterStart = (handler: StartHandler) => {
    this._enterStartListeners.push(handler);
  };

  onEnterEnd = (handler: EndHandler) => {
    this._enterEndListeners.push(handler);
  };

  onLeaveStart = (handler: StartHandler) => {
    this._leaveStartListeners.push(handler);
  };

  onLeaveEnd = (handler: EndHandler) => {
    this._leaveEndListeners.push(handler);
  };
}

export default withStage(SceneTransitioner);
