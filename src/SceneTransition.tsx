import React from "react";
import { View, StyleSheet } from "react-native";
import {
  SharedElementTransition,
  RNAnimatedSharedElementTransitionView
} from "react-native-shared-element";
import Animated from "react-native-reanimated";
import Transition from "./Transition";

const RNRenimatedSharedElementTransitionView = Animated.createAnimatedComponent(
  RNAnimatedSharedElementTransitionView
);

type Props = {
  transition: Transition;
};

export default class SceneTransition extends React.Component<Props> {
  render() {
    const { transition } = this.props;

    const toScene = transition.toScene;
    const fromScene = transition.fromScene;

    if (!toScene || !fromScene) {
      return null;
    }

    const toActors = toScene.getActors();
    const fromActors = fromScene.getActors();

    const toIds = Object.keys(toActors);
    const fromIds = Object.keys(fromActors);

    const sharedIds = toIds.filter(id => fromIds.includes(id));

    if (!sharedIds.length) {
      return null;
    }

    return (
      <React.Fragment>
        <Animated.Code>{() => transition.animate}</Animated.Code>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {sharedIds.map((sharedId, index) => {
            const fromActor = fromActors[sharedId];
            const toActor = toActors[sharedId];

            return (
              <SharedElementTransition
                key={index}
                start={{
                  ancestor: fromScene.getAncestor() || null,
                  node: fromActor.node
                }}
                end={{
                  ancestor: toScene.getAncestor() || null,
                  node: toActor.node
                }}
                position={transition.animValue}
                animation={toActor.config.animation}
                resize={toActor.config.resize}
                align={toActor.config.align}
                SharedElementComponent={RNRenimatedSharedElementTransitionView}
              />
            );
          })}
        </View>
      </React.Fragment>
    );
  }
}
