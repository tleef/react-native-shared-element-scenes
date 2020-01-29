import React from "react";
import hoistStatics from "hoist-non-react-statics";
import invariant from "tiny-invariant";
import StageContext from "./StageContext";
import Stage from "./Stage";

export type InjectedStageProps = {
  stage: Stage;
};

export default function withStage<T extends React.ComponentType<any>>(Component: T) {
  const displayName = `withStage(${Component.displayName || Component.name})`;
  const C = (props: any) => {
    const { wrappedComponentRef, ...remainingProps } = props;

    return (
      <StageContext.Consumer>
        {(stage: Stage | null) => {
          invariant(
            stage,
            `You should not use <${displayName} /> outside a <Stage>`
          );
          return (
            <Component
              {...remainingProps}
              stage={stage}
              ref={wrappedComponentRef}
            />
          );
        }}
      </StageContext.Consumer>
    );
  };

  C.displayName = displayName;
  C.WrappedComponent = Component;

  return hoistStatics(C, Component);
}
