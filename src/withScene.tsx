import React from "react";
import hoistStatics from "hoist-non-react-statics";
import invariant from "tiny-invariant";
import SceneContext from "./SceneContext";
import { SceneType } from "./Scene";

export type InjectedSceneProps = {
  scene: SceneType;
};

export default function withScene<T extends React.ComponentType<any>>(
  Component: T
) {
  const displayName = `withScene(${Component.displayName || Component.name})`;
  const C = (props: any) => {
    const { wrappedComponentRef, ...remainingProps } = props;

    return (
      <SceneContext.Consumer>
        {(scene: SceneType | null) => {
          invariant(
            scene,
            `You should not use <${displayName} /> outside a <Scene>`
          );
          return (
            <Component
              {...remainingProps}
              scene={scene}
              ref={wrappedComponentRef}
            />
          );
        }}
      </SceneContext.Consumer>
    );
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;

  return hoistStatics(C, Component);
}
