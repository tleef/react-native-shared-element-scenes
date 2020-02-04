import { SpringConfig as StrictSpringConfig } from "@tleef/react-native-reanimated-utils/lib";

export type StartHandler = () => void;
export type EndHandler = (cancelled: boolean) => void;
export type StartListeners = StartHandler[];
export type EndListeners = EndHandler[];
export type SpringConfig = Partial<StrictSpringConfig>;
