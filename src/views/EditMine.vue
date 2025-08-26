<template>
    <div class="collection main">
        <HeadersBar />
        <div class="top-down">
            <div class="main-container tran">
                <div class="edit-menu tran">
                    <div class="menu-options tran cursor" v-for="(option, index) in menuOption" :key="index"
                        @click="changeOption(option)">
                        <div class="menu-item tran" :class="{ active: option.active }">
                            <i :class="option.icon"></i>
                            <div class="menu-name">{{ option.name }}</div>
                        </div>
                    </div>
                </div>

                <div class="edit-content tran">
                    <div class="content-title">
                        <div v-if="menuOption[0].active" class="title">
                            <i class="el-icon-user"></i>
                            个人资料
                        </div>
                        <div v-else>
                            <i class="el-icon-setting"></i>
                            账号设置
                        </div>
                        <div class="go-back cursor" style="cursor: default;" @click="$router.push({ path: `/personal/${userId}` })">
                            <i class="el-icon-back"></i>
                            返回个人主页
                        </div>
                    </div>
                    <el-divider></el-divider>
                    <el-form v-if="menuOption[0].active" class="user-form" ref="userFormRef" :model="userForm"
                        :rules="rules" label-position="left" label-width="80px">
                        <el-form-item label="头像" prop="avatar">
                            <div class="avatar-section">
                                <el-upload class="avatar-uploader" :show-file-list="false"
                                    :on-change="handleAvatarChange" action="''" :auto-upload="false" v-model="userForm.avatar">
                                    <img :src="getAvatar(userForm.avatar)" class="avatar tran" />
                                </el-upload>
                            </div>
                        </el-form-item>

                        <el-form-item label='昵称' prop="nickName">
                            <el-input v-model="userForm.nickName"></el-input>
                        </el-form-item>
                        <el-form-item label='个性签名' prop="signature">
                            <el-input type="textarea" v-model="userForm.signature"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="submit('userForm', '')">提交</el-button>
                        </el-form-item>
                    </el-form>
                    <div class="account-settings" v-else>
                        <div>
                            <div class="username-row row">
                                <div class="username-label label">用户名</div>
                                <div class="username-value value" :key="userForm.nickName">{{ userForm.nickName }}</div>

                            </div>
                            <el-divider></el-divider>
                        </div>
                        <div>
                            <div class="email-row row">
                                <div class="left">
                                    <div class="email-label label">邮箱</div>
                                    <div class="email-value value" :key="userForm.email">{{ userForm.email || '无' }}
                                    </div>
                                </div>
                                <div class="right">
                                    <el-button @click="edit('邮箱')" type="text">修改</el-button>
                                    <el-button @click="confirm" type="text">验证</el-button>
                                </div>

                            </div>
                            <el-divider></el-divider>
                        </div>
                        <div>
                            <div class="password-row row">
                                <div class="left">
                                    <div class="password-label label">密码</div>
                                    <div class="value">已设置</div>
                                </div>
                                <div class="right">
                                    <el-button @click="edit('密码')" type="text">修改</el-button>
                                </div>

                            </div>
                        </div>
                        <el-dialog :visible.sync="dialog.visible" width="400px" @close="resetForm('dialogForm')"
                            :close-on-click-modal=false>
                            <template #title>
                                {{ dialog.mode == '邮箱' ? '设置邮箱' : '设置密码' }}
                            </template>
                            <el-form :model="dialog.form" :rules="rules" ref="dialogFormRef" label-width="80px"
                                label-position="top" size="small">
                                <div v-if="dialog.mode === '邮箱'">
                                    <el-form-item prop="email">
                                        <el-input v-model="dialog.form.email" prefix-icon="el-icon-message"
                                            placeholder="请输入新的邮箱地址">
                                        </el-input>
                                    </el-form-item>
                                    <div style="text-align: end;margin-top: 30px;">
                                        <el-button type="info" plain @click="handleCancel">取消</el-button>
                                        <el-button type="info" plain
                                            @click="submit('dialog', dialog.mode)">提交</el-button>
                                    </div>
                                </div>
                                <div v-else>

                                    <div v-if="dialog.mode === '密码'">
                                        <el-form-item prop="password">
                                            <el-input type="password" v-model="dialog.form.password"
                                                prefix-icon="el-icon-mobile" placeholder="请输入原密码"></el-input>
                                        </el-form-item>
                                        <el-form-item prop="newPassword">
                                            <el-input type="password" v-model="dialog.form.newPassword"
                                                prefix-icon="el-icon-lock" placeholder="请输入新密码"></el-input>
                                        </el-form-item>
                                        <el-form-item prop="confirmPassword">
                                            <el-input type="password" v-model="dialog.form.confirmPassword"
                                                prefix-icon="el-icon-lock" placeholder="请再次输入密码"></el-input>
                                        </el-form-item>
                                    </div>
                                    <div style="text-align: end;margin-top: 30px;">
                                        <el-button type="info" @click="handleCancel">取消</el-button>
                                        <el-button type="info" @click="submit('dialog', dialog.mode)">提交</el-button>
                                    </div>
                                </div>
                            </el-form>
                        </el-dialog>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { editUser, uploadImg, changePassword, changeEmail } from '@/api/personal';
