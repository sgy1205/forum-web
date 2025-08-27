export function getDraft(key, item) {
    const draft = localStorage.getItem(key);
    if (draft) {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            if (item.hasOwnProperty(key)) {
                item[key] = data[key];
            }
        });
    }
}

export function saveDraft(key, item) {
    localStorage.setItem(key, JSON.stringify(item));
}

export function clearDraft(key) {
    localStorage.removeItem(key);
}

export function getContentLength(html) {
    // 装富文本
    const div = document.createElement('div');
    // 把富文本内容放到div里
    div.innerHTML = html || '';
    // 返回文本内容长度，去掉空格
    return div.innerText.replace(/\s/g, '').length;
}

export function addTag(list, val) {
    val = val.trim();
    if (val && !list.includes(val)) {
        list.push(val);
    }
}

export function removeTag(list, index) {
    list.splice(index, 1);
}

export function deleteLastTag(list, input) {
    if (!input && list.length) {
        list.pop();
    }
}

// 修改：添加推荐标签时保存的是tagsId
export function addRecommendTag(tagId, list) {
    if (!list.includes(tagId)) {
        list.push(tagId);
    }
}

export function sonPublish(ref, list, type, that, authorId) {
    ref.validate(valid => {
        if (valid) {
            list.createTime = new Date().toISOString();
            that.$emit('submit', type, list);
            clearDraft(type + 'Draft');
        } else {
            that.$message.error('请检查内容是否符合要求');
        }
    });
}

// 检查内容是否有修改
export function isContentChanged(draft, current) {
    return (
        draft.title !== current.title ||
        draft.content !== current.content ||
        JSON.stringify(draft.tagsList) !== JSON.stringify(current.tagsList) ||
        draft.node !== current.node
    );
}
