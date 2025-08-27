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
 * @param {*} postId
 * @returns 
 */
export function collect(postId) {
    return request({
        url: `/collection/${postId}`,
        method: 'post'
    })
}
