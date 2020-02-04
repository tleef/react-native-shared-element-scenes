import Animated from "react-native-reanimated";
import {
  EndHandler,
  EndListeners,
  StartHandler,
  StartListeners
} from "./types";

export default class TransitionReceipt {
  private readonly _inOut: Animated.Value<-1 | 0 | 1>;
  private readonly _enterStartListeners: StartListeners;
  private readonly _enterEndListeners: EndListeners;
  private readonly _leaveStartListeners: StartListeners;
  private readonly _leaveEndListeners: EndListeners;

  constructor(
    inOut: Animated.Value<-1 | 0 | 1>,
    enterStartListeners: StartListeners,
    enterEndListeners: EndListeners,
    leaveStartListeners: StartListeners,
    leaveEndListeners: EndListeners
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
