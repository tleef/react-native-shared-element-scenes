import React from "react";
import Stage from "./Stage";

const StageContext = React.createContext<Stage | null>(null);

export default StageContext;
