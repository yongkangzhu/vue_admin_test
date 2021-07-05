<template>
  <div class="app-container">
    <el-table
      :data="
        tableData1.filter(
          (data) =>
            !search1 || data.plant.toLowerCase().includes(search1.toLowerCase())
        )
      "
      border ref="plantTable"
      highlight-current-row
      @current-change="plant_row_select"
      style="width: 100%"  current-row-key
    >
      <el-table-column type='index'> </el-table-column>
      <el-table-column label="厂别" prop="plant" width="100"> </el-table-column>
      <el-table-column label="系统" prop="system" width="100"></el-table-column>
      <el-table-column label="DB连接字符串" prop="cstr"> </el-table-column>
      <el-table-column align="right" width="300">
        <template slot="header">
          <div class="search">
            <el-button size="mini" @click="openPlantForm()">Add</el-button>
            <el-input v-model="search1" size="mini" placeholder="输入关键字搜索"/>
          </div>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="plantEdit(scope.$index, scope.row)">Edit</el-button>
          <el-button size="mini"  type="danger" @click.stop="plantDelete(scope.$index, scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" class="space" justify="space-between">
      <el-col :span="10">
        <div>
          <el-table
            :data="
              tableData1[form1RowIndex].cmds.filter(
                (data) =>
                  !search2 ||
                  data.cmd.toLowerCase().includes(search2.toLowerCase())
              )
            "
            border 
            highlight-current-row
            @current-change="cmd_row_select"
            style="width: 100%" 
          >
            <el-table-column label="指令" prop="cmd"> </el-table-column>
            <el-table-column label="存储过程" prop="procedure">
            </el-table-column>
            <el-table-column align="right" width="200">
              <template slot="header">
                <div class="search">
                  <el-button size="mini" @click="openCmdForm" >Add</el-button>
                  <el-input v-model="search1" size="mini" placeholder="输入关键字搜索" />
                </div>
              </template>
              <template slot-scope="scope">
                <el-button size="mini" @click="cmdEdit(scope.$index, scope.row)" >Edit</el-button>
                <el-button size="mini" type="danger" @click="cmdDelete(scope.$index, scope.row)" >Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="13">
        <div>
          <el-table
            :data="
               tableData1[form1RowIndex].cmds[form2RowIndex].args.filter(
                (data) =>
                  !search3 ||
                  data.name.toLowerCase().includes(search3.toLowerCase())
              )
            "
            border
            style="width: 100%"
          >
            <el-table-column label="参数名" prop="name"> </el-table-column>
            <el-table-column label="参数类型" prop="type"> </el-table-column>
            <el-table-column label="参数方向" prop="direction">
            </el-table-column>
            <el-table-column label="参数值" prop="value"> </el-table-column>
            <el-table-column align="right" width="200">
              <template slot="header" >
                <el-input
                  v-model="search3"
                  size="mini"
                  placeholder="输入关键字搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="handleEdit(scope.$index, scope.row)"
                  >Edit</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-dialog title="厂区配置" :visible.sync="form1Visible">
      <el-form :model="form1">
        <el-form-item label="厂区名称" :label-width="formLabelWidth">
          <el-input v-model="form1.plant" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="系统类型" :label-width="formLabelWidth">
          <el-select v-model="form1.system" placeholder="请选择系统类型">
            <el-option label="MES" value="MES"></el-option>
            <el-option label="ODS" value="ODS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接字符串" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="2" v-model="form1.cstr"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="form1Visible = false">取 消</el-button>
        <el-button type="primary" @click="addOrModifyPlant()"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <el-dialog title="指令配置" :visible.sync="form2Visible">
      <el-form :model="form2">
        <el-form-item label="指令名称" :label-width="formLabelWidth">
          <el-input v-model="form2.cmd" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Procedure名称" :label-width="formLabelWidth">
          <el-select v-model="form2.procedure" placeholder="请选择Procedure">
            <el-option v-for="item in procedureOptions" :key ='item'  :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="form2Visible = false">取 消</el-button>
        <el-button type="primary" @click="addOrModifyCmd()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList } from '@/api/cmd';

import request  from '@/utils/request';

