import request from '@/utils/request'
/**
 * 关注用户
 * @param {*} userId 
 * @returns 
 */
export function follow(useId) {
    return request({
        url: `/concern/${useId}`,
        method: 'put'
    })
}

/**
 * 设置用户背景
 * @param {*} params 
 * @returns 
 */
export function userBack(params) {
    return request({
        url: '/userCenter/updateUserBackground',
        method: 'put',
        params
    })
}

/**
 * 上传图片或文件
 * @param {*} data 
 * @returns 
 */
export function uploadImg(data) {
    return request({
        url: '/uploadfile',
        method: 'post',
        data,
    })
}
/**
 * 获取用户收藏
 * @param {*} params 
 * @returns 
 */
export function collection(params) {
    return request({
        url: '/userCenter/userCollection',
        method: 'get',
        params
    })
}
/**
 * 编辑用户信息
 * @param {*} data 
 * @returns 
 */
export function editUser(data) {
    return request({
        url: '/userCenter/updateUserDetail',
        method: 'put',
        data
    })
}
/**
 * 修改密码
 * @param {*} data 
 * @returns 
 */
export function changePassword(data) {
    return request({
        url: '/user/updatePassword',
        method: 'post',
        data
    })

}
/**
 * 修改邮箱
 * @param {*} data 
 * @returns 
 */
export function changeEmail(params) {
    return request({
        url: '/userCenter/updateEmail',
        method: 'put',
        params
    })
}
/**
 * 获取用户积分记录
 * @returns 
 */
export function points(params) {
    return request({
        url: '/point/list',
        method: 'get',
        params
    })
}

/**
 * 获取用户粉丝列表
 * @param {*} params 
 * @returns 
 */
export function fansList(params) {
    return request({
        url: '/concern/fansList',
        method: 'get',
        params
    })
}
/**
 * 获取用户粉丝列表
 * @param {*} params 
 * @returns 
 */
export function followList(params) {
    return request({
        url: '/concern/concernList',
        method: 'get',
        params
    })
}

/**
 * 获取用户消息列表
 * @param {*} params 
 * @returns 
 */
export function msgList(params) {
    return request({
        url: '/notification/list',
        method: 'get',
        params
    })
}

/**
 * 获取未读通知数量
 * @returns 
 */
export function msgHasRead() {
    return request({
        url: '/notification/unreadNotificationNum',
        method: 'get'
    })
}

/**
 * 全部标记为已读
 * @param {*} id 
 * @returns 
 */

export function readMsg() {
    return request({
        url: `/notification/readAll`,
        method: 'post',
    })
}

/**
 * 修改为已读
 * @returns 
 */
export function setRead(id) {
    return request({
        url: `/notification/${id}`,
        method: 'put'
    })
}

export function deleteMsg(data) {
    return request({
        url: `/notification`,
        method: 'delete',
        data
    })
}