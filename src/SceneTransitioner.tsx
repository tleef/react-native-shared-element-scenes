import React from "react";
import withStage, { InjectedStageProps } from "./withStage";
import SceneTransition from "./SceneTransition";
import { SpringConfig } from "./types";
import Transition from "./Transition";

type Transitions = { [key: string]: Transition };

type TransitionArgs = {
  fromId: string;
  toId: string;
  springConfig?: SpringConfig;
};

type State = {
  count: number;
};

export class SceneTransitionerClass extends React.Component<
  InjectedStageProps,
  State
> {
  private readonly _transitions: Transitions = {};

  constructor(props: InjectedStageProps) {
    super(props);

    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <React.Fragment>
        {Object.keys(this._transitions).map(transKey => {
          return (
            <SceneTransition
              key={transKey}
              transition={this._transitions[transKey]}
            />
          );
        })}
      </React.Fragment>
    );
  }

  public transition = ({ fromId, toId, springConfig = {} }: TransitionArgs) => {
    const { stage } = this.props;

    let trans = this._transitions[Transition.keyFor(fromId, toId)];

    if (!trans) {
      trans = new Transition(
        fromId,
        toId,
        springConfig,
        stage,
        this._handleTransitionReady,
        this._handleTransitionFinished
      );

      this._transitions[trans.key] = trans;
    }

    trans.continue();

    return trans;
  };

  private _handleTransitionReady = () => {
    this.setState({
      count: this.state.count + 1
    });
  };

  private _handleTransitionFinished = (trans: Transition) => {
    delete this._transitions[trans.key];

    this.setState({
      count: this.state.count + 1
    });
  };
}

export default withStage(SceneTransitionerClass);
