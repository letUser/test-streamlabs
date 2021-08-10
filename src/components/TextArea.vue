<template>
    <div class="textarea">
        <div class="text">
            <p class="title"> Импорт JSON: </p>
            <el-input type="textarea" v-model="textarea" placeholder="Введите данные" :autosize="{ minRows: 6, maxRows: 12}" />
        </div>
        <div class="tools">
            <el-button :disabled="!textarea" @click="$emit('send',textarea)" type="primary" title="Сохранить">
                Отправить
            </el-button>
            <el-button @click="textarea = null" title="Отменить" plain>
                Отменить
            </el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TextArea',

    props: {
        keyUpd: {
            type: Boolean,
            default: false
        },
        exported: {
            type: String,
            default: null
        }
    },

    data: () => ({
        textarea: null
    }),

    watch: {
        keyUpd() {
            this.textarea = this.exported;
        }
    }
}
</script>
