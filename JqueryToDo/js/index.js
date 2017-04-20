/**
 * Created by hanmiao on 2017/3/11.
 */
;(function () {
   'use strict';

   $(function () {
       var $form_add_list=$('.add-list');
       var $delete_task;
       var task_list=[];
       var $detail_task;
       var $list_detail=$('.list-detail');
       var $task_detail_mask=$('.task-detail-mask');
       var current_index;
       var $update_form;
       var $list_detail_content;
       var $list_detail_content_input;
       var $checkbox_complete;
       var $alert=$('.video-alert');
       init();
       $task_detail_mask.on('click',hide_detail_task);
       //添加新task
       $form_add_list.on('submit',function (e) {
           e.preventDefault();
           var new_list={};
           var $input=$(this).find('input[name=content]');
           //获取新content值
           new_list.content=$input.val();
           //如果add-list-content为空，则直接返回，否则继续执行
           if(!new_list.content) return;
           //存入新的content
           add_list(new_list);
           $input.val('');
       })
        function add_list(new_list) {
            task_list.push(new_list); //将新的content推入task_list
            refresh_localstorage();
            return true;
        }
        /*刷新localstorage并更新模板*/
        function refresh_localstorage(){
            store.set('task_list',task_list);//更新task_list
            render_task_list();
        }
        //查找并监听所有删除按钮的点击事件
        function listen_delete_task() {
            $delete_task.on('click',function () {
                /*找到删除按钮所在的task元素*/
                var $item = $(this).parent().parent();
                var index=$item.data('index');
                /*确认删除*/
                var tmp=confirm('确定删除？');
                tmp ? delete_task(index):null;
            })
        }
        //删除task
        function delete_task(index) {
            //如果没有index或者index不存在则直接返回
            if(index==undefined||!task_list[index]) return;
            delete task_list[index];
            refresh_localstorage();
        }
       /*===列表详情===*/
       //查找并监听所有详情按钮的点击事件
       function listen_detail_task() {
           var index;
           $('.task-item').on('dblclick',function () {
               index=$(this).data('index');
               show_detail_task(index);
           })
           $detail_task.on('click',function () {
               /*找到详情按钮所在的task元素*/
               var $item = $(this).parent().parent();
               var index = $item.data('index');
               show_detail_task(index);
           })
       }
       /*查看task详情*/
       function show_detail_task(index) {
           /*生成详情模板*/
           render_detail_task(index);
           current_index=index;
           /*显示详情模板*/
           $list_detail.show();
           $task_detail_mask.show();
       }
       /*隐藏详情模板*/
       function hide_detail_task() {
           $list_detail.hide();
           $task_detail_mask.hide();
       }
       /*task详情里更新task内容*/
       function update_task(index,data) {
           if(index===undefined||!task_list[index])
               return;
           task_list[index]=$.extend({},task_list[index],data);
           refresh_localstorage();

       }

       /* 渲染指定task的详细信息*/
       function  render_detail_task(index) {
           if(index===undefined||!task_list[index])
               return;
           var item = task_list[index];
           var tpl='<form>'+
             '<div class="input-item content" >' +
               item.content +
               '</div>'+
               '<div class="input-item"><input style="display: none" type="text" name="content" value="'+(item.content || '')+'"></div>'+
               '<div class="input-item desc"><textarea name="desc">'+ (item.desc||'')+ '</textarea></div>'+
               '<div class="input-item remind">'+
                   '<label>提醒时间：</label>'+
               '<input class="datetime" type="text" name="remind" value="'+ (item.remind || '')+'">'+
               '</div>'+
               '<div class="input-item"><button type="submit">更新</button></div>'+
               '</form>'
           /*用新模板替换旧模板*/
           $list_detail.html(null);
           $list_detail.append(tpl);
           $('.datetime').datetimepicker();
           /*选中task详情里的form元素，便于监听submit事件*/
           $update_form=$list_detail.find('form');
           /*选中显示task详情里的content，input元素*/
           $list_detail_content=$update_form.find('.content');
           $list_detail_content_input=$update_form.find('[name=content]');
           /*双击内容元素显示input，隐藏自己*/
           $list_detail_content.on('dblclick',function (e) {
               $list_detail_content_input.show();
               $list_detail_content.hide();

           })

           $update_form.on('submit',function(e){
               e.preventDefault();
              var data={};
              /*获取task详情中input的值*/
              data.content=$(this).find('[name=content]').val();
              data.desc=$(this).find('[name=desc]').val();
              data.remind=$(this).find('[name=remind]').val();
               update_task(index,data);
               hide_detail_task();
           })
       }
       /*监听所有标记按钮的点击事件*/
       function listen_checkbox_complete() {
           $checkbox_complete.on('click',function () {
                var index=$(this).parent().parent().data('index');
                var item=store.get('task_list')[index];
                if(item.complete){
                    update_task(index,{complete:false});
                }else {
                    update_task(index, {complete: true});
                }
           })
       }
       /*定时提醒函数*/
       function task_remind_check() {
           var current_timestamp;
           var itl=setInterval(function () {
               for(var i=0;i<task_list.length;i++){
                   var item=task_list[i];
                   var task_timestamp;
                   if(!item||!item.remind||item.informed)
                       continue;
                   current_timestamp=(new Date()).getTime();
                   task_timestamp=(new Date(item.remind)).getTime();
                   if(current_timestamp-task_timestamp>=1){
                       update_task(i,{informed:true});
                       show_notify(item.content);
                   }
               }
           },300)
       }
       function show_notify(msg) {
           $('.msg-content').html(msg);
           $('.msg').show();
           $alert.get(0);
       }
       function hide_notify() {
           $('.msg').hide();
       }
       function  listen_msg_event() {
           $('.msg').find('button').on('click',function () {
               hide_notify();
           })
       }
        function  init() {
            task_list=store.get('task_list')||[];
            listen_msg_event();
            if(task_list.length){
                render_task_list();
                task_remind_check();
            }
        }

        //渲染所有task
        function render_task_list() {
           var  $task_list=$('.task-list');
           $task_list.html('');
           var complete_item=[];
           /*渲染所有未标记task*/
           for (var i=0;i<task_list.length;i++){
               var item=task_list[i];
               if(item&&item.complete)
                   complete_item[i]=item;
               else
               var $task=render_task_item(item,i);
               $task_list.prepend($task);
          }
            /*渲染所有标记task*/
            for(var j=0;j<complete_item.length;j++){
                $task=render_task_item(complete_item[j],j);
                if(!$task) continue;
                $task.addClass('completed');
                $task_list.append($task);
            }


          $delete_task=$('.action.delete');
          $detail_task=$('.action.detail');
          $checkbox_complete=$('.task-list .complete');
            listen_delete_task();
            listen_detail_task();
            listen_checkbox_complete();
        }

        //渲染单个task
        function render_task_item(data,index) {
            if(!data||!index) return;
            var list_item_tpl=
                '<div class="task-item" data-index="' + index + '">'+
                '<span><input type="checkbox" class="complete" '+(data.complete?'checked':'') +'></span>'+
                '<span class="content">'+data.content+'</span>'+
                '<span class="fr">'+
                '<span class="action delete">删除</span>'+
                '<span class="action detail">详细</span>'+
                '</span>'+
                '</div>'
            return $(list_item_tpl);
        }
   })

})();
