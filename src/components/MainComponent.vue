<template>
    <div>
        <div class="header"><h3> Редактируемая таблица </h3></div>

        <div class="table-wrapper">
            <div class="pre-table-info">
                <div class="selectedItems">
                    <p v-show="checkSelectedLength" class="title"> Выбраны линии №: </p>
                    <div v-if="checkSelectedLength">
                        <el-tag v-for="item in selectedItems" :key="item.id"
                                @close="tagClose(item)"
                                style="margin: 0 0.5em 0 0;"
                                effect="plain" size="mini" closable>
                            {{ item.id }}
                        </el-tag>
                    </div>
                </div>
                <div class="import-tools">
                    <el-button @click="exportJSON" :disabled="!selectedItems.length" size="mini" title="Экспортировать данные в JSON." plain>
                        <i class="el-icon-download" />
                    </el-button>
                </div>
            </div>
            <el-table :data="tableData"
                      @selection-change="handleSelection"
                      row-class-name="no-hover"
                      style="user-select: none; margin: 0; min-height: 500px;"
                      row-key="id"
                      width="fit-content"
                      max-height="500"
                      ref="table"
                      doLayout
                      border>
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="№" width="65" />
                <el-table-column prop="name" label="Наименование" width="300" align="center">
                    <template slot-scope="{ row }">
                        <div v-if="!row.editable"> {{ row.name }} </div>
                        <div v-else>
                            <el-input v-model="row.name" size="mini" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="Значение" width="300" align="center">
                    <template slot-scope="{ row }">
                        <div v-if="!row.editable"> {{ row.value }} </div>
                        <div v-else>
                            <el-input v-model="row.value" size="mini" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column width="130" :key="updateTools">
                    <template slot="header">
                        <el-button :disabled="blockEdit" type="primary" class="tool-icon" @click="addRow" title="Добавить" size="mini" circle>
                            <i class="el-icon-plus" />
                        </el-button>
                        <DeleteButton v-show="checkSelectedLength" title="Удалить все" @delete="handleDelete(selectedItems)" />
                    </template>
                    <template slot-scope="{ row }">
                        <div v-if="row.editable">
                            <el-button @click="handleEdit(row)" class="tool-icon" type="success" title="Сохранить" size="mini" circle>
                                <i class="el-icon-check" />
                            </el-button>
                            <el-button @click="cancelEdit(row)" class="tool-icon" title="Отменить" size="mini" circle>
                                <i class="el-icon-close" />
                            </el-button>
                        </div>
                        <div v-else>
                            <el-button :disabled="blockEdit" class="tool-icon" @click="handleEdit(row)" title="Редактировать" size="mini" circle>
                                <i class="el-icon-edit" />
                            </el-button>
                            <DeleteButton :disabled="checkSelectedLength" @delete="handleDelete(row)" />
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <hr class="hor-line" />

        <TextArea :keyUpd="exportUpd" :exported="exported" @send="sendJSON" />
    </div>
</template>

<script>
import Sortable from 'sortablejs';
import TableItem from './models/TableItem';

export default {
    name: 'MainComponent',

    data: () => ({
        tableData: [],
        selectedItems: [],
        prevLineState: null,
        blockEdit: false,
        updateTools: false,
        exported: null,
        exportUpd: false
    }),

    computed: {
        checkSelectedLength() {
            return !!this.selectedItems?.length;
        }
    },

    methods: {
        handleSelection(arr) {
            this.selectedItems = arr.sort((a, b) => a.id - b.id);
            this.updateTools = !this.updateTools;
        },

        tagClose(item) {
            this.handleSelection(this.selectedItems.filter(i => i.id !== item.id));
            this.$refs.table.toggleRowSelection(item);
            this.updateTools = !this.updateTools;
        },

        handleEdit(row) {
            if (!row.editable) this.prevLineState = { ...row }; //деструкт, чтобы не присваивать ссылку
            this.blockEdit = !row.editable;
            row.editable = !row.editable;

            if (row.new) {
                row.new = false;
                this.$message({
                    duration: 4000,
                    type: 'success',
                    showClose: true,
                    message: `Линия №: ${this.tableData.length} успешно добавлена.`
                });
            }

            this.updateTools = !this.updateTools;
        },

        cancelEdit(row) {
            if (!row.new) {
                row.name = this.prevLineState.name;
                row.value = this.prevLineState.value;
            } else this.tableData.pop();

            row.editable = false;
            this.blockEdit = false;
            this.updateTools = !this.updateTools;
        },

        handleDelete(data) {
            let message = '';
            let all = false;

            if (Array.isArray(data)) {
                if (this.$refs.table?.selection?.length == this.tableData.length) {
                    this.selectedItems = [];
                    this.tableData = [];
                    message = 'Все данные уcпешно удалены.';
                    all = true;
                } else {
                    data.forEach((i, $ind) => {
                        this.tableData = this.tableData.filter(j => j.id !== i.id)
                            .map((k, ind) => new TableItem({ ...k, id: ind + 1 }));
                        
                        message += $ind == (data.length - 1) ? i.id : i.id + ', ';
                    });
                }
            } else {
                this.tableData = this.tableData.filter(i => i.id !== data.id)
                    .map((k, ind) => new TableItem({ ...k, id: ind + 1 }));

                message = data.id;
            }

            this.$message({
                duration: 4000,
                type: 'error',
                showClose: true,
                message: !Array.isArray(data) ? `Линия № ${message} уcпешно удалена.`
                    : all ? message : `Линии №: ${message} уcпешно удалены.`
            });
        },

        addRow() {
            this.tableData.push(new TableItem({ id: this.tableData.length + 1, name: '', value: '', editable: true, new: true }));
            this.blockEdit = true;
        },

        rowDrop() {
            const tbody = document.querySelector('.el-table__body-wrapper tbody');
            const _this = this;
            Sortable.create(tbody, {
                onEnd({ newIndex, oldIndex }) {
                    const newRow = _this.tableData[oldIndex];
                    _this.tableData.splice(oldIndex, 1);
                    _this.tableData.splice(newIndex, 0, newRow);
                }
            })
        },

        sendJSON(json) {
            try {
                const data = JSON.parse(json);

                this.tableData = data.map((i, ind) => new TableItem({ ...i, id: ind + 1, editable: false, new: false }));

                this.$message({
                    message: 'JSON успешно импортирован.',
                    type: 'success',
                    showClose: true,
                    duration: 4000
                });
            } catch(err) {
                this.$message({
                    message: 'Неверная структура JSON.',
                    type: 'error',
                    showClose: true,
                    duration: 4000
                });
                throw new Error(err);
            }
        },

        exportJSON() {
            try {
                this.exported = JSON.stringify(this.selectedItems);
                this.exportUpd = !this.exportUpd;
            } catch(err) {
                this.$message({
                    message: 'Не удалось экспортировать JSON.',
                    type: 'error',
                    showClose: true,
                    duration: 4000
                });
                throw new Error(err);
            }
        }
    },

    created() {
        if (Array.isArray(this.tableData)) {
            for (let i = 1; i < 9; i++) {
                this.tableData.push(new TableItem({ id: i, name: `name${i}`, value: `val${i}`, editable: false, new: false }));
            }
        }
    },

    mounted() {
        this.rowDrop();
    },

    components: {
        DeleteButton: () => import('./DeleteButton.vue'),
        TextArea: () => import('./TextArea.vue')
    }
}
</script>
