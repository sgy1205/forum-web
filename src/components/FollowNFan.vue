<template>
    <div class="follow-n-fan">
        <div class="cursor tran" @click="goPersonal(fanFo.userId)" style="display: flex; flex: 1; gap: 10px;">
            <div class="avatar-window">
                <img :src="handleAvatar(fanFo.avatar)" :alt="fanFo.nickName + '的头像'" class="avatar">
            </div>
            <div class="user-info">
                <div class="user-name">{{ fanFo.nickName }}</div>
                <div class="user-signature" :style="{ width: short ? '130px' : '615px' }">{{
                    fanFo.signature || "这个人很懒，什么都没留下"
                }}
                </div>
            </div>
        </div>
        <div class="follow-btn cursor tran" v-show="!isCurrentUser" @click="handleFollow">
            <div v-if="!hasFollow">
                <i class="el-icon-plus"></i>
                关注
            </div>
            <div class="has-follow tran" v-else>
                <i class="el-icon-check"></i>
                已关注
            </div>
        </div>
    </div>
</template>
<script>
import { follow } from '@/api/personal';
export default {
    name: 'FollowNFan',
    props: {
        fanFo: {
            type: Object,
            required: true
        },
        userId: {
            type: String,
            default: ''
        },
        short: {
            type: Boolean,
            default: true
        },
        concernList: {
            type: Array,
            default: () => []
        },

    },
    data() {
        return {
            // hasFollow: false,
            proxy: process.env.VUE_APP_PROXY_TARGET,
        };
    },
    created() {
    },
    computed: {
        isCurrentUser() {
            return this.fanFo.userId == this.userId;
        },
        // 是否关注
        hasFollow() {
            if (!this.concernList.length) return false;
            return this.concernList.some(item => item.userId === this.fanFo.userId);
        },

    },
    methods: {
        handleAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return this.proxy + avatar;
        },
        goPersonal(id) {
            if (this.$route.path === `/personal/${id}`) return;
            this.$router.push(`/personal/${id}`);
        },
        handleFollow() {
            follow(this.fanFo.userId).then(res => {
                this.$message.success(res.msg)
                this.$emit('refreshFansAndFollow');
            }).catch(err => {
            });
        }
    },
}
</script>
<style lang="scss" scoped>
.follow-n-fan {
    display: flex;
    // gap: 10px;
    margin: 10px 0;


    .avatar-window {
        width: 50px;
        height: 50px;
        overflow: hidden;
        border-radius: 50%;

        img {
            width: 50px;
            height: 50px;
        }
    }

    .user-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        text-align: left;

        .user-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 130px;
            padding-bottom: 15px;
        }

        .user-signature {
            font-size: 12px;
            color: #7a7a7a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .follow-btn,
    .has-follow {
        height: 30px;
        text-align: center;
        line-height: 30px;
        margin: auto 0;
        width: 75px;
        background-color: #296cff;
        color: white;
        font-weight: bold;
        border-radius: 8px;

        &:hover {
            background-color: #4c85ff;
        }



        .el-icon-plus,
        .el-icon-check {
            font-weight: bold;
        }
    }

    .has-follow {
        background-color: #84abff;
    }
}
</style>