import React from "react";
import { SceneClass } from "./Scene";

const SceneContext = React.createContext<SceneClass | null>(null);

export default SceneContext;
