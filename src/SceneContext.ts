import React from "react";
import { SceneType } from "./Scene";

const SceneContext = React.createContext<SceneType | null>(null);

export default SceneContext;
