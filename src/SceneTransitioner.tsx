import React from "react";
import {SceneType} from "./Scene";
import withStage, { InjectedStageProps } from "./withStage";
import SceneTransition, { SpringConfig } from "./SceneTransition";

type TransitionArgs = {
  from: string;
  to: string;
  springConfig?: SpringConfig;
  onFinish?: () => void;
};

type State = {
  from?: string;
  fromScene?: SceneType;
  to?: string;
  toScene?: SceneType;
  springConfig?: SpringConfig;
  onFinish?: () => void;
};

class SceneTransitioner extends React.Component<InjectedStageProps, State> {
  state: State = {};

  handleAddScene = (sceneId: string, scene: SceneType) => {
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

    this.props.stage.removeAddSceneListener(sceneId, this.handleAddScene);
  };

  onFinish = () => {
    const { onFinish } = this.state;

    this.setState({
      from: undefined,
      fromScene: undefined,
      to: undefined,
      toScene: undefined,
      springConfig: undefined,
      onFinish: undefined
    });

    if (onFinish) {
      onFinish();
    }
  };

  transition({ from, to, springConfig, onFinish }: TransitionArgs) {
    const { stage } = this.props;

    const fromScene = stage.getScene(from);
    const toScene = stage.getScene(to);

    if (!fromScene) {
      stage.onAddScene(from, this.handleAddScene);
    }
    if (!toScene) {
      stage.onAddScene(to, this.handleAddScene);
    }

    this.setState({
      from,
      fromScene,
      to,
      toScene,
      springConfig,
      onFinish
    });
  }

  render() {
    const { fromScene, toScene, springConfig } = this.state;

    if (!fromScene || !toScene) {
      return null;
    }

    return (
      <SceneTransition
        from={fromScene}
        to={toScene}
        springConfig={springConfig}
        onFinish={this.onFinish}
      />
    );
  }
}

export default withStage(SceneTransitioner);
