import React from "react";
import { View, ViewProps } from "react-native";
import {
  nodeFromRef,
  SharedElementAlign,
  SharedElementAnimation,
  SharedElementNode,
  SharedElementResize
} from "react-native-shared-element";
import SceneContext from "./SceneContext";
import withStage, { InjectedStageProps } from "./withStage";

type SharedElementConfig = {
  readonly animation: SharedElementAnimation;
  readonly resize?: SharedElementResize;
  readonly align?: SharedElementAlign;
  readonly debug?: boolean;
};

type SharedElementActor = {
  node: SharedElementNode;
  config: SharedElementConfig;
};

type Actors = {
  [key: string]: SharedElementActor;
};

type Props = {
  sceneId: string;
} & InjectedStageProps &
  ViewProps;

export class SceneClass extends React.Component<Props> {
  private _sceneId?: string;
  private _ancestorNode?: SharedElementNode = undefined;
  private _actors: Actors = {};

  componentDidMount() {
    const { sceneId, stage } = this.props;
    this._sceneId = sceneId;
    if (this._sceneId) {
      stage.addScene(this._sceneId, this);
    }
  }

  componentDidUpdate() {
    const { sceneId, stage } = this.props;
    if (this._sceneId !== sceneId) {
      if (this._sceneId) {
        stage.removeScene(this._sceneId);
      }
      this._sceneId = sceneId;
      if (this._sceneId) {
        stage.addScene(this._sceneId, this);
      }
    }
  }

  componentWillUnmount() {
    if (this._sceneId) {
      this.props.stage.removeScene(this._sceneId);
    }
  }

  getAncestor(): SharedElementNode | undefined {
    return this._ancestorNode;
  }

  setAncestor(ancestorNode: SharedElementNode | null) {
    if (this._ancestorNode === ancestorNode) return;
    this._ancestorNode = ancestorNode || undefined;
  }

  addActor(id: string, actor: SharedElementActor): void {
    this._actors[id] = actor;
  }

  removeActor(id: string): void {
    delete this._actors[id];
  }

  getActors(): Actors {
    return this._actors;
  }

  onSetRef = (ref: View) => {
    this.setAncestor(nodeFromRef(ref));
  };

  render() {
    return (
      <SceneContext.Provider value={this}>
        <View ref={this.onSetRef} pointerEvents={"box-none"} {...this.props} />
      </SceneContext.Provider>
    );
  }
}

export default withStage(SceneClass);
