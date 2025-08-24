import request from '@/utils/request'
/**
 * 获取用户详情
 * @param {*} userId 
 * @returns 
 */
export function curUser(userId) {
    return request({
        url: `/userCenter/userDetail/${userId}`,
        method: 'get'
    })
}