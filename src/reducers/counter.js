import * as types from '../actions/ActionTypes';

const initialState = {
  number: 10,
  dumbObj: {
    a: 0,
    b: 1,
    c: 2,
    d: 3
  }
};

export default function counter(state = initialState, action) {
  // if (typeof state === 'undefined') {
  //   return initialState;
  // }

  switch (action.type) {
    case types.REDUX_TEST:
      return {
        //...state,
        number: state.number + 1
        //dumbObj: {..state.dumbObj, c: 200}
      };
    default:
      return state;
  }
}
