import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  SharedElement as RawSharedElement,
  SharedElementNode,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign
} from "react-native-shared-element";
import withScene, { InjectedSceneProps } from "./withScene";

type Props = {
  sharedId: string;
  animation: SharedElementAnimation;
  resize?: SharedElementResize;
  align?: SharedElementAlign;
  style?: StyleProp<ViewStyle>;
} & InjectedSceneProps;

class SharedElement extends React.Component<Props> {
  static defaultProps = {
    animation: "move"
  };

  private _node?: SharedElementNode;
  private _sharedId?: string;

  constructor(props: Props) {
    super(props);

    this._sharedId = props.sharedId;
  }

  componentDidUpdate() {
    const { sharedId, scene } = this.props;
    if (this._sharedId !== sharedId) {
      if (this._sharedId && this._node) {
        scene.removeActor(this._sharedId);
      }
      this._sharedId = sharedId;
      if (this._sharedId && this._node) {
        scene.addActor(this._sharedId, {
          node: this._node,
          config: {
            animation: this.props.animation,
            resize: this.props.resize,
            align: this.props.align
          }
        });
      }
    }
  }

  componentWillUnmount() {
    if (this._sharedId && this._node) {
      this.props.scene.removeActor(this._sharedId);
    }
  }

  onSetNode = (node: SharedElementNode | null) => {
    if (this._node === (node || undefined)) {
      return;
    }
    if (this._node && this._sharedId) {
      this.props.scene.removeActor(this._sharedId);
    }
    this._node = node || undefined;
    if (this._node && this._sharedId) {
      this.props.scene.addActor(this._sharedId, {
        node: this._node,
        config: {
          animation: this.props.animation,
          resize: this.props.resize,
          align: this.props.align
        }
      });
    }
    this._node = node || undefined;
  };

  render() {
    const { sharedId, animation, resize, align, scene, ...rest } = this.props;

    return (
      <RawSharedElement onNode={this.onSetNode} {...rest}>
        {this.props.children}
      </RawSharedElement>
    );
  }
}

export default withScene(SharedElement);
