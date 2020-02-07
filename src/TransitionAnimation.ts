import Animated from "react-native-reanimated";
import { SpringDriver } from "@tleef/react-native-reanimated-utils/lib";
import {
  EndHandler,
  EndListeners,
  SpringConfig,
  StartHandler,
  StartListeners
} from "./types";

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

export default class TransitionAnimation {
  private readonly _driver: SpringDriver;
  private readonly _inOut: Animated.Value<-1 | 0 | 1>;
  private readonly _prevInOut: Animated.Value<-1 | 0 | 1>;
  private readonly _drive: Animated.Node<number>;
  private readonly _enterStartListeners: StartListeners;
  private readonly _enterEndListeners: EndListeners;
  private readonly _leaveStartListeners: StartListeners;
  private readonly _leaveEndListeners: EndListeners;
  private _finished = false;

  constructor(springConfig: Partial<SpringConfig>) {
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
      call([], () => this._handleLeaveEnd(true))
    );

    const handleEnterStart = cond(
      not(eq(this._prevInOut, 1)),
      call([], this._handleEnterStart)
    );

    const handleEnterEnd = cond(
      not(clockRunning(this._driver.clock)),
      call([], () => this._handleEnterEnd(false))
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
      call([], () => this._handleEnterEnd(true))
    );

    const handleLeaveStart = cond(
      not(eq(this._prevInOut, -1)),
      call([], this._handleLeaveStart)
    );

    const handleLeaveEnd = cond(
      not(clockRunning(this._driver.clock)),
      call([], () => this._handleLeaveEnd(false))
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
  }

  get animValue() {
    return this._driver.value;
  }

  get animate() {
    return this._drive;
  }

  private _handleEnterStart = () => {
    this._enterStartListeners.forEach(fn => fn());
  };

  private _handleEnterEnd = (cancelled: boolean) => {
    if (!cancelled) {
      this._finished = true;
    }
    this._enterEndListeners.forEach(fn => fn(cancelled));
  };

  private _handleLeaveStart = () => {
    this._leaveStartListeners.forEach(fn => fn());
  };

  private _handleLeaveEnd = (cancelled: boolean) => {
    if (!cancelled) {
      this._finished = true;
    }
    this._leaveEndListeners.forEach(fn => fn(cancelled));
  };

  forward = () => {
    if (!this._finished) {
      this._inOut.setValue(1);
    }
  };

  backward = () => {
    if (!this._finished) {
      this._inOut.setValue(-1);
    }
  };

  onEnterStart = (handler: StartHandler) => {
    if (!this._finished) {
      this._enterStartListeners.push(handler);
    }
  };

  onEnterEnd = (handler: EndHandler) => {
    if (!this._finished) {
      this._enterEndListeners.push(handler);
    }
  };

  onLeaveStart = (handler: StartHandler) => {
    if (!this._finished) {
      this._leaveStartListeners.push(handler);
    }
  };

  onLeaveEnd = (handler: EndHandler) => {
    if (!this._finished) {
      this._leaveEndListeners.push(handler);
    }
  };
}
