import { removeToken } from "@/utils/auth";


const user = {
  state: {
    user: {
      id: '',
      nickName: '',
      avatar: '',
      signature: '',
      points: 0,
      commentNumber: 0,
      registerRank: 0,
      email: '',
      fanListVos: [],
      concernListVos: [],
      background: '',
      concernTotal: 0,
      fansTotal: 0,
      postNumber: 0,
      unreadCount: 0
    }
  },
  mutations: {
    setUserInfo(state, payload) {
      state.user.id = payload.id || '';
      state.user.nickName = payload.nickName || '';
      state.user.avatar = payload.avatar || '';
      state.user.signature = payload.signature || '';
      state.user.points = payload.points || 0;
      state.user.commentNumber = payload.commentNumber || 0;
      state.user.registerRank = payload.registerRank || 0;
      state.user.email = payload.email || '';
      state.user.fanListVos = payload.fanListVos || [];
      state.user.concernListVos = payload.concernListVos || [];
      state.user.background = payload.background || '';
      state.user.concernTotal = payload.concernTotal || 0;
      state.user.fanTotal = payload.fanTotal || 0;
      state.user.postNumber = payload.postNumber || 0;
      // 同步到本地
      localStorage.setItem('userInfo', JSON.stringify(state.user));
    },
    setUserId(state, userId) {
      state.user.id = userId;
    },
    setUnreadCount(state, count) {
      state.user.unreadCount = count;
    }
  },
  actions: {
    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        // 清除用户信息
        localStorage.removeItem('userInfo');
        removeToken();
        commit('setUserInfo', {
          id: '',
          nickName: '',
          avatar: '',
          signature: '',
          points: 0,
          commentNumber: 0,
          registerRank: 0,
          email: '',
          fanListVos: [],
          concernListVos: [],
          background: '',
          concernTotal: 0,
          fansTotal: 0,
          postNumber: 0,
          unreadCount: 0
        });
        resolve();
      });
    },
  }
}

export default user
