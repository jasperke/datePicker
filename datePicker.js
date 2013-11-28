function CalendarSelector(options){
	this.options={
		ui_width:170,
		week_name:['SU','MO','TU','WE','TH','FR','SA'],
		month_name:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		font_family:'"Arial","Helvetica","sans-serif"',
		bcl:"#000000",
		bcd:"#FFFFFF",
		clearButton:true,		// 清空按鈕
		weekMode:false,			// 選週模式
		multipleSelect:false,	// 複選日期
		success:function(date){	// 可重設指定外部function執行選定日期後續動作
			this.targetField.value=date.length?date[0]+'-'+date[1]+'-'+date[2]:'';
		}
	};
	this.every_days=[];	// 當月每個cell(空白or日期)
	this._posX=0;
	this._posY=0;
	this.sel_y=null;
	this.sel_m=null;
	this.sel_d=null;
	this._show=false;
	this.multipleSelectResult=[];
	this.multipleSelectResultBox=null;
	this.targetField=null;
	this.initialized=false;

	this.element=null;
}
CalendarSelector.prototype={
	init:function(options){
		$.extend(this.options,options||{});
		if(this.options.multipleSelect){ // 複選日期不提供清空按鈕及選週模式
			this.options.clearButton=false;
			this.options.weekMode=false;
		}
		this.element=$('<div/>').css({position:'absolute',width:this.options.ui_width+'px',border:'1px solid #7D7D7D'})
			.hide()
			.appendTo('body')
			.on('click',function(event){
				event.stopPropagation();
			});
		$(document).bind('click',$.proxy(this,'hindCalendar'));
		this.initialized=true;
	},
	setMultipleSelectResult:function(date){
		this.multipleSelectResult=[];
		for(var i=0; i<date.length; i++){
			this.multipleSelectResult.push(date[i]);
		}
	},
	_maxDate:function(yy,mm){ // mm:0-11, 傳回某月份最後一日日期
		while(mm<0){
			mm=12+mm;
			yy--;
		}
		if(mm==0||mm==2||mm==4||mm==6||mm==7||mm==9||mm==11){
			return 31;
		}else if(mm==3||mm==5||mm==8||mm==10){
			return 30;
		}else{
			if((yy%4==0&&yy%100!=0)||yy%1000==0){return 29;}else{return 28;}
		}
	},
	check_date:function(yy,mm,dd){
		if(isNaN(yy)||isNaN(mm)||isNaN(dd)){return false;}
		mm+=1; /* 此function內月份採1-12 */
		if(yy<=0||mm<=0||mm>12||dd<=0||dd>31){return false;}
		if((mm==4||mm==6||mm==9||mm==11)&&dd>30){return false;}
		if(mm==2){
			if((yy%4==0&&yy%100!=0)||yy%1000==0){
				if(dd>29){return false;}
			}else{
				if(dd>28){return false;}
			}
		}
		return true;
	},
	showCalendar:function(yy,mm,dd){ // mm:0-11
		if(this.check_date(yy,mm,dd)){
			this.sel_y=yy;
			this.sel_m=mm;
			this.sel_d=dd;
		}else{
			var currentTime=new Date();
			this.sel_y=currentTime.getFullYear();
			this.sel_m=currentTime.getMonth();
			this.sel_d=currentTime.getDate();
		}
		if(this.options.weekMode){ /* 選週模式 */
			var _theDay=new Date(this.sel_y,this.sel_m,this.sel_d);
			var _w=_theDay.getDay(); /* 傳入日為星期幾 */
			this.beginDate=_theDay-(24*60*60*1000*_w);
			this.endDate=this.beginDate+(24*60*60*1000*6);
		}else{
			this.beginDate=this.endDate=new Date(this.sel_y,this.sel_m,this.sel_d);
		}

		this.changeDate(this.sel_y,this.sel_m,this.sel_d);
		this._show=true;
		this.element.css({top:this._posY+'px',left:this._posX+'px'}).show('fast');
	},
	isVisible:function(){
		return this._show;
	},
	changeDate:function(y,m,d){
		this.element.empty();
		if(y!=null){
			this.sel_y=y;
		}
		if(m!=null){
			if(m<0){
				this.sel_m=11;
				this.sel_y=this.sel_y-1;
			}else if(m>=12){
				this.sel_m=0;
				this.sel_y=parseInt(this.sel_y)+1;
			}else{
				this.sel_m=m;
			}
		}
		this._buildArray();
		this._rander();
	},
	_setCurrentTime:function(){
		var nowTime=new Date();
		this._todayYear=nowTime.getFullYear();
		this._todayMonth=nowTime.getMonth();
		this._todayDate=nowTime.getDate();
	},
	_buildArray:function(){
		var _ftw=(new Date(this.sel_y,this.sel_m,1)).getDay(); /* 顯示月份首日為星期幾 */
		this.every_days=[];
		for(var k=0; k<_ftw; k++){
			this.every_days.push(null);
		}
		var max_date=this._maxDate(this.sel_y,this.sel_m); /* 當月最末日期 */
		for(k=1; k<=max_date; k++){
			this.every_days.push(k);
		}
	},
	_rander:function(){
		this._setCurrentTime();
		var $table=$('<table/>',{width:'100%',border:0,cellSpacing:0,cellPadding:0,bgColor:'#00358C'}).appendTo(this.element);
		var $tr=$('<tr/>').appendTo($table); /* {css:{MozUserSelect:'none'},selectstart:new Function("return false;")} */

		// year part
		var $td=$('<td/>',{align:'center',width:'80%'}).css({padding:'1px'}).appendTo($tr);
		$('<a/>').css({fontFamily:this.options.font_family,fontWeight:'bold',textDecoration:'none',cursor:'pointer',color:'#FFFF00'})
			.attr('title',this.sel_y-1).bind('click',{obj:this,y:this.sel_y-1},function(event){
				event.data.obj.changeDate(event.data.y,null,null);
			}).text('<< ').appendTo($td);
		//$('<span/>').css({color:'#FFFFFF',fontFamily:this.options.font_family,fontWeight:'bold'}).text(this.sel_y).appendTo($td);
		$('<input type="text" name="CALENDAR_UI_YEAR_SELECTOR" value="'+this.sel_y+'"/>').css({fontWeight:'bold',textAlign:'center',fontSize:'12px',width:'50px'}).appendTo($td)
			.bind('keyup',{obj:this},function(event){if(!isNaN(event.target.value)&&event.target.value>1800&&event.target.value<2100){event.data.obj.changeDate(event.target.value,null,null);}});

		$('<a/>').css({fontFamily:this.options.font_family,fontWeight:'bold',textDecoration:'none',cursor:'pointer',color:'#FFFF00'})
			.attr('title',parseInt(this.sel_y)+1).bind('click',{obj:this,y:parseInt(this.sel_y)+1},function(event){
				event.data.obj.changeDate(event.data.y,null,null);
			}).text(' >>').appendTo($td);

		this._monthPart($('<td/>').appendTo($('<tr/>').appendTo($table)));
		this._dayPart($('<td/>').appendTo($('<tr/>').appendTo($table)));

		// clear field button
		if(this.options.clearButton){
			$tr=$('<tr/>').attr({bgColor:'#ffffff'}).appendTo($table);
			var _button=$('<input type="button" value="清空"/>').css({width:'100%',fontSize:'12px'}).appendTo($('<td/>').appendTo($tr))
				.bind('click',{obj:this,dateArray:[]},function(event){event.data.obj._dateHandler(event.data.dateArray);});
		}
		// multiple select
		if(this.options.multipleSelect){
			$tr=$('<tr/>').attr({bgColor:'#ffffff'}).appendTo($table);
			this.multipleSelectResultBox=$('<div/>').css({height:'60px',overflow:'auto',padding:'1px',borderTop:'1px solid #cccccc',borderBottom:'1px solid #ffffff',backgroundColor:'#eeeeee'}).appendTo($('<td/>').appendTo($tr));

			$tr=$('<tr/>').attr({bgColor:'#ffffff'}).appendTo($table);
			$td=$('<td/>',{align:'center',bgColor:'#cccccc'}).css({padding:'2px'}).appendTo($tr);
			var OkButton=$('<input type="button" value="確定"/>').css({fontSize:'12px'}).appendTo($td)
				.bind('click',{obj:this},this._datesHandler);
			$td.append(' ');
			var cancelButton=$('<input type="button" value="取消"/>').css({fontSize:'12px'}).appendTo($td)
				.bind('click',{obj:this},function(event){
					event.data.obj.multipleSelectResult=[];
					event.data.obj.hindCalendar();
					event.data.obj.multipleSelectResultBox.empty();
				});
			this._refreshMultipleSelectBox();
		}
	},
	_monthPart:function($td){
		var $table=$('<table/>').attr({width:'100%',border:0,cellPadding:0,cellSpacing:1,bgColor:'#CCCCCC'}).appendTo($td);
		var $tr=$('<tr/>').appendTo($table);
		for(var i=0; i<12; i++){
			$('<td/>').attr({width:'16%',align:'center',month_idx:i}).css({MozUserSelect:'none',fontSize:'11px',borderWidth:'1px',borderStyle:'solid',fontFamily:this.options.font_family,backgroundColor:'#D6D3CE',color:'#666666',borderTopColor:'#FFFFFF',borderLeftColor:'#FFFFFF',borderRightColor:'#000000',borderBottomColor:'#000000',cursor:'pointer'})
				.text(this.options.month_name[i]).appendTo($tr);
			if(i==5)
				$tr=$('<tr/>').appendTo($table);
		}
		$('td:eq('+this.sel_m+')',$table).css({color:'#0000FF',borderTopColor:'#000000',borderLeftColor:'#000000',borderRightColor:'#FFFFFF',borderBottomColor:'#FFFFFF'});

		$('td:not(:eq('+this.sel_m+'))',$table).bind('mousedown',{obj:this,act:1},function(event){event.data.obj.tButton(this,event.data.act);})
			.bind('mouseout mouseup',{obj:this,act:0},function(event){event.data.obj.tButton(this,event.data.act);})
			.bind('selectstart',new Function("return false;"))
			.bind('click',{obj:this},function(event){event.data.obj.changeDate(null,$(this).attr('month_idx'),null);});
	},
	_dayPart:function($td){
		var $table=$('<table/>').attr({width:'100%',border:0,cellPadding:0,cellSpacing:1,bgColor:'#F0F0F0'}).appendTo($td);

		// week header
		var $tr=$('<tr/>').css({MozUserSelect:'none'}).appendTo($table).bind('selectstart',new Function("return false;"));
		for(var w=0; w<7; w++){
			$('<td/>').attr({width:'14%',align:'center'}).css({fontSize:'11px',fontWeight:'bold',fontFamily:this.options.font_family,color:'#FFFFFF',backgroundColor:(w==0||w==6)?'#FFB9B9':'#006699'})
				.text(this.options.week_name[w])
				.appendTo($tr);
		}

		// Day
		var _row=Math.ceil(this.every_days.length/7);
		var idx;
		var _td;
		var _grey_date=this._maxDate(this.sel_y,this.sel_m-1)-(new Date(this.sel_y,this.sel_m,1)).getDay()+1;
		for(var r=0; r<_row; r++){
			$tr=$('<tr/>').css({MozUserSelect:'none'}).bind('selectstart',new Function("return false;")).appendTo($table);
			for(var c=0; c<7; c++){
				idx=r*7+c;
				_td=$('<td/>').css({fontSize:'11px',fontFamily:this.options.font_family}).attr({align:'center',bgColor:'#FFFFFF'}).appendTo($tr);
				if(!this.every_days[idx]||this.every_days[idx]==null){
					_td.addClass('invalid_cell').text(_grey_date++);
				}else{
					_grey_date=1;
					if(idx%7==0||idx%7==6)
						_td.addClass('weekend_cell');
					if(this.sel_y==this._todayYear&&this.sel_m==this._todayMonth&&this.every_days[idx]==this._todayDate){ /* 今天 */
						_td.addClass('today_cell');
					}else if(this.isSelectedDate(this.sel_y,this.sel_m,this.every_days[idx])){ /* 選定天 */
						_td.addClass('selected_cell');
					}
					_td.css({cursor:'pointer'}).bind('mouseover',function(){$(this).css({backgroundColor:'#C6D9EC'});})
						.bind('mouseout',function(){$(this).css({backgroundColor:''});})
						.bind('click',{obj:this,dateArray:[this.sel_y,this.sel_m,this.every_days[idx]]},function(event){
							if(!event.data.obj.options.multipleSelect){
								event.data.obj._dateHandler(event.data.dateArray);
							}else{
								event.data.obj._addToMultipleSelectResult(event.data.dateArray);
							}
						}).text(this.every_days[idx]);
				}
			}
		}
		$('td.invalid_cell',$table).css({color:'#FFFFFF',backgroundColor:'#EBEBEB'});
		$('td.weekend_cell',$table).css({color:'#FF0000'});
		$('td.today_cell',$table).attr('bgColor','#FFCC00');
		$('td.selected_cell',$table).attr('bgColor','#D9D9FF');
	},
	isSelectedDate:function(y,m,d){
		var thisDate=new Date(y,m,d);
		return (thisDate>=this.beginDate&&thisDate<=this.endDate)?true:false;
	},
	_addToMultipleSelectResult:function(dateArray){
		this.multipleSelectResult.push(dateArray);
		this._refreshMultipleSelectBox();
	},
	_refreshMultipleSelectBox:function(){
		var obj=this;
		this.multipleSelectResultBox.empty();
		$.each(this.multipleSelectResult,function(idx,elm){
			if(idx>0) obj.multipleSelectResultBox.append(', ');
			$('<span/>').attr({index:idx}).css({cursor:'pointer'}).html(elm[0]+'/'+(elm[1]*1+1)+'/'+elm[2]).appendTo(obj.multipleSelectResultBox)
				.bind('click',{obj:obj},function(event){
					event.data.obj.multipleSelectResult.splice($(this).attr('index'),1);
					event.data.obj._refreshMultipleSelectBox();
				});
		});
	},
	_dateHandler:function(dateArray){
		if(dateArray.length){
			if(!this.multipleSelect){
				if(this.options.weekMode){
					var _theDay=new Date(dateArray[0],dateArray[1],dateArray[2]);
					var _w=_theDay.getDay(); /* 為星期幾 */
					this.beginDate=new Date(_theDay.getTime()-(24*60*60*1000*_w));
					this.endDate=new Date(this.beginDate.getTime()+(24*60*60*1000*6));
					this.return_value=[this.beginDate.getFullYear(),this.beginDate.getMonth(),this.beginDate.getDate(),this.endDate.getFullYear(),this.endDate.getMonth(),this.endDate.getDate()];
				}else{
					this.return_value=dateArray;
				}
				//this.options.success([this.return_value[0],(this.return_value[1]*1+1),this.return_value[2],this.return_value[3],(this.return_value[4]*1+1),this.return_value[5]]);
				this.options.success.call(this,[this.return_value[0],(this.return_value[1]*1+1),this.return_value[2],this.return_value[3],(this.return_value[4]*1+1),this.return_value[5]]);
			}else{
				//this.options.success(this.multipleSelectResult,[this.return_value[0],(this.return_value[1]*1+1),this.return_value[2],this.return_value[3],(this.return_value[4]*1+1),this.return_value[5]]);
				this.options.success.call(this,this.multipleSelectResult,[this.return_value[0],(this.return_value[1]*1+1),this.return_value[2],this.return_value[3],(this.return_value[4]*1+1),this.return_value[5]]);
			}
		}else{
			this.options.success.call(this,[]);
		}
		this.hindCalendar();
	},
	_datesHandler:function(event){
		var obj=event.data.obj;
		if(obj.multipleSelectResult.length){
			obj.options.success.call(this,obj.multipleSelectResult);
		}else{
			obj.options.success.call(this,[]);
		}
		obj.hindCalendar();
	},
	tButton:function(td,act){
		if(act)
			$(td).css({borderColor:this.options.bcl+' '+this.options.bcd+' '+this.options.bcd+' '+this.options.bcl});
		else
			$(td).css({borderColor:this.options.bcd+' '+this.options.bcl+' '+this.options.bcl+' '+this.options.bcd});
	},
	hindCalendar:function(){
		this._show=false;
		this.element.hide('fast');
	},
	setXY:function(x,y){
		this._posX=x;
		this._posY=y;
	}
};


