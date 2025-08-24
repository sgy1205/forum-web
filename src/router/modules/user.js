import { removeToken } from "@/utils/auth";


const user = {
  state: {
    user: {
      id: '',
      nickName: '',
      avatar: '',
      signature: '',
      homepageUrl: '',
      points: 0,
      commentNumber: 0,
      userRank: 0,
      email: '',
      fansListVos: [],
      msConcernListVos: [],
      background: '',
      concernTotal: 0,
      fansTotal: 0,
      topicNumber: 0,
      unreadCount: 0
    }
  },
  mutations: {
    setUserInfo(state, payload) {
      state.user.id = payload.id || '';
      state.user.nickName = payload.nickName || '';
      state.user.avatar = payload.avatar || '';
      state.user.signature = payload.signature || '';
      state.user.homepageUrl = payload.homepageUrl || '';
      state.user.points = payload.points || 0;
      state.user.commentNumber = payload.commentNumber || 0;
      state.user.userRank = payload.userRank || 0;
      state.user.email = payload.email || '';
      state.user.fansListVos = payload.fansListVos || [];
      state.user.msConcernListVos = payload.msConcernListVos || [];
      state.user.background = payload.background || '';
      state.user.concernTotal = payload.concernTotal || 0;
      state.user.fanTotal = payload.fanTotal || 0;
      state.user.topicNumber = payload.topicNumber || 0;
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
          homepageUrl: '',
          points: 0,
          commentNumber: 0,
          userRank: 0,
          email: '',
          fansListVos: [],
          msConcernListVos: [],
          background: '',
          concernTotal: 0,
          fansTotal: 0,
          topicNumber: 0,
          unreadCount: 0
        });
        resolve();
      });
    },
  }
}

export default user