export default {
    name: 'Collection',
    components: {
        HeadersBar: () => import('@/components/HeaderBar.vue')
    },
    data() {
        const emailTest = /^[A-Za-z0-9_]+@[A-Za-z0-9]+\.[A-Za-z]{2,}$/;
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.dialog.form.newPassword) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        };
        const validateNewPassword = (rule, value, callback) => {
            if (value === this.dialog.form.password) {
                callback(new Error('新密码不能与原密码相同'));
            } else {
                callback();
            }
        };
        return {
            userId: '',
            originForm: {},
            userForm: {
                avatar: '',
                nickName: '',
                signature: '',
                email: '',
                password: ''
            },
            // 头像上传的文件列表
            fileList: [],
            dialog: {
                // 记得改回来
                visible: false,
                mode: '邮箱', // '邮箱' or '密码'
                form: {
                    password: '',
                    newPassword: '',
                    confirmPassword: '',
                    email: ''
                }
            },
            rules: {
                username: [
                    { max: 16, message: '用户名不能超过16个字符', trigger: 'change' }
                ],
                usersigature: [
                    { max: 50, message: '签名不能超过50个字符', trigger: 'change' }
                ],
                userhref: [
                    { type: 'url', message: '请输入有效的链接地址', trigger: 'change' }
                ],
                email: [
                    { required: true, message: '请输入新邮箱', trigger: 'change' },
                    { pattern: emailTest, message: '邮箱格式不正确', trigger: 'change' },
                    { max: 50, message: '邮箱不能超过50个字符', trigger: 'change' },
                    // { validator: validateEmail, trigger: 'change' }
                ],
                password: [
                    { required: true, message: '请输入原密码', trigger: 'change' },
                    { max: 20, message: '密码不能超过20个字符', trigger: 'change' },
                    // { validator: validatePassWord, trigger: 'change' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'change' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'change' },
                    { max: 20, message: '密码不能超过20个字符', trigger: 'change' },
                    { validator: validateNewPassword, trigger: 'change' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: validateConfirmPassword, trigger: 'change' }
                ]

            },
            menuOption: [
                { name: "个人资料", active: false, icon: 'el-icon-user' },
                { name: "账号设置", active: false, icon: 'el-icon-setting' },

            ],

        };
    },
    created() {
        // 记得改回来
        this.menuOption[0].active = true;
        this.userId = this.$store.state.user.id || localStorage.getItem('userId') || '';
        this.userForm = {
            avatar: this.$store.state.user.user.avatar || localStorage.getItem('avatar') || '',
            nickName: this.$store.state.user.user.name || localStorage.getItem('nickName') || '',
            signature: this.$store.state.user.user.signature || localStorage.getItem('signature') || '',
            email: this.$store.state.user.user.email || localStorage.getItem('email') || '',
            password: this.$store.state.user.user.password || localStorage.getItem('password') || ''
        };
        // 保存一份初始数据
        this.originForm = JSON.parse(JSON.stringify(this.userForm));
    },
    methods: {
        getAvatar(avatar) {
            if (!avatar) {
                return require('@/assets/images/默认头像.png');
            }
            if (avatar.startsWith('http') || avatar.startsWith('https')) {
                return avatar;
            }
            return avatar;
        },
        // 重置
        resetForm(val) {
            this.$refs[`${val}Ref`].resetFields()
        },
        changeOption(option) {
            this.menuOption.forEach(item => {
                item.active = false;
            });
            option.active = true;

        },
        // 处理头像上传
        handleAvatarChange(file) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.name);
            if (!isImage) {
                this.$message.error('请上传JPG、PNG、GIF或BMP格式的图片');
                return;
            }
            const reader = new FileReader();
            reader.onload = (item) => {
                this.userForm.avatar = item.target.result;
            };
            reader.readAsDataURL(file.raw);
            this.fileList = [file];
        },
        submit(who, mode) {
            // 个人资料
            if (who == 'userForm') {
                if (JSON.stringify(this.userForm) === JSON.stringify(this.originForm)) {
                    this.$message.warning('你还没有修改');
                    return;
                }
                this.$refs.userFormRef.validate(valid => {
                    if (valid) {
                        // 提交
                        // 有传头像
                        if (this.fileList.length > 0) {
                            const file = this.fileList[0].raw;
                            console.log('上传的文件:', file);
                            const formData = new FormData();
                            formData.append('file', file);
                            uploadImg(formData).then(res => {
                                // 覆盖掉预览的链接
                                this.userForm.avatar = res.data;
                                editUser(this.userForm).then(res => {
                                    // 更新用户信息
                                    this.$store.commit('setUserInfo', {
                                        avatar: this.userForm.avatar,
                                        nickName: this.userForm.nickName,
                                        signature: this.userForm.signature,
                                        email: this.userForm.email,
                                    });
                                    localStorage.setItem('avatar', this.userForm.avatar);
                                    localStorage.setItem('nickName', this.userForm.nickName);
                                    localStorage.setItem('signature', this.userForm.signature);
                                    localStorage.setItem('email', this.userForm.email);
                                    this.$message.success('用户信息已更新');
                                    // 重置参照
                                    this.originForm = JSON.parse(JSON.stringify(this.userForm));
                                    return
                                }).catch(error => {
                                });
                                return
                            }).catch(error => {
                            });
                        } else {
                            // 没有传头像
                            editUser(this.userForm).then(res => {

                                this.$store.commit('setUserInfo', {
                                    avatar: this.userForm.avatar,
                                    nickName: this.userForm.nickName,
                                    signature: this.userForm.signature,
                                    email: this.userForm.email,
                                });
                                localStorage.setItem('avatar', this.userForm.avatar);
                                localStorage.setItem('nickName', this.userForm.nickName);
                                localStorage.setItem('signature', this.userForm.signature);
                                localStorage.setItem('email', this.userForm.email);
                                this.$message.success('用户信息已更新');
                                this.originForm = JSON.parse(JSON.stringify(this.userForm));
                                return

                            }).catch(error => {
                            });
                        }

                    }
                });

            } else {
                // 账号设置
                this.$refs.dialogFormRef.validate(valid => {
                    if (valid) {
                        // 修改邮箱
                        if (mode === '邮箱') {
                            if (this.dialog.form.email === this.userForm.email) {
                                this.$message.warning('新邮箱不能与旧邮箱一致');
                                return;
                            }
                            changeEmail({ email: this.dialog.form.email }).then(res => {
                                this.$message.success('邮箱修改成功');

                                this.$store.commit('setUserInfo', { email: this.dialog.form.email });
                                localStorage.setItem('email', this.dialog.form.email);
                                this.userForm.email = this.$store.state.user.user.email || localStorage.getItem('email') || '';
                                this.dialog.visible = false;

                            }).catch(error => {
                            });
                            return
                        } else {
                            // 修改密码

                            if (valid) {
                                changePassword({ oldPassword: this.dialog.form.password, newPassword: this.dialog.form.newPassword }).then(res => {
                                    this.$message.success('密码修改成功');
                                    this.dialog.visible = false;
                                }).catch(error => {
                                });
                                return
                            } else {
                                this.$message.error('请检查输入的密码！');
                            }
                        }

                    }
                });
            }

        },
        confirm() {
            console.log("验证邮箱");

        },
        handleCancel() {
            this.dialog.visible = false;
            this.resetForm('dialogForm');
            this.dialog.form = {
                email: this.$store.state.user.user.email || localStorage.getItem('email') || '',
                password: '',
                newPassword: '',
                confirmPassword: ''
            };
        },
        edit(type) {
            this.dialog.mode = type;
            this.dialog.visible = true;
            this.dialog.form = {
                email: this.$store.state.user.user.email || localStorage.getItem('email') || '',
                password: '',
                newPassword: '',
                confirmPassword: ''
            };
        },
    },
};
</script>

