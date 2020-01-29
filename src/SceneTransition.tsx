import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { SharedElementTransition } from "react-native-shared-element";
import {SceneType} from "./Scene";

export type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
};

type Props = {
  from: SceneType;
  to: SceneType;
  springConfig: SpringConfig;
  onFinish: () => void;
};

export default class SceneTransition extends React.Component<Props> {
  static defaultProps = {
    springConfig: {}
  };

  render() {
    const { to, from, springConfig, onFinish } = this.props;

    if (!to || !from) {
      return null;
    }

    const toActors = to.getActors();
    const fromActors = from.getActors();

    const toIds = Object.keys(toActors);
    const fromIds = Object.keys(fromActors);

    const sharedIds = toIds.filter(id => fromIds.includes(id));

    if (!sharedIds.length) {
      return null;
    }

    const position = new Animated.Value(0);

    Animated.spring(position, {
      toValue: 1,
      stiffness: springConfig.stiffness,
      damping: springConfig.damping,
      mass: springConfig.mass
    }).start(onFinish);

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {sharedIds.map((sharedId, index) => {
          const fromActor = fromActors[sharedId];
          const toActor = toActors[sharedId];

          return (
            <SharedElementTransition
              key={index}
              start={{
                ancestor: from.getAncestor() || null,
                node: fromActor.node
              }}
              end={{
                ancestor: to.getAncestor() || null,
                node: toActor.node
              }}
              position={position}
              animation={toActor.config.animation}
              resize={toActor.config.resize}
              align={toActor.config.align}
            />
          );
        })}
      </View>
    );
  }
}
