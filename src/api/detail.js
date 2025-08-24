import request from '@/utils/request'
/**
 * 修改点赞状态
 * @param {*} data 
 * @returns 
 */
export function like(data) {
    return request({
        url: '/likes',
        method: 'post',
        data
    })
}
/**
 * 修改收藏状态
 * @param {*} userId
 * @returns 
 */
export function collect(userId) {
    return request({
        url: `/collection/${userId}`,
        method: 'post'
    })
}