// define jQuery plugin datePicker()
(function($){
	var calendar=new CalendarSelector();

	$.fn.datePicker=function(options){
		if(!this.length)
			return this;
		this.each(function(){
			if(this.tagName.toUpperCase()=='INPUT'&&this.getAttribute('type').toUpperCase()=='TEXT'){
				$(this).attr('readonly',true).css('cursor','pointer')
					.on('click',{},function(event){
						var target=$(event.target),
							pos=target.offset(),
							calendarLayerHeight,
							dA;

						if(!calendar.initialized){
							calendar.init(options);
						}
						calendarLayerHeight=calendar.element.height();

						calendar.targetField=target[0];
						// 超過版面要往上長的話, 在此處處理
						if((pos.top+calendarLayerHeight)>(document.body.scrollTop+document.body.clientHeight))
							pos.top=target.offset().top-calendarLayerHeight-target.height();
						calendar.setXY(pos.left,pos.top+target.outerHeight()+1);

						dA=target[0].value.match(/(\d+)\D+(\d+)\D+(\d+)/);
						if(dA){
							calendar.showCalendar(dA[1],dA[2]-1,dA[3]);
						}else{
							calendar.showCalendar();
						}
						event.stopPropagation();
					});
			}
		});
		return this;
	}
})(jQuery);