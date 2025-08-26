<template>
    <div class="login main tran">
        <HeaderBar :key="userId" />
        <div class="login-container tran">
            <h2>登录</h2>
            <el-form :model="loginForm" ref="loginFormRef" class="login-form tran" :rules="loginRules">
                <el-form-item label="用户名或邮箱" prop="accountInput">
                    <el-input v-model="loginForm.accountInput" placeholder="请输入用户名或邮箱"
                        @blur="handleAccountInput"></el-input>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item class="login-row tran">
                    <el-button @click="loginBtn" plain class="tran login-btn">登录</el-button>
                </el-form-item>

                <div class="go-register">
                    <router-link to="/register" class="register-link tran">没有账号？点击这里去注册&gt;&gt;</router-link>
                </div>
                <!-- 弹窗 -->
                <el-dialog :visible.sync="captchaDialog.visible" width="350px" :show-close="false"
                    :close-on-click-modal="false">
                    <div class="captcha-box">
                        <div class="top-bar">
                            <div style="font-size: 16px;">请拖动滑块完成拼图</div>
                            <div class="icon-bar">
                                <i class="el-icon-refresh" @click="showCaptcha"></i>
                                <i class="el-icon-close" @click="closeCaptcha"></i>
                            </div>

                        </div>

                        <div class="captcha-img-box">
                            <!-- 对照图片 -->
                            <div class="window-normal">
                                <img :src="captchaDialog.captchaImg || require('@/assets/images/back1.jpg')"
                                    class="captcha-img-normal" />
                            </div>
                            <!-- 旋转图片 -->
                            <div class="window">
                                <img :src="captchaDialog.captchaImg || require('@/assets/images/back1.jpg')"
                                    :style="{ transform: `rotate(${captchaDialog.originalDegree + captchaDialog.currentDegree}deg)` }"
                                    class="captcha-img" />
                            </div>
                        </div>
                        <div class="slider-box">
                            <el-slider v-model="captchaDialog.currentDegree" :min="0" :max="360"
                                @change="verifyCaptcha" />
                        </div>
                    </div>
                </el-dialog>
            </el-form>
        </div>
    </div>
</template>
<script>
import { curUser } from '@/api/login';
import { setToken } from '@/utils/auth';

