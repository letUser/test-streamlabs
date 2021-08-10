<template>
    <el-popconfirm title="Вы подтверждаете удаление?"
                   confirm-button-text='Дa'
                   confirm-button-type="danger"
                   cancel-button-text='Нет'
                   icon="el-icon-info"
                   icon-color="red"
                   @confirm="$emit('delete')">
        <el-button slot="reference" type="danger" class="tool-icon" :title="title" size="mini" :disabled="disabled" circle>
            <i class="el-icon-delete" />
        </el-button>
    </el-popconfirm>
</template>

<script>
export default {
    name: 'DeleteButton',

    props: {
        title: {
            type: String,
            default: 'Удалить'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    }
}
</script>