export default {
  data() {
    return {
      tableData1: [
        {
          plant: "429A",
          system: "MES",
          cstr:"dsdadasdsdadshdjdhfhsffdhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
          cmds: [
            {
              cmd: '2',
              procedure: "sajet.sj_ckrt",
              args: [
                {
                  name: "tsajet1",
                  type: "varchar2",
                  direction: "input",
                  value: "s1",
                },
                {
                  name: "tres",
                  type: "varchar2",
                  direction: "output",
                  value: "",
                },
              ],
            },
          ],
        },
        {
          plant: "4290",
          system: "MES",
          cstr:
            "dsdadasdsdadshdjdhfhsffdhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
          cmds: [
            {
              cmd: '2',
              procedure: "sajet.sj_ckrt1",
              args: [
                {
                  name: "tsajet2",
                  type: "varchar2",
                  direction: "input",
                  value: "s1",
                },
                {
                  name: "tres",
                  type: "varchar2",
                  direction: "output",
                  value: "",
                },
              ],
            },
          ],
        },
      ],
      tableData2: [], //cmd list
      tableData3: [], //arg list
      search1: "",
      search2: "",
      search3: "",

      form1: {
        plant: "",
        system: "",
        cstr: "",
      },

      form2: {
        cmd: "",
        procedure: "",
      },

      form3: {
        name: "",
        type: "",
        direction: "",
        value: "",
      },
      form1RowIndex:0,
      form2RowIndex:0,
      form3RowIndex:0,

      form1Action:'Add',
      form2Action:'Add',
      form3Action:'Add',

      form1Visible: false,
      form2Visible: false,
      form3Visible: false,
      formLabelWidth: "120px",

      procedureOptions:['sajet.sds1','sajet.sds2','sajet.sds3','sajet.sds4','sajet.sds5']
    };
  },
  methods: {
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
    plant_row_select(row) {
    
      if(row){
        this.form1RowIndex = this.tableData1.findIndex(x=> x.plant==row.plant && x.system == row.system);      
        //this.tableData2 = row.cmds;
        console.log(row);
        console.log(this.form1RowIndex);
      }else{
        this.form1RowIndex = 0;
        console.log(row);
      }     
    },
    cmd_row_select(row) {
      //console.log(row.args);
      console.log('cmd_row_select');
      
      if(row){
        this.form2RowIndex = this.tableData1[this.form1RowIndex].cmds.findIndex(x=> x.cmd==row.cmd);
        //this.tableData3 = row.args;
        console.log(this.form2RowIndex);
      }else{
        this.form2RowIndex = 0;
      }   
      
    },
    openPlantForm(){
      this.form1.plant = '';
      this.form1.system = '';
      this.form1.cstr = '';
      this.form1Action = 'Add';
      this.form1Visible = true;
    },
    addOrModifyPlant() {
 
      //如果 厂别加系统 存在 修改,否则就新增
    
      if(this.form1Action == 'Add'){
        const q = this.tableData1.filter(x=>(x.plant+x.system).toLowerCase() == (this.form1.plant+this.form1.system).toLowerCase());
        if(q.length > 0){
          let msg = `${this.form1.plant}_${this.form1.system} 配置已存在!`;
          console.log(msg);
          this.$message.error(msg);
          return;
        }
        this.tableData1.push({
          plant:this.form1.plant,
          system:this.form1.system,
          cstr:this.form1.cstr,
          cmds:[
            {
              cmd:'',
              procedure:'',
              args:[]
            }        
          ]
        });
        this.$message.success('新增成功');
      }else{
        this.tableData1[this.form1RowIndex].plant = this.form1.plant;
        this.tableData1[this.form1RowIndex].system = this.form1.system;
        this.tableData1[this.form1RowIndex].cstr = this.form1.cstr;
        this.$message.success('修改成功');
      }
           
      this.form1Visible = false;
      
    },
    plantEdit(index,row){
      this.form1.plant = row.plant;
      this.form1.system = row.system;
      this.form1.cstr = row.cstr;
      this.form1RowIndex = index;
      this.form1Visible = true;
      this.form1Action = 'Edit';
    },
    plantDelete(index,row){

      if(this.tableData1.length ==1){
        return;
      }
      this.form1RowIndex = 0;
      this.tableData1.splice(index,1);
      console.log(this.form1RowIndex);
      console.log(this.tableData1);
      
    },
    openCmdForm(){
      this.form2.cmd = '';
      this.form2.procedure = '';
      this.form2Action = 'Add';
      this.form2Visible = true;
    },
    addOrModifyCmd() {
 
      //如果 厂别加系统 存在 修改,否则就新增
    
      if(this.form2Action == 'Add'){

        if(this.tableData1[this.form1RowIndex].cmds.length > 0){
          const q = this.tableData1[this.form1RowIndex].cmds.filter(x=>x.cmd.toLowerCase() == this.form2.cmd.toLowerCase());
          if(q.length > 0){
            let msg = `${this.form2.cmd} 配置已存在!`;
            this.$message.error(msg);
            return;
          }
        }
        // 请求后台获取procedure参数
        let param ={
          cstr: this.tableData1[this.form1RowIndex].cstr,
          procedure:this.form2.procedure
        }     
        console.log(param);
        getList().then(res=>console.log(res.data));
        
        this.tableData1[this.form1RowIndex].cmds.push({
          cmd:this.form2.cmd,
          procedure:this.form2.procedure,
          args:[]
        });
        this.$message.success('新增成功');
      }else{
        this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].cmd = this.form2.cmd;
        this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedure = this.form2.procedure;
        //若有修改到procedure名称,那就重新获取参数 
        if(this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedure != this.form2.procedure){

        } 
        this.$message.success('修改成功');
      }
           
      this.form2Visible = false;
      
      
    },
    cmdEdit(index,row){
      this.form2.cmd = row.cmd;
      this.form2.procedure = row.procedure;
      this.form2RowIndex = index;
      this.form2Visible = true;
      this.form2Action = 'Edit';
    },
    cmdDelete(index,row){
      //console.log(this.tableData1[this.form1RowIndex].cmds);
      
      if(this.tableData1[this.form1RowIndex].cmds.length ==1){
        return;
      }
      this.tableData1[this.form1RowIndex].cmds.splice(index,1);

    },

  },
  mounted(){
    // this.$nextTick(()=>{
    //   this.$refs.PlantTable.setCurrentRow(this.tableData1[0]);
    // });

    this.$refs.plantTable.setCurrentRow(this.tableData1[0]);
    request({
      url: 'http://localhost:5000/user',
      method: 'get'
    }).then(res=>console.log(res))
    .catch(err=>console.log(err))
  }
};
</script>

<style lang='scss' scoped>
.space {
  margin-top: 10px;
}

.search {
  display: flex;
}
</style>