export default {
    name: 'Login',
    components: {
        HeaderBar: () => import('@/components/HeaderBar.vue')
    },
    data() {
        return {
            debounce: false,
            userId: '',
            captchaDialog: {
                visible: false,
                captchaImg: undefined,
                // 当前旋转角度
                currentDegree: 0,
                // 原始角度
                originalDegree: 0,
                // 允许误差
                tolerance: 10
            },
            loginForm: {
                username: '',
                email: '',
                password: '',
                // 统一输入值，后面把他分为用户名或者邮箱
                accountInput: ''
            },
            loginRules: {
                accountInput: [
                    { required: true, message: '请输入用户名或邮箱', trigger: 'change' },
                    { max: 50, message: '不能超过50个字符', trigger: 'change' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'change' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'change' },
                    { max: 20, message: '密码不能超过20个字符', trigger: 'change' }
                ]
            },
        };
    },
    created() {
    },
    methods: {
        // 单纯触发校验和验证码逻辑
        loginBtn() {
            localStorage.removeItem('token');
            if (this.debounce) return;
            this.debounce = true;
            this.$refs.loginFormRef.validate(valid => {
                if (!valid) {
                    this.$message.error('请检查输入的内容');
                    this.debounce = false;
                    return;
                }
                if (!(this.loginForm.email || this.loginForm.username) || !this.loginForm.password) {
                    this.$message.error('用户名/邮箱和密码不能为空');
                    this.debounce = false;
                    return;
                }
                // 弹出验证码
                this.showCaptcha();
            });
        },
        // 判断是用户名还是邮箱
        handleAccountInput() {
            const emailTest = /^[A-Za-z0-9_]+@[A-Za-z0-9]+\.[A-Za-z]{2,}$/;
            if (emailTest.test(this.loginForm.accountInput)) {
                this.loginForm.email = this.loginForm.accountInput;
                this.loginForm.username = '';
            } else {
                this.loginForm.username = this.loginForm.accountInput;
                this.loginForm.email = '';
            }
        },
        // 显示验证码弹窗，或者可以刷新验证码
        showCaptcha() {
            this.$axios.get('/getCaptchaImage').then(res => {
                this.captchaDialog.captchaImg = res.data.imageUrl || '@/assets/images/back1.jpg';
            }).catch(error => {
            });
            this.captchaDialog.visible = true;
            // 随机生成一个原始角度
            this.captchaDialog.originalDegree = Math.floor(Math.random() * 360);
            this.captchaDialog.currentDegree = 0;
        },
        // 关掉验证码，清空旋转的角度
        closeCaptcha() {
            this.captchaDialog.visible = false;
            this.captchaDialog.originalDegree = 0;
            this.captchaDialog.currentDegree = 0;
            this.debounce = false;
        },
        // 验证,顺便用来发登录接口
        verifyCaptcha() {
            // 计算差值
            const diff = Math.abs(
                (this.captchaDialog.originalDegree + this.captchaDialog.currentDegree) - 360
            );
            // const diff = 0
            if (diff <= this.captchaDialog.tolerance) {
                this.closeCaptcha()
                console.log(diff);
                // 调用登录接口

                this.$axios({
                    method: 'post',
                    url: '/login',
                    data: {
                        loginStr: this.loginForm.username ? this.loginForm.username : this.loginForm.email,
                        password: this.loginForm.password
                    }
                }).then(res => {
                        setToken(res.token);
                        this.userId = res.userId;
                        // 调用用户详情接口拿到信息
                        curUser(this.userId).then(res => {
                            this.$store.commit('setUserInfo', res.data);
                            this.$store.commit('setUserId', this.userId);
                            localStorage.setItem('userId', this.userId);
                            localStorage.setItem('userName', res.data.userName || '默认用户名');
                            localStorage.setItem('nickName', res.data.nickName || '默认昵称');
                            localStorage.setItem('avatar', res.data.avatar || require('@/assets/images/back4.jpg'));
                            localStorage.setItem('signature', res.data.signature || '这个人很懒，什么都没有写~');
                            localStorage.setItem('points', res.data.points || 0);
                            localStorage.setItem('commentNumber', res.data.commentNumber || 0);
                            localStorage.setItem('email', res.data.email || '');
                            localStorage.setItem('registerRank', res.data.registerRank || '未知');
                            localStorage.setItem('postNumber', res.data.postNumber || 0);
                            localStorage.setItem('concernTotal', res.data.concernTotal || 0);
                            localStorage.setItem('fanTotal', res.data.fanTotal || 0);
                            localStorage.setItem('fansListVos', JSON.stringify(res.data.fansListVos || []));
                            localStorage.setItem('concernListVos', JSON.stringify(res.data.concernListVos || []));
                            localStorage.setItem('background', res.data.background || require('@/assets/images/back4.jpg'));
                            this.$message.success(res.msg);
                            this.$router.push(`/index`);
                        }).catch(err => {
                            console.log(err);

                        })
                    }

                ).catch(err => {
                });
            } else {
                console.log('验证失败:', diff);
                this.$message.error('验证失败，请重试');
                // 刷新旋转角度
                this.showCaptcha();
            }
        },

    }
};
</script>
<style lang="scss">
body.dark {
    .el-dialog__body {
        background-color: #222;
        color: #fff;
    }
}

.login {
    // margin: 20px;

    .login-container {
        background-color: #FFFFFF;
        width: 600px;
        height: 100%;
        padding: 30px;
        border-radius: 20px;
        margin: 30px auto;

        .el-dialog .el-dialog__header {
            display: none;
        }

        .login-row {
            margin-top: 50px;
            width: 100%;

            .login-btn {
                width: 100%;
            }

        }

        .el-button {
            color: #606266;
        }

        .el-button.is-plain:focus {
            background-color: #3C3C3C;
        }

        .register-link {
            text-decoration: none;
            color: #6F7170;
            text-align: center;
            width: 100%;
            display: inline-block;
            margin-bottom: 20px;

            &:hover {
                color: #282828;
            }
        }

        .captcha-img-box {
            position: relative;
            display: flex;
            justify-content: center;

            .window-normal {
                width: 200px;
                height: 200px;
                border-radius: 50%;
                overflow: hidden;

                .captcha-img-normal {
                    width: 200px;
                    height: 200px;
                }

            }

            .window {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) !important;
                width: 150px;
                height: 150px;
                position: absolute;
                border-radius: 50%;
                overflow: hidden;

                .captcha-img {
                    width: 100%;
                    height: 100%;
                }
            }

        }

        .top-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;

            .icon-bar {
                display: flex;
                gap: 20px;

                i {
                    cursor: pointer;
                    font-size: 20px;
                    color: #606266;

                    &:hover {
                        color: #409eff;
                    }
                }
            }
        }

        .slider-box {
            width: 80%;
            margin: 20px auto;
            margin-top: 20px;
        }


    }
}
</style>