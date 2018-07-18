import _dirItemData from './dirItemData.json';

//https://www.youtube.com/watch?v=M6dGGF-n3qs

const TIMEOUT = 100;

// 외부에서 보낸 콜백함수의 인자 시간 후 혹은 100ms 후에 콜백함수를 실행한다.
export default {
  getDirItemData: (cb, timeout) => {
    setTimeout(() => cb(_dirItemData), timeout || TIMEOUT);
  }
}
