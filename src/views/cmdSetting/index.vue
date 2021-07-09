<template>
  <div class="app-container">
    <el-table
      :data="
        tableData1.filter(
          (data) =>
            !search1 || data.plant.toLowerCase().includes(search1.toLowerCase())
        )
      "
      border ref="plantTable" height="350" 
      highlight-current-row :header-cell-style="headerClass"  
      @current-change="plant_row_select"
      style="width: 100%;border-radius: 10px;" class="card-shadow" 
    >
      <el-table-column type='index'> </el-table-column>
      <el-table-column label="厂别" prop="plant" width="100"> </el-table-column>
      <el-table-column label="系统" prop="system" width="100"></el-table-column>
      <el-table-column label="DB连接字符串" prop="connStr"> </el-table-column>
      <el-table-column align="right" width="300">
        <template slot="header" slot-scope="scope">
          <div class="search">
            <el-button size="mini" @click="openPlantForm()">Add</el-button>
            <el-input v-model="search1" size="mini" placeholder="输入厂别搜索"/>
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
            border height="400" 
            highlight-current-row :header-cell-style="headerClass"  
            @current-change="cmd_row_select"
            style="width: 100%;border-radius: 10px;" class="card-shadow" 
          >
            <el-table-column label="指令" prop="cmd"> </el-table-column>
            <el-table-column label="存储过程" prop="procedureName">
            </el-table-column>
            <el-table-column align="right" width="200">
              <template slot="header" slot-scope="scope">
                <div class="search">
                  <el-button size="mini" @click="openCmdForm" >Add</el-button>
                  <el-input v-model="search2" size="mini" placeholder="输入指令搜索" />
                </div>
              </template>
              <template slot-scope="scope">
                <el-button size="mini" @click="cmdEdit(scope.$index, scope.row)" >Edit</el-button>
                <el-button size="mini" type="danger" @click.stop="cmdDelete(scope.$index, scope.row)" >Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="13">
        <div>
          <el-table
            :data="
               tableData1[form1RowIndex].cmds[form2RowIndex].procedureArgs.filter(
                (data) =>
                  !search3 ||
                  data.procedureArgsName.toLowerCase().includes(search3.toLowerCase())
              )
            "
            border height="400" 
            highlight-current-row :header-cell-style="headerClass"  
            style="width: 100%;border-radius: 10px;" class="card-shadow" 
          >
            <el-table-column label="参数名" prop="procedureArgsName"> </el-table-column>
            <el-table-column label="参数别名" prop="jsonKeyName"> </el-table-column>
            <el-table-column label="参数方向" prop="directionDisplay"></el-table-column>
            <el-table-column label="参数长度" prop="size"> </el-table-column>
            <el-table-column label="Oracle参数类型" prop="dbTypeDisplay"> </el-table-column>
            <el-table-column label="Sqlserver参数类型" prop="msTypeDisplay"> </el-table-column>
                    
            <el-table-column align="right" width="200">
              <template slot="header" slot-scope="scope" >
                <el-input
                  v-model="search3"
                  size="mini"
                  placeholder="输入参数名搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="ArgEdit(scope.$index, scope.row)"
                  >Edit</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row style="display:flex;margin-top:20px;border-radius: 10px;">
      <el-button v-show="commit_done" type="success" @click="submit" style="flex:1">保存</el-button>
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
          <el-input type="textarea" :rows="2" v-model="form1.connStr"></el-input>
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
        <el-form-item label="储存过程名称" :label-width="formLabelWidth">
          <!-- <el-select v-model="form2.procedureName" placeholder="请选择储存过程">
            <el-option v-for="item in procedureNameOptions" :key ='item'  :label="item" :value="item"></el-option>
          </el-select> -->
          <el-select
            v-model="form2.procedureName"
            filterable
            remote
            reserve-keyword
            placeholder="请选择储存过程"
            :remote-method="getProcs"
            :loading="loading">
            <el-option
              v-for="item in procedureOptions"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="form2Visible = false">取 消</el-button>
        <el-button type="primary" @click="addOrModifyCmd()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="参数配置" :visible.sync="form3Visible">
      <el-form :model="form3">
        <el-form-item label="参数名" :label-width="formLabelWidth">
          <el-input v-model="form3.procedureArgsName" readonly autocomplete="off"></el-input>
        </el-form-item>
         <el-form-item label="参数别名" :label-width="formLabelWidth">
          <el-input v-model="form3.jsonKeyName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="参数大小" :label-width="formLabelWidth">
          <el-input v-model="form3.size" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="form3Visible = false">取 消</el-button>
        <el-button type="primary" @click="ModifyArg()">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>

import request  from '@/utils/request1';

