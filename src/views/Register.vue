<template>
    <div class="register main tran">
        <HeaderBar />
        <div class="register-container tran">
            <h2>注册</h2>
            <el-form :model="registerForm" ref="registerFormRef" class="register-form tran" :rules="registerRules">
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="registerForm.userName" placeholder="请输入用户名" maxlength="20"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱" maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="registerForm.password" placeholder="请输入密码"
                        maxlength="20"></el-input>
                    <div style="font-size: 12px;">密码长度不小于六位</div>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码"
                        maxlength="20"></el-input>
                </el-form-item>
                <el-form-item class="register-row tran">
                    <el-button @click="registerBtn" plain class="tran register-btn">注册</el-button>
                </el-form-item>

                <div class="go-register">
                    <router-link to="/login" class="register-link tran">已有账号？点击这里去登录&gt;&gt;</router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script>

export default {
    name: 'register',
    components: {
        HeaderBar: () => import('@/components/HeaderBar.vue')
    },
    data() {
        // 对邮箱以及确认密码验证
        const emailTest = /^[A-Za-z0-9_]+@[A-Za-z0-9]+\.[A-Za-z]{2,}$/;
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        };
        return {
            debounce: false,
            registerForm: {
                userName: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
            registerRules: {
                userName: [
                    { required: true, message: '请输入用户名', trigger: 'change' },
                    { max: 16, message: '用户名不能超过16个字符', trigger: 'change' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'change' },
                    { pattern: emailTest, message: '邮箱格式不正确', trigger: 'change' },
                    { max: 50, message: '邮箱不能超过50个字符', trigger: 'change' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'change' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'change' },
                    { max: 20, message: '密码不能超过20个字符', trigger: 'change' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'change' },
                    { validator: validateConfirmPassword, trigger: 'change' }
                ]
            },
        };
    },
    methods: {
        registerBtn() {
            if (this.debounce) return;
            this.debounce = true;
            this.$refs.registerFormRef.validate(valid => {
                if (!valid) {
                    this.$message.error('请检查输入的内容');
                    this.debounce = false;
                    return;
                }

                this.$axios({
                    method: 'post',
                    url: '/register',
                    data: {
                        userName: this.registerForm.userName,
                        email: this.registerForm.email,
                        password: this.registerForm.password
                    }
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('注册成功');
                        if (this.$route.path !== '/login') {
                            this.$router.push('/login');
                        }
                    }
                    this.debounce = false;
                }).catch(err => {
                    this.debounce = false;
                });
            });
        }
    }
};
</script>
<style lang="scss">
body.dark .register-container {
    background-color: #282828;
    color: #ffffff !important;
}

body.dark .el-form-item__label {
    transition: 0.3s ease;
    color: #ffffff !important;
}

body.dark .el-button {
    background-color: #3c3c3c;
    border: 1px solid #4c4c4c;
    color: #ffffff !important;

    &:hover {
        background-color: darken(#3c3c3c, 5%);
    }
}

.register {
    // padding: 20px;

    .register-container {
        background-color: #FFFFFF;
        width: 600px;
        height: 100%;
        padding: 30px;
        border-radius: 20px;
        margin: 30px auto;

        .register-row {
            margin-top: 50px;
            width: 100%;
        }

        .register-btn {
            width: 100%;
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
    }
}
</style>