<style lang="scss">

.main-container {
    margin: auto;
    width: 70%;
    height: 100%;
    background-color: #F3F7FE;
    display: flex;
    gap: 20px;
    margin-top: 10px;


    .edit-menu {
        width: 200px;
        background-color: #FFFFFF;
        padding: 10px;
        border-radius: 12px;

        .menu-item {
            display: flex;
            padding: 10px;
            align-items: center;
            gap: 10px;

            &.active {
                background-color: #E8F3FF;
                color: #5586E0;
            }
        }
    }

    .edit-content {
        background-color: #FFFFFF;
        flex: 1;
        border-radius: 12px;
        padding: 10px;

        .content-title {
            padding: 10px 10px 20px 10px !important;
            margin: 0 !important;
            display: flex;
            justify-content: space-between;
        }

        .el-icon-user,
        .el-icon-back {
            font-weight: bold;
        }

        .user-form {
            padding: 20px 100px;

            .el-form-item__label {
                color: black;
                font-weight: bold;
                font-size: 16px;
                text-align: end;
            }

            .avatar-uploader {
                .avatar {
                    width: 84px;
                    height: 84px;
                    border-radius: 50%;
                    border: 3px solid #e6eaff;
                    object-fit: cover;
                    margin-bottom: 6px;
                    box-shadow: 0 2px 8px #b9c6e633;
                    transition: box-shadow 0.3s;
                    background: #f7f7f7;
                }


            }
        }

        .account-settings {
            display: flex;
            flex-direction: column;

            .row {
                display: flex;
                // justify-content: space-between;
                height: 40px;
                line-height: 40px;
                padding: 10px 0;



                .left {
                    display: flex;

                }

                .label {
                    width: 48px;
                    margin-right: 60px;
                }

                .value {
                    color: gray;
                }

                .right {
                    flex: 1;
                    text-align: end;
                }
            }
        }


    }
}
</style>