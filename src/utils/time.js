export function time(createTime) {
    const now = new Date();
    const time = new Date(createTime);
    const diff = (now - time) / 1000; // 秒

    if (diff < 60) return '刚刚' || 0;
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前' || 0;
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前' || 0;
    if (diff < 604800) return Math.floor(diff / 86400) + '天前' || 0;
    if (diff < 2592000) return Math.floor(diff / 604800) + '周前' || 0;
    if (diff < 15552000) return Math.floor(diff / 2592000) + '月前' || 0;
    if (diff < 31536000) return '半年前' || 0;
    return Math.floor(diff / 31536000) + '年前' || 0;
}