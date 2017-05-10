//номер насоса, у которого открыли фейсплейт
var csp = 0; //curShowPump
//номер контура, насос которого отображается
var csс = 0;//curShowContour
//индекс выбранного насоса в массиве контроллера
var pInd = 0;
//бит выполнения первого цикла после открытия фейсплейта
var fpFirstPass = true;
//временное значение input
var tVal = '0';

//Функция отображения фейсплейта насоса
function showPumpFP(p) {
    var url = window.location.href;
    var offset = 0;
    var pTxt = '';
    csc = p.id.substring(1,2);

    if (p.id.indexOf('NS') == -1) {
        csp = p.id.substring(5,6);
        pTxt = 'НД' + csp;
        //определяем индекс выбранного насоса в массиве контроллера
        if (csc == 2) { offset = 3; }
        pInd = Number(csp) + Number(offset);
    } else {
        pTxt = 'НШ';
        offset = 6;
        pInd = Number(csc) + Number(offset);
        csp = 4;
    }

    window.location.href = url.substring(0, url.indexOf('#')) + '#win1';
    document.getElementById('curPumpOpened').textContent = 'Контур ' + csc + '. Насос ' + pTxt;
    UpdatePumpCyclic('../asp/tagsPumps.asp', updatePumps);
}

//Функция скрытия фейсплейта насоса
function closePumpFP() {
    var url = window.location.href;
    window.location.href = url.substring(0, url.indexOf('#')) + '#close';
    csp = 0;
    csp = 0;
    fpFirstPass = true;
}

//Периодическое обновление данных по насосам
function UpdatePumpCyclic(link, funCallBack) {
	if (!csp) { return; }
	UpdateValue(link, funCallBack);
	setTimeout( 'UpdatePumpCyclic("' + link + '",' + funCallBack + ')', 500 );
}

//Пуск насоса
function MStart() {
    pvAccess.WritePV(USER, 'pump[' + pInd + '].MStart','1');
}

//Стоп насоса
function MStop() {
    pvAccess.WritePV(USER, 'pump[' + pInd + '].MStop','1');
}

//Сброс аварии насоса
function AlmRes() {
    pvAccess.WritePV(USER, 'pump[' + pInd + '].AlmRes','1');
}

//Сброс моточасов насоса
function ResetMHA() {
    pvAccess.WritePV(USER, 'pump[' + pInd + '].MotoRes','1');
}

