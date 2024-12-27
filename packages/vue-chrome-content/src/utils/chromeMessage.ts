interface IMessage {
  data: any; // 消息内容
  action: string; // 消息类型
}
interface IResponseMessage {
  data: any; // 消息内容
  success: boolean; // 消息是否成功
}

/**
 * 给background.js发送消息
 * @date 2023-12-21
 * @param {any} event
 * @param {any} responseCallBack
 * @returns {any}
 */
export const sendMsgToBackgroundPromise = function (event: IMessage) {
  return new Promise((rs, rj) => {
    chrome.runtime.sendMessage(event, (result: IResponseMessage) => {
      if (result.success) {
        rs(result.data);
      } else {
        rj(result);
      }
    });
  });
};
