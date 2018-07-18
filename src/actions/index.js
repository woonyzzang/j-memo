// import memo from '../api/memo';
import * as types from './ActionTypes';

// const receiveMemoDir = (memo) => ({
//   type: types.RECEIVE_MEMO_DIR,
//   products: products
// });
//
// export const getAllMemoDirs = () => dispatch => {
//   memo.getDirItemData(products => {
//     dispatch(receiveMemoDir(poroducts));
//   });
// };

// export function reduxTEST() {
//   return {
//     type: types.REDUX_TEST
//   };
// }

export const reduxTEST = () => ({
  type: types.REDUX_TEST
});

export const setColor = (color) => ({
  type: types.SET_COLOR,
  color: color
});