export default {
  data() {
    return {
      tableData1: [
        {
          plant: "429A",
          system: "MES",
          connStr:
            "dsdadasdsdadshdjdhfhsffdhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
          cmds: [
            {
              cmd: '2',
              addRowData:false,
              procedureName: "sajet.sj_ckrt1",
              procedureArgs: [
                {
                  procedureArgsName: "tsajet1",
                  jsonKeyName: "tsajet1",
                  direction: 1,
                  directionDisplay:"",
                  size: 100,
                  dbType:126,
                  dbTypeDisplay:"",
                  msType: 0,
                  msTypeDisplay:""               
                },
                {
                  procedureArgsName: "tsajet2",
                  jsonKeyName: "tsajet2",
                  direction: 2,
                  directionDisplay:"",
                  dbType:126,
                  dbTypeDisplay:"",
                  msType: 0,
                  msTypeDisplay:""       
                },
              ],
            },
          ],
        },
        {
          plant: "4290",
          system: "MES",
          connStr:
            "dsdadasdsdadshdjdhfhsffdhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
          cmds: [
            {
              cmd: '2',
              addRowData:false,
              procedureName: "sajet.sj_ckrt1",
              procedureArgs: [
                {
                  procedureArgsName: "tsajet1",
                  jsonKeyName: "tsajet1",
                  direction: 1,
                  directionDisplay:"",
                  size: 100,
                  dbType:126,
                  dbTypeDisplay:"",
                  msType: 0,
                  msTypeDisplay:""               
                },
                {
                  procedureArgsName: "tsajet2",
                  jsonKeyName: "tsajet2",
                  direction: 2,
                  directionDisplay:"",
                  dbType:126,
                  dbTypeDisplay:"",
                  msType: 0,
                  msTypeDisplay:""       
                },
              ],
            },
          ],
        },
      ],
      tableData2: [], //cmd list
      tableData3: [], //arg list
      loading:false,


      headerClass:{
        color: '#000'
      },
      search1: "",
      search2: "",
      search3: "",

      form1: {
        plant: "",
        system: "",
        connStr: "",
      },

      form2: {
        cmd: "",
        procedureName: "",
      },

      form3: {
        procedureArgsName: "",
        jsonKeyName: "",
        size: 0
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

      procedureOptions:[],
      commit_done:true
    };
  },
  methods: {
    getProcs(query){
      if (query !== '') {

          if(query.length < 3){
            return;
          }

          this.loading = true;
          setTimeout(() => {         
            // this.options = this.list.filter(item => {
            //   return item.label.toLowerCase()
            //     .indexOf(query.toLowerCase()) > -1;
            // });
            //请求接口
            request({
              url: '/api/Config/DbProc',
              method: 'post',
              data:{
                "system": this.tableData1[this.form1RowIndex].system,
                "cstr": this.tableData1[this.form1RowIndex].connStr,
                "search": query.toUpperCase()
              }
            }).then(res=>{
                this.procedureOptions = res.data;
            })
            .catch(err=>console.log(err));

            this.loading = false;
          }, 200);
        } else {
          this.procedureOptions = [];
        }
    },
    plant_row_select(row) {
    
      if(row){
        this.form1RowIndex = this.tableData1.findIndex(x=> x.plant==row.plant && x.system == row.system);      
        //this.tableData2 = row.cmds;
        console.log(row);
        console.log(this.form1RowIndex);
      }else{
        //this.form1RowIndex = 0;
        console.log(row);
      }     
    },
    cmd_row_select(row) {
      //console.log(row.procedureArgs);
      console.log('cmd_row_select'+this.form2RowIndex);
      
      if(row){
        this.form2RowIndex = this.tableData1[this.form1RowIndex].cmds.findIndex(x=> x.cmd==row.cmd);
        //this.tableData3 = row.procedureArgs;
        console.log(this.form2RowIndex);
      }else{
        this.form2RowIndex = 0;
      }   
      
    },
    arg_row_select(row) {
      //console.log(row.procedureArgs);
      console.log('arg_row_select');
      
      if(row){
        this.form3RowIndex = this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureArgs
        .findIndex(x=> x.procedureArgsName == row.procedureArgsName);
        //this.tableData3 = row.procedureArgs;
        console.log(this.form3RowIndex);
      }else{
        this.form3RowIndex = 0;
      }   
      
    },
    openPlantForm(){
      this.form1.plant = '';
      this.form1.system = '';
      this.form1.connStr = '';
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
        request({
        url: '/api/Config/Dbcheck',
          method: 'post',
          data:{
            "system": this.form1.system,
            "cstr": this.form1.connStr,
            "search": ''
          }
        }).then(res=>{
          console.log(res);
            if(res.result.indexOf('OK') > -1){
              this.tableData1.push({
              plant:this.form1.plant,
              system:this.form1.system,
              connStr:this.form1.connStr,
              cmds:[
                  {
                    cmd:'',
                    procedureName:'',
                    procedureArgs:[]
                  }        
                ]
              });
              this.$message.success('添加成功');

              this.$refs.plantTable.setCurrentRow(this.tableData1[this.tableData1.length-1]);
            }else{
              this.$message.error(res.result);
            }
        })
        .catch(err=>{
          console.log(err);
          this.$message.error('网络异常!');
        });

        
      }else{
        this.tableData1[this.form1RowIndex].plant = this.form1.plant;
        this.tableData1[this.form1RowIndex].system = this.form1.system;


        if(this.tableData1[this.form1RowIndex].connStr != this.form1.connStr){
          request({
            url: '/api/Config/Dbcheck',
              method: 'post',
              data:{
                "system": this.form1.system,
                "cstr": this.form1.connStr,
                "search": ''
              }
            }).then(res=>{
                if(res.result.indexOf('OK') > -1){     
                  this.tableData1[this.form1RowIndex].connStr = this.form1.connStr;
                  this.$message.success('修改成功');
                }else{
                  
                  this.$message.error(res.result);
                }
            })
            .catch(err=>{
              console.log(err);
              this.$message.error('网络异常!');
            });
          
        }
        
        
      }
           
      this.form1Visible = false;
      
    },
    plantEdit(index,row){
      this.form1.plant = row.plant;
      this.form1.system = row.system;
      this.form1.connStr = row.connStr;
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
      this.form2.procedureName = '';
      this.form2Action = 'Add';
      this.form2Visible = true;
    },
    addOrModifyCmd() {
      this.procedureOptions = [];
      //如果 厂别加系统 存在 修改,否则就新增
      const data = {
              "system": this.tableData1[this.form1RowIndex].system,
              "cstr": this.tableData1[this.form1RowIndex].connStr,
              "search": this.form2.procedureName
      } 

      if(this.form2Action == 'Add'){

        if(this.tableData1[this.form1RowIndex].cmds.length > 0){
          const q = this.tableData1[this.form1RowIndex].cmds.filter(x=>x.cmd.toLowerCase() == this.form2.cmd.toLowerCase());
          if(q.length > 0){
            let msg = `${this.form2.cmd} 配置已存在!`;
            this.$message.error(msg);
            return;
          }
        }
        // 请求后台获取procedureName参数
           
        request({
          url: '/api/Config/DbProcArgs',
          method: 'post',
          data
        }).then(res=>{    
            console.log(res.data);          
            this.tableData1[this.form1RowIndex].cmds.push({
              cmd:this.form2.cmd,
              procedureName:this.form2.procedureName,
              procedureArgs:res.data
            });
            this.form2RowIndex = this.tableData1[this.form1RowIndex].cmds.length -1;
            this.$message.success('新增成功');        
        })
        .catch(err=>{
          console.log(err);
          this.$message.error('新增失败');        
        });
                  
      }else{

        if(this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].cmd != this.form2.cmd){
          this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].cmd = this.form2.cmd;
          this.$message.success('修改成功'); 
        }
        
        //若有修改到procedureName名称,那就重新获取参数 
        if(this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureName != this.form2.procedureName){
          request({
            url: '/api/Config/DbProcArgs',
            method: 'post',
            data
          }).then(res=>{    
              this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureArgs = res.data;
              this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureName = this.form2.procedureName;
              this.$message.success('修改成功');        
          })
          .catch(err=>{
            console.log(err);
            this.$message.error('修改失败');        
          });
          
        } 

      }
           
      this.form2Visible = false;
      
      
    },
    cmdEdit(index,row){
      this.procedureOptions = [];
      this.form2.cmd = row.cmd;
      this.form2.procedureName = row.procedureName;
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
      console.log(index);
      this.form2RowIndex = 0;
    },
    ArgEdit(index,row){
      this.form3.procedureArgsName = row.procedureArgsName;
      this.form3.jsonKeyName = row.jsonKeyName;
      this.form3.size = Number(row.size);
      this.form3RowIndex = index;
      this.form3Visible = true;
      this.form3Action = 'Edit';
      console.log(typeof(this.form3.size));
    },
    ModifyArg() {
      if(this.form3.size > 32767){
        this.$message.error('参数大小不能超过32767');
        return;
      }
      this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureArgs[this.form3RowIndex].jsonKeyName = this.form3.jsonKeyName;
      this.tableData1[this.form1RowIndex].cmds[this.form2RowIndex].procedureArgs[this.form3RowIndex].size = Number(this.form3.size);
      this.form3Visible = false;
      this.$message.success('修改成功');

    },
    submit(){
      this.commit_done = false;

      request({
        url: '/api/Config/Config',
        method: 'post',
        data:this.tableData1
      }).then(res=>{    

          this.$message.success('保存成功!'); 
          this.commit_done = true;
      })
      .catch(err=>{
        console.log(err);
        this.$message.error('保存失败!');   
          this.commit_done = true;
      });
    }
    
  },
  mounted(){
    console.log = ()=>{};
    request({
      url: '/api/Config/GetAll',
      method: 'get'
    }).then(res=>{
        console.log(res);
        this.tableData1 = res.data;
        this.$refs.plantTable.setCurrentRow(this.tableData1[0]);
      })
      .catch(err=>console.log(err));


  }
};
</script>

<style lang='scss' scoped>
.space {
  margin-top: 20px;
}

.search {
  display: flex;
}

.card-shadow {
    box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
}

.el-table{
  color: #000;
}
</style>