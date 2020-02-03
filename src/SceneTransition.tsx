import React from "react";
import { View, StyleSheet } from "react-native";
import {
  SharedElementTransition,
  RNAnimatedSharedElementTransitionView
} from "react-native-shared-element";
import { SceneType } from "./Scene";
import Animated from "react-native-reanimated";

const RNRenimatedSharedElementTransitionView = Animated.createAnimatedComponent(
  RNAnimatedSharedElementTransitionView
);

type Props = {
  from: SceneType;
  to: SceneType;
  position: Animated.Value<number>;
};

export default class SceneTransition extends React.Component<Props> {
  static defaultProps = {
    springConfig: {}
  };

  render() {
    const { to, from, position } = this.props;

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
              SharedElementComponent={RNRenimatedSharedElementTransitionView}
            />
          );
        })}
      </View>
    );
  }
}
