<script setup>
const props = defineProps({
  data: Array,
  columns: Array,
  filterKey: String,
  checkedIds: Array,
  rowdata: Object,
  multiSelect: Boolean,
  tableSize: String
})
//console.log('multi:',multiSelect);

//const checkedIds = ref([]);
const emit = defineEmits(['update:rowdata','selected:checkedIds']);
const sortKey = ref('')
const sortOrders = ref(
  props.columns.reduce((o, key) => ((o[key] = 1), o), {})
)
const checkedIds = ref([]);

console.log('tableSize:',props.tableSize);
const myTableSize=props.tableSize;

function sendData(value){
  emit('update:rowdata',value);
}

function selectData(checkedIds){
  //console.log('desde selectData:',e.target.checked);
    console.log('datos desde selectData():',checkedIds);
    emit('selected:checkedIds',checkedIds);
}

function selectAll(e){
  console.log('desde selectall:',e.target.checked);
  if(e.target.checked){
    //console.log('seleccionamos todos los ids');
    //console.log('data:',filteredData.value);
    filteredData.value.forEach((item,index)=>{
      //console.log(item.id,index);
      if(!checkedIds.value.includes(item.id)){
        checkedIds.value.push(item.id);
      }
    });
  }else{
    //console.log('deseleccionamos todos los ids');
    filteredData.value.forEach((item,index)=>{
      //console.log(item.id,index);
      checkedIds.value.pop(item.id);
    });
  }
}

const filteredData = computed(() => {
  let { data, filterKey, multiSelect } = props
  if (filterKey) {
    filterKey = filterKey.toLowerCase()
    data = data.filter((row) => {
      return Object.keys(row).some((key) => {
        return String(row[key]).toLowerCase().indexOf(filterKey) > -1
      })
    })
  }

  if(!multiSelect){
    console.log('multiSelect:',multiSelect);
  }else{
    console.log('multiSelect:',multiSelect);
  }
  checkedIds.value = props.checkedIds;


  const key = sortKey.value
  if (key) {
    const order = sortOrders.value[key]
    data = data.slice().sort((a, b) => {
      a = a[key]
      b = b[key]
      return (a === b ? 0 : a > b ? 1 : -1) * order
    })
  }
  return data
})

const classEstado = computed(() => ({
        'badge-success': filteredData.value.estado==='A', 
        'badge-warning': filteredData.value.estado==='R',
        'badge-error': filteredData.value.estado==='C'
    }))

function sortBy(key) {
  sortKey.value = key
  sortOrders.value[key] *= -1
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
<div class="overflow-y-auto overflow-x-auto">
    <table v-if="filteredData.length" class="table table-zebra" :class="tableSize">
    <thead>
      <tr>
      <!--<th></th>-->
        <th v-if="multiSelect">
          <label>
            <input type="checkbox" name='allSelected' class="checkbox" @change="selectAll($event)"/>
          </label>
        </th>
        <th v-for="key in columns"
          @click="sortBy(key)"
          >
          {{ capitalize(key) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in filteredData">
        <th v-if="multiSelect">
          <label>
            <input type="checkbox" class="checkbox" :id="entry.id" :value="entry.id" v-model="checkedIds" @change="selectData(checkedIds)"/>
          </label>
        </th>
        <!--<td><div class="badge badge-xs"></div></td>-->
        <td v-for="key in columns" @click="sendData(entry)">
          {{entry[key]}}
        </td>
      </tr>
    </tbody>
  </table>
  <p v-else>Ningún resultado.</p>
  <div>Filas: {{ filteredData.length }}</div>
</div>
</template>

<style>
th {
  cursor: pointer;
  user-select: none;
}

/*table {
  border: 2px solid #42b983;
  border-radius: 3px;
  background-color: #fff;
}
th {
  background-color: #42b983;
  color: rgba(255, 255, 255, 0.66);
  cursor: pointer;
  user-select: none;
}

td {
  background-color: #f9f9f9;
}

th,
td {
  min-width: 120px;
  padding: 10px 20px;
}

th.active {
  color: #fff;
}


th.active .arrow {
  opacity: 1;
}

.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
  opacity: 0.66;
}

.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #fff;
}

.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #fff;
}
*/
</style>