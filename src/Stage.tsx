import React from "react";
import { ViewProps } from "react-native";
import { EventEmitter } from "events";
import StageContext from "./StageContext";
import { SceneClass } from "./Scene";

type Handler = (id: string, scene: SceneClass) => void;

type Scenes = {
  [key: string]: SceneClass;
};

export default class Stage extends React.Component<ViewProps> {
  private _scenes: Scenes = {};
  private _ee = new EventEmitter();

  addScene(id: string, scene: SceneClass): void {
    this._scenes[id] = scene;
    this._ee.emit(`add:${id}`, id, scene);
  }

  removeScene(id: string): void {
    delete this._scenes[id];
    this._ee.emit(`remove:${id}`, id);
  }

  getScene(id: string): SceneClass | undefined {
    return this._scenes[id];
  }

  onAddScene(id: string, handler: Handler) {
    this._ee.on(`add:${id}`, handler);
  }

  removeAddSceneListener(id: string, handler: Handler) {
    this._ee.removeListener(`add:${id}`, handler);
  }

  onRemoveScene(id: string, handler: Handler) {
    this._ee.on(`remove:${id}`, handler);
  }

  removeRemoveSceneListener(id: string, handler: Handler) {
    this._ee.removeListener(`remove:${id}`, handler);
  }

  render() {
    return <StageContext.Provider value={this} {...this.props} />;
  }
}