//Динамическое обновление элементов отображения фейсплейста насоса
function updatePumps() {
	try {
	    //ситуация когда фейсплейт закрыт, но асинхронный setTimeOut об этом не знал
	    if (csp  == 0 || csc == 0) { return; }

	    //при первом открытии фейсплейта, обновляем редактируемые значения input и checkbox один раз
	    if (fpFirstPass) {
	        //только для НШ
	        if (csp > 3) {
	            //прорисовка элементов
	            document.getElementById('ND0_AMs').style.display = 'none';
	            document.getElementById('NS0_AMs').style.display = 'block';
	            document.getElementById('ND0_RESs').style.display = 'none';
	            document.getElementById('ND0_FRtab').style.display = 'none';
	            document.getElementById('NS0_TIMEtab').style.display = '';
	            document.getElementById('ND0g').style.display = 'none';
	            document.getElementById('NS0g').style.display = '';
	            //запись значений в редактируемые input
	            document.getElementById('NS0_T1').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['T1'];
	            document.getElementById('NS0_T2').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['T2'];
	        }

	        //только для НД
	        if (csp < 4) {
	            //прорисовка элементов
	            document.getElementById('ND0_AMs').style.display = 'block';
	            document.getElementById('NS0_AMs').style.display = 'none';
	            document.getElementById('ND0_RESs').style.display = 'block';
	            document.getElementById('ND0_FRtab').style.display = '';
	            document.getElementById('NS0_TIMEtab').style.display = 'none';
	            document.getElementById('ND0g').style.display = '';
	            document.getElementById('NS0g').style.display = 'none';
                //запись значений в редактируемые input
	            document.getElementById('ND0_FRMV').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MV'];
	            document.getElementById('ND0_FRSV').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['SV'];
	        }
	        //для всех
	        document.getElementById('ND0_REMcb').checked = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Rem'];
	        fpFirstPass = false;
	    }

	    //обновляем элементы
	    //select режима работы
	    var amsel;
        //только для НД
	    if (csp < 4) {
	        //забираем экземпляр для НД, манипуляции одинаковы, в разделе для всех
	        amsel = document.getElementById('ND0_AMs');

	        //select основной/резервный
	        var ressel = document.getElementById('ND0_RESs');
            ressel.selectedIndex = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Res'];
	        //обновляем цвет фона select основной/резерв в зависимости от текущего режима
            var resbgcolor = {
                0 : _colors.green,
                1 : _colors.blue
            };
            ressel.style.background = resbgcolor[ressel.selectedIndex];

	        //визуальный элемент отображения насоса
	        gColor = {
	            0 : 'fill:url(#grRadial)',  // серый
	            1 : 'fill:url(#fp5)',       // зеленый
	            2 : (PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Res'] && (PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Mode'] == 1)) ? 'fill:url(#fp6)' : 'fill:url(#fp2)',       //желтый или синий
	            3 : 'fill:url(#fp2)',       //синий
	            4 : 'fill:url(#fp7)',       //красный
	            5 : 'fill:url(#fp7)',
	            6 : 'fill:url(#fp7)',
	            7 : 'fill:url(#grRadial)',  //серый
	            8 : 'fill:url(#grRadial)'
	        }
	        var ng = document.getElementById('ND0_STg');
	        ng.setAttribute('style', gColor[PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['ST']]);
        }

        //только для НШ
	    if (csp > 3) {
	        //забираем экземпляр для НД, манипуляции одинаковы, в разделе для всех
	        amsel = document.getElementById('NS0_AMs');

	        //графика состояния насоса
	        var gColor = {
                0 : _colors.grey,
                1 : _colors.green,
                2 : _colors.bluemy,
                3 : _colors.bluemy,
                4 : _colors.red,
                5 : _colors.red,
                6 : _colors.red,
                7 : _colors.grey,
                8 : _colors.grey
	        };
	        document.getElementById('NS0_STg').setAttribute('style', 'fill:' + gColor[PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['ST']]);
	    }

        //для всех
        //режим работы
	    amsel.selectedIndex = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Mode'];
	    if (PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['Mode'] == 2) {
            amsel.disabled = true;
        } else {
            amsel.disabled = false;
        }
        var ambgcolor = {
                0 : _colors.ashBlack,
                1 : _colors.green,
                2 : _colors.darkGrey
        };
        amsel.style.background = ambgcolor[amsel.selectedIndex];

        //содержание текстового элемента состояния
        var nt = document.getElementById('ND0_STtxt');
        nt.textContent = _pState[PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['ST']];
        //фон текстового элемента состояния
        var nbg = document.getElementById('ND0_STbg');
	    nbg.setAttribute('style', _pTxtBgColor[PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['ST']]);

		//обновляем причины блокировки насосов
	    var nt = document.getElementById('ND0_ILtxt');
	    var nbg = document.getElementById('ND0_ILbg');
	    var lock = document.getElementById('ND0_ILimg');
	    nt.textContent = _pIL[PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['IL']];
	    if (nt) {
               switch (PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['IL']) {
   		        case 0:
	                nbg.setAttribute('style', 'fill:#acaaa9;stroke:#000000;stroke-width:0.09950523mm;fill-opacity:1');
	                lock.setAttribute('style', 'display:none');
	                break;
	            case 1:
    	            nbg.setAttribute('style', 'fill:#ed6868;stroke:#000000;stroke-width:0.09950523mm;fill-opacity:1');
    	            lock.setAttribute('style', '');
    	            break;
    	        default:
   		            nbg.setAttribute('style', 'fill:#acaaa9;stroke:#000000;stroke-width:0.09950523mm;fill-opacity:1');
   		            lock.setAttribute('style', '');
   		            break;
	        }
		}

		//непрерывно обновляем
		//только для НД
	    if (csp < 4) {
	        //частоту
            document.getElementById('ND0_FRPV').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['PV'];
        }
        //для всех
        //наработку
        document.getElementById('ND0_MHADay').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MHA_Day'];
        document.getElementById('ND0_MHADaye').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MHA_Daye'];
        document.getElementById('ND0_MHAMonth').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MHA_Month'];
        document.getElementById('ND0_MHAMonthe').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MHA_Monthe'];
        document.getElementById('ND0_MHATotal').value = PUMP_FPTAG_LIST['CONTOUR' + csc][csp]['MHA_Total'];
    } catch(e) {
        throwError('Error updating variables on page:\n ' + e);
	}
}

//Переключение режима работы насоса
function switchMode(sel) {
    if (sel.selectedIndex == 1) {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Mode','1');
    }
    if (sel.selectedIndex == 0) {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Mode','0');
    }
}

//Переключение основной/резервный
function switchRes(sel) {
    if (sel.selectedIndex == 1) {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Res','1');
    }
    if (sel.selectedIndex == 0) {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Res','0');
    }
}

//Переключение ремонт
function switchRem(cb) {
    if (cb.checked) {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Rem','1');
    } else {
        pvAccess.WritePV(USER, 'pump[' + pInd + '].Rem','0');
    }
}

function almRes() {

}

//Запись уставок частоты для НД по клавише Enter
function updateAI(e, inp) {
    if (e.charCode == 13) {
        //имя параметра
        var p = inp.id.substring(inp.id.indexOf('_FR') + 3);
        //запись параметра в контроллер
        pvAccess.WritePV(USER, 'pump[' + pInd + '].' + p, document.getElementById(inp.id).value);
        //переприсвоение временной переменной
        tVal =  document.getElementById(inp.id).value;
//        //сбрасываем бит первого цикла, чтобы обновить все параметры снова
//        fpFirstPass = true;
    }
}

//Запись уставок времени для НШ по клавише Enter
function updateTime(e, inp) {
    if (e.charCode == 13) {
        //имя параметра
        var p = inp.id.substring(inp.id.indexOf('NS0_') + 4);
        //запись параметра в контроллер
        pvAccess.WritePV(USER, 'pump[' + pInd + '].' + p, document.getElementById(inp.id).value);
        //переприсвоение временной переменной
        tVal =  document.getElementById(inp.id).value;
//        //сбрасываем бит первого цикла, чтобы обновить все параметры снова
//        fpFirstPass = true;
    }
}

function test() {
    console.log('it works!');
}