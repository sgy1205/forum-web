<template>
    <div class="user-board tran">
        <div class="window cursor" @click="goPersonal($route.params.id)">
            <img :src="userInfo.avatar
                ? (userInfo.avatar.startsWith('http') || userInfo.avatar.startsWith('https')
                    ? userInfo.avatar
                    : proxyTarget + userInfo.avatar)
                : require('@/assets/images/默认头像.png')" :alt="(userInfo.nickName || '未知用户') + '的头像'" />
        </div>
        <div class="user-name">{{ userInfo.nickName || '未知用户' }}</div>
        <div class="user-signature tran">{{ userInfo.signature || '这个人很懒，什么都没留下' }}</div>
        <el-divider></el-divider>
        <div class="achievement-content tran">
            <div class="achievement-item cursor" @click="goPersonal($route.params.id)">
                <div class="achievement-name ">积分</div>
                <span class="achievement-value tran">{{ userInfo.points || 0 }}</span>
            </div>
            <div class="achievement-item cursor" @click="goPersonal($route.params.id)">
                <div class="achievement-name ">话题</div>
                <span class="achievement-value tran">{{ userInfo.postNumber || 0 }}</span>
            </div>
            <div class="achievement-item cursor" @click="goPersonal($route.params.id)">
                <div class="achievement-name ">评论</div>
                <span class="achievement-value tran">{{ userInfo.commentNumber || 0 }}</span>
            </div>
            <div class="achievement-item cursor">
                <div class="achievement-name ">注册排名</div>
                <span class="achievement-value tran">{{ userInfo.registerRank || '未知' }}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'UserBoard',
    props: {
        userInfo: {
            type: Object,
            default: () => ({
                id: '',
                name: '',
                avatar: '',
                signature: '',
                points: 0,
                comments: 0,
                rank: 0
            })
        }
    },
    data() {
        return {
            proxyTarget: process.env.VUE_APP_PROXY_TARGET
        };
    },
    methods: {
        goPersonal(id) {
            this.$router.push({ name: 'Personal', params: { id } });
        },
    }
}
</script>
<style lang="scss" scoped>

.user-board {
    background-color: rgb(244, 245, 253);
    border-radius: 12px;
    width: 340px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 20px;
    gap: 10px;
    height: fit-content;
    position: sticky;
    top: 90px;

    .user-name {
        font-size: 16px;
        font-weight: bold;
        color: #296cff;
    }

    .user-signature {
        font-size: 14px;
        color: #7a7a7a;
        text-align: center;
        width: 100%;
    }

    .window {
        width: 60px;
        height: 60px;
        overflow: hidden;
        border-radius: 50%;


        img {
            height: 100%;
            width: 100%;
        }
    }

    .achievement-content {
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #A7A7AF;
    }

    .achievement-item {
        width: 100%;
        display: flex;
        flex-direction: column;

        .achievement-name {
            text-align: center;
        }

        .achievement-value {
            width: 100%;
            color: black;
            font-weight: bold;
            text-align: center;
        }
    }


}
</style>