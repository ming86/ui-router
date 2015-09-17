import {isString} from "../common/common";
import {IState, IStateOrName} from "./interface";

export default class StateMatcher {
  constructor (private _states: {[key: string]: IState}) { }
  
  isRelative(stateName: string) {
    stateName = stateName || "";
    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
  }


  find(stateOrName: IStateOrName, base?: IStateOrName): IState {
    if (!stateOrName && stateOrName !== "") return undefined;
    let isStr = isString(stateOrName);
    let name: string = isStr ? stateOrName : (<any>stateOrName).name;

    if (this.isRelative(name)) name = this.resolvePath(name, base);
    let state = this._states[name];

    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
      return state;
    }
    return undefined;
  }

  resolvePath(name: string, base: IStateOrName) {
    if (!base) throw new Error(`No reference point given for path '${name}'`);
    
    let baseState: IState = this.find(base);

    let splitName = name.split("."), i = 0, pathLength = splitName.length, current = baseState;

    for (; i < pathLength; i++) {
      if (splitName[i] === "" && i === 0) {
        current = baseState;
        continue;
      }
      if (splitName[i] === "^") {
        if (!current.parent) throw new Error(`Path '${name}' not valid for state '${baseState.name}'`);
        current = current.parent;
        continue;
      }
      break;
    }
    let relName = splitName.slice(i).join(".");
    return current.name + (current.name && relName ? "." : "") + relName;
  }
}