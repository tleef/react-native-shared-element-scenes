import React from "react";
import withStage, { InjectedStageProps } from "./withStage";
import SceneTransition from "./SceneTransition";
import { SpringConfig } from "./types";
import Transition from "./Transition";

type TransitionArgs = {
  fromId: string;
  toId: string;
  springConfig?: SpringConfig;
};

type State = {
  count: number;
  transitions: { [key: string]: Transition };
};

export class SceneTransitionerClass extends React.Component<
  InjectedStageProps,
  State
> {
  constructor(props: InjectedStageProps) {
    super(props);

    this.state = {
      count: 0,
      transitions: {}
    };
  }

  render() {
    const { transitions } = this.state;

    return (
      <React.Fragment>
        {Object.keys(transitions).map(transKey => {
          return (
            <SceneTransition
              key={transKey}
              transition={transitions[transKey]}
            />
          );
        })}
      </React.Fragment>
    );
  }

  public transition = ({ fromId, toId, springConfig = {} }: TransitionArgs) => {
    const { stage } = this.props;
    const { transitions } = this.state;

    let trans = transitions[Transition.keyFor(fromId, toId)];

    if (!trans) {
      trans = new Transition(
        fromId,
        toId,
        springConfig,
        stage,
        this._handleTransitionReady,
        this._handleTransitionFinished
      );

      this.setState({
        transitions: {
          ...transitions,
          [trans.key]: trans
        }
      });
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
    const { transitions } = this.state;

    delete transitions[trans.key];

    this.setState({
      transitions: {
        ...transitions
      }
    });
  };
}

export default withStage(SceneTransitionerClass);
