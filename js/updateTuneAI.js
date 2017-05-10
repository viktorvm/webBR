var firstPass = true;
var tVal = '!';

function updateTuneValues() {
	try {
	    if (firstPass) {
	        //отрисовываем таблицу настроек
            for (var v in TUNE_VAR_LIST) {
                document.getElementById('subTblTune').innerHTML += '<tr><td rowspan="2">' + _events['AI']['TAGS'][v] +
		        			'</td><td rowspan="2">' + _events['AI']['UN'][v] +
		        			'</td><td rowspan="2"><input type="text" id="' + v + '.CH" value="0" onkeypress="updateAI(event, this)">' +
		        			'</td><td colspan="2"><input type="number" id="' + v + '.PV" value="00.00" readonly>' +
		        			'</td><td rowspan="2"><input type="number" id="' + v + '.CUR" value="00.00" readonly>' +
		        			'</td><td rowspan="2"><input type="number" id="' + v + '.VL" value="00.00" class="HL" onkeypress="updateAI(event, this)">' +
		        			'</td><td rowspan="2"><input type="number" id="' + v + '.VH" value="00.00" class="HL" onkeypress="updateAI(event, this)">' +
		        			'</td><td><input type="number" id="' + v + '.VMAN" value="00.00" onkeypress="updateAI(event, this)">' +
		        			'</td></tr><tr><td><input type="number" id="' + v + '.SL" value="00.00" onkeypress="updateAI(event, this)">' +
		        			'</td><td><input type="number" id="' + v + '.SH" value="00.00" onkeypress="updateAI(event, this)">' +
		        			'</td><td align ="center"><div id="' + v + '.EMAN" class="eman-div" onclick="emanChange(this)">Неопред.</div></td></tr>';
		    }

		    //при первом заходе подписываемся на событие фокуса на всех редактируемых input
	    	//здесь доп. фитча сброса input, если туда ввели данные, но не нажали Enter
	    	//к сожалению, на панели не работает, т.к. там ввод с виртуальной клавиатуры, при клике на которую фокус теряется
	    	//панель исключаем
	        if (!(BrowserDetect.browser == 'Chrome' && BrowserDetect.version == 49 && BrowserDetect.OS == 'Linux')) {
                var tbl = document.getElementById('tblTune');
                var inps = tbl.getElementsByTagName('input');
                for (inp in inps) {
                    if (typeof(inps[inp]) == 'object') {
                        inps[inp].addEventListener('focus', function() {
                            tVal = this.value;
                        });
                        inps[inp].addEventListener('blur', function() {
                            this.value = tVal;
                        });
                    }
                }
            }
		}

        //Обновляем значения переменных
		for (v in TUNE_VAR_LIST) {
		    for (t in TUNE_VAR_LIST[v]) {
		        //ограничение на доступ проверяем непрерывно
    		    if (t == 'SH' || t == 'SL' || t == 'VMAN' || t == 'CH') {
    		        if (USER == 'OPERATOR') {
    		            document.getElementById(v + '.' + t).readOnly = true;
    		        } else if (USER == 'ENGINEER') {
    		            document.getElementById(v + '.' + t).readOnly = false;
    		        }
    		    }

		        if (t == 'VLL' || t == 'VHH') { continue; }
		        //окрашиваем значение соответствующего предела при срабатывании сигнализации
		        if (t == 'ST') {
		            if (TUNE_VAR_LIST[v][t] == 5) {
		                document.getElementById(v + '.VH').style.background = _colors.red
		            } else {
		                document.getElementById(v + '.VH').style.background = _colors.black;
		            }
		            if (TUNE_VAR_LIST[v][t] == 6) {
		                document.getElementById(v + '.VL').style.background = _colors.red
		            } else {
		                document.getElementById(v + '.VL').style.background = _colors.black;
		            }
		        }
		        //PV и Ток читаем и выводим непрерывно
		        if (t == 'PV' || t == 'CUR') {
		            document.getElementById(v + '.' + t).value = TUNE_VAR_LIST[v][t];
		        } else if (firstPass) {
		            //остальные, перезаписываемые, переменные выводим один раз при открытии окна
		            if (t == 'EMAN') {
                        emanToStyle(v + '.' + t, TUNE_VAR_LIST[v][t]);
		            } else {
		                if (t == 'ST') { continue; }
		                document.getElementById(v + '.' + t).value = TUNE_VAR_LIST[v][t];
		            }
		        }
		    }
		}
		firstPass = false;
    } catch(e) {
        throwError('Error updating variables on page:\n ' + e);
        firstPass = false;
	}
}

//Запись настроек AI по клавише Enter
function updateAI(e, inp) {
    if (e.charCode == 13) {
        //имя тега
        var i = inp.id.substring(0, inp.id.indexOf('.'));
        //имя параметра
        var p = inp.id.substring(inp.id.indexOf('.') + 1);
        //запись параметра в контроллер
        if (inp.id.indexOf('CH') != -1) {
            pvAccess.WritePV(USER, 'AItoACP[' + i + ']', document.getElementById(inp.id).value);
        } else {
            pvAccess.WritePV(USER, 'AI[' + i + '].' + p, document.getElementById(inp.id).value);
        }
        //переприсвоение временной переменной
        tVal =  document.getElementById(inp.id).value;
//        //сбрасываем бит первого цикла, чтобы обновить все параметры снова
//        firstPass = true
    }
}
//Выделение индекса элемента массива по ключу
function arrIndex(key, arr){
  var i = 0;
  for(var k in arr){if(k===key){return i;} i++;}
  return false;
}

//Определить значение надписи для включения имитации (Вкл./Откл.)
function emanToStyle(tag, val) {
    //имя тега
    var t = tag.substring(0, tag.indexOf('.'));
    //имя параметра
    var p = tag.substring(tag.indexOf('.') + 1);
    var div = document.getElementById(t + '.' + p);
    //Форматирование исходя из состояния бита включена/отключена
    if (val) {
	    div.innerHTML = 'Вкл.';
	    div.style.color = _colors.blue;
    } else {
	    div.innerHTML = 'Откл.';
		div.style.color = _colors.white;
    }

    div.innerHTML = val ? 'ВКЛ' : 'ВЫКЛ';
    div.style.color = val ? _colors.blue : _colors.white;

    //Переобпределяем форматирование исходя из прав доступа
    if (USER == 'OPERATOR') {
        div.style.background = _colors.white;
        div.style.color = _colors.black;
    } else if (USER == 'ENGINEER') {
        div.style.background = _colors.black;
    }
}

//Переключение имитации (Вкл./Откл.)
function emanChange(div) {
    try {
        //Проверка прав доступа
        if (USER == 'ENGINEER') {
            //имя тега
            var t = div.id.substring(0, div.id.indexOf('.'));
            //имя параметра
            var p = div.id.substring(div.id.indexOf('.') + 1);
            //индекс в массиве
            var i = arrIndex(t , TUNE_VAR_LIST) + 1;

            //переключаем значение
            if (TUNE_VAR_LIST[t][p]) {
                pvAccess.WritePV(USER, 'AI[' + i + '].' + p, '0');
                emanToStyle(div.id, false);
            } else {
                pvAccess.WritePV(USER, 'AI[' + i + '].' + p, '1');
                emanToStyle(div.id, true);
            }
        }
    } catch(e) {
        throwError('Error updating tag "' + t + '.' + p + '":\n ' + e);
    }